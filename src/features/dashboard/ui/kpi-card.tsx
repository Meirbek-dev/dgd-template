import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { formatMetric } from "#/shared/lib/number-format";

type KpiCardProps = {
  label: string;
  value: number;
  unit?: "count" | "days" | "percent";
  severity: "neutral" | "warning" | "critical" | "positive";
};

export function KpiCard({ label, value, unit, severity }: KpiCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl tabular-nums">{formatMetric(value, unit)}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          data-severity={severity}
          className="h-1.5 rounded-full bg-muted data-[severity=critical]:bg-destructive data-[severity=positive]:bg-primary data-[severity=warning]:bg-chart-3"
        />
      </CardContent>
    </Card>
  );
}
