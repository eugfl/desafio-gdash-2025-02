import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Droplets, Wind, CloudRain } from "lucide-react";
import type { WeatherLog } from "@/types/weather.types";

interface WeatherCardProps {
  log: WeatherLog;
}

export function WeatherCard({ log }: WeatherCardProps) {
  const { weather, location, timestamp } = log;

  const getConditionIcon = (condition: string) => {
    if (condition.includes("chuva") || condition.includes("chuvisco")) {
      return <CloudRain className="h-12 w-12 text-blue-500" />;
    }
    return <Cloud className="h-12 w-12 text-gray-400" />;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📍 {location.city}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Temperatura principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getConditionIcon(weather.condition)}
            <div>
              <p className="text-5xl font-bold">
                {Math.round(weather.temperature)}°C
              </p>
              <p className="text-muted-foreground capitalize">
                {weather.condition}
              </p>
            </div>
          </div>
        </div>

        {/* Grid de informações */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Umidade</p>
              <p className="text-lg font-semibold">{weather.humidity}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-muted-foreground">Vento</p>
              <p className="text-lg font-semibold">{weather.wind_speed} km/h</p>
            </div>
          </div>

          {weather.precipitation_mm !== undefined && (
            <div className="flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-muted-foreground">Chuva</p>
                <p className="text-lg font-semibold">
                  {weather.precipitation_mm} mm
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          Atualizado: {formatDate(timestamp)}
        </div>
      </CardContent>
    </Card>
  );
}
