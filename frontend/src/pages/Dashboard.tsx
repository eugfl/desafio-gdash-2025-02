import { useAuth } from "@/hooks/useAuth";
import { useWeather } from "@/hooks/useWeather";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Layout/Navbar";
import { WeatherCard } from "@/components/Dashboard/WeatherCard";
import { PokemonCard } from "@/components/Dashboard/PokemonCard";
import { InsightsSection } from "@/components/Dashboard/InsightsSection";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { WeatherChart } from "@/components/Dashboard/WeatherChart";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Download, FileSpreadsheet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Dashboard() {
  const { user } = useAuth();
  const {
    logs,
    latestLog,
    stats,
    isLoading,
    error,
    exportCSV,
    exportXLSX,
    refresh,
  } = useWeather(user?.city);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onRefresh={refresh} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Olá, {user?.name}! 👋
            </h2>
            <p className="text-muted-foreground">
              Aqui estão os dados climáticos mais recentes
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={exportCSV}
            >
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={exportXLSX}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-8">
            <Skeleton className="h-64 w-full" />
            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar dados</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* No Data State */}
        {!isLoading && !error && !latestLog && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Nenhum dado disponível</AlertTitle>
            <AlertDescription>
              Aguarde alguns minutos para que o sistema colete os dados
              climáticos da sua cidade. A coleta acontece automaticamente a cada
              hora.
            </AlertDescription>
          </Alert>
        )}

        {/* Content */}
        {!isLoading && !error && latestLog && (
          <div className="space-y-8">
            {/* Weather Card + Stats */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <WeatherCard log={latestLog} />
              </div>
              <StatsCard stats={stats} />
            </div>

            {/* Chart */}
            {logs.length > 1 && <WeatherChart logs={logs} />}

            {/* Insights */}
            {latestLog.insights.length > 0 && (
              <InsightsSection insights={latestLog.insights} />
            )}

            {/* Pokémons */}
            {latestLog.pokemon_suggestions.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4">
                  🎮 Pokémons Recomendados
                </h3>
                <p className="text-muted-foreground mb-6">
                  Baseado nas condições climáticas atuais
                </p>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {latestLog.pokemon_suggestions.map((pokemon, index) => (
                    <PokemonCard key={index} pokemon={pokemon} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
