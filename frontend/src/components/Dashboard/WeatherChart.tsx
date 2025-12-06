import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { WeatherLog } from "@/types/weather.types";

interface WeatherChartProps {
  logs: WeatherLog[];
}

export function WeatherChart({ logs }: WeatherChartProps) {
  if (!logs || logs.length === 0) {
    return null;
  }

  // Preparar dados para o gráfico (reverter para ordem cronológica)
  const chartData = [...logs]
    .reverse()
    .slice(0, 10) // Últimos 10 registros
    .map((log) => ({
      time: new Date(log.timestamp).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      temperatura: log.weather.temperature,
      umidade: log.weather.humidity,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico Climático</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temperatura"
              stroke="#ef4444"
              strokeWidth={2}
              name="Temperatura (°C)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="umidade"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Umidade (%)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
