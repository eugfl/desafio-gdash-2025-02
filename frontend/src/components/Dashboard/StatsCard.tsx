import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import type { WeatherStats } from "@/types/weather.types";

interface StatsCardProps {
  stats: WeatherStats | null;
}

export function StatsCard({ stats }: StatsCardProps) {
  if (!stats) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Estatísticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Temp. Média</p>
            <p className="text-2xl font-bold">{stats.avgTemp.toFixed(1)}°C</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Umidade Média</p>
            <p className="text-2xl font-bold">
              {stats.avgHumidity.toFixed(1)}%
            </p>
          </div>

          <div className="space-y-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Máxima</p>
              <p className="text-xl font-semibold">
                {stats.maxTemp.toFixed(1)}°C
              </p>
            </div>
          </div>

          <div className="space-y-1 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Mínima</p>
              <p className="text-xl font-semibold">
                {stats.minTemp.toFixed(1)}°C
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t">
          <p className="text-sm text-muted-foreground">
            Baseado em {stats.count} registros
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
