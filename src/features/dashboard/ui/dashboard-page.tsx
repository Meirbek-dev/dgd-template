import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "#/components/ui/chart";
import {
  dashboardMetrics,
  buildDailyIntake,
  countByCategory,
  departmentOverdueRanking,
} from "#/entities/appeal/lib/appeal-analytics";
import { mockRepository } from "#/data/mock/mock-repository";
import { KpiCard } from "./kpi-card";

export function DashboardPage() {
  const appeals = mockRepository.listAppeals();
  const referenceDate = mockRepository.getReferenceDate();
  const departments = mockRepository.listDepartments();
  const metrics = dashboardMetrics(appeals, referenceDate);
  const intake = buildDailyIntake(appeals);
  const categories = countByCategory(appeals).filter((item) => item.value > 0);
  const ranking = departmentOverdueRanking(appeals, departments, referenceDate).slice(0, 5);

  return (
    <div className="flex flex-col gap-5">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <KpiCard key={metric.id} {...metric} />
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Динамика поступления</CardTitle>
            <CardDescription>Последние 14 дней по фиксированной demo-дате</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ value: { label: "Обращения", color: "var(--chart-2)" } }}
              className="h-72 w-full"
            >
              <LineChart data={intake} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Нагрузка категорий</CardTitle>
            <CardDescription>Распределение синтетических обращений</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ value: { label: "Количество", color: "var(--chart-4)" } }}
              className="h-72 w-full"
            >
              <BarChart
                data={categories}
                accessibilityLayer
                layout="vertical"
                margin={{ left: 12 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="label"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={4}>
                  {categories.map((item, index) => (
                    <Cell key={item.category} fill={`var(--chart-${(index % 5) + 1})`} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Отделы с наибольшими просрочками</CardTitle>
          <CardDescription>
            Показывает, где руководителю стоит проверить нагрузку и маршрутизацию
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          {ranking.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <p className="font-medium">{item.name}</p>
              <p className="text-muted-foreground text-sm">
                {item.overdue} из {item.total}
              </p>
              <p className="mt-2 font-mono text-2xl">{item.ratio}%</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
