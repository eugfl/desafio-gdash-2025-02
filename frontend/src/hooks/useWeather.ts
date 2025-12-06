import { useState, useEffect } from "react";
import weatherService from "@/services/weather.service";
import type { WeatherLog, WeatherStats } from "@/types/weather.types";
import { toast } from "sonner";

export const useWeather = (city?: string) => {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [latestLog, setLatestLog] = useState<WeatherLog | null>(null);
  const [stats, setStats] = useState<WeatherStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await weatherService.getLogs({
        limit: 10,
        city,
      });
      setLogs(response.data);
      if (response.data.length > 0) {
        setLatestLog(response.data[0]);
      }
    } catch (err: any) {
      setError(err.message);
      toast("Erro ao carregar dados climáticos", {
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await weatherService.getStats(city);
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    }
  };

  const exportCSV = async () => {
    try {
      toast("Gerando CSV...", {
        description: "Aguarde enquanto preparamos o arquivo",
      });

      const blob = await weatherService.exportCSV({ city });
      const filename = `weather-logs-${Date.now()}.csv`;
      weatherService.downloadFile(blob, filename);

      toast("CSV exportado!", {
        description: "Download iniciado com sucesso",
      });
    } catch (err: any) {
      toast("Erro ao exportar CSV", {
        description: err.message,
      });
    }
  };

  const exportXLSX = async () => {
    try {
      toast("Gerando Excel...", {
        description: "Aguarde enquanto preparamos o arquivo",
      });

      const blob = await weatherService.exportXLSX({ city });
      const filename = `weather-logs-${Date.now()}.xlsx`;
      weatherService.downloadFile(blob, filename);

      toast("Excel exportado!", {
        description: "Download iniciado com sucesso",
      });
    } catch (err: any) {
      toast("Erro ao exportar Excel", {
        description: err.message,
      });
    }
  };

  const refresh = () => {
    fetchLogs();
    fetchStats();
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [city]);

  return {
    logs,
    latestLog,
    stats,
    isLoading,
    error,
    exportCSV,
    exportXLSX,
    refresh,
  };
};
