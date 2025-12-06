import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface InsightsSectionProps {
  insights: string[];
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Insights da IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="flex gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <span className="text-2xl">💡</span>
            <p className="text-sm flex-1">{insight}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
