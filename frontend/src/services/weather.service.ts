import api from "./api";
import type {
  WeatherLogsResponse,
  WeatherStats,
  WeatherLog,
} from "@/types/weather.types";

class WeatherService {
  async getLogs(params?: {
    page?: number;
    limit?: number;
    city?: string;
  }): Promise<WeatherLogsResponse> {
    const response = await api.get<WeatherLogsResponse>("/weather/logs", {
      params,
    });
    return response.data;
  }

  async getLogById(id: string): Promise<WeatherLog> {
    const response = await api.get<WeatherLog>(`/weather/logs/${id}`);
    return response.data;
  }

  async getStats(city?: string): Promise<WeatherStats | null> {
    const response = await api.get<WeatherStats>("/weather/stats", {
      params: { city },
    });
    return response.data;
  }

  async exportCSV(params?: {
    city?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await api.get("/weather/export/csv", {
      params,
      responseType: "blob",
    });
    return response.data;
  }

  async exportXLSX(params?: {
    city?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const response = await api.get("/weather/export/xlsx", {
      params,
      responseType: "blob",
    });
    return response.data;
  }

  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export default new WeatherService();
