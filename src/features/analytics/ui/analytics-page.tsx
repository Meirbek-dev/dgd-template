import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "#/components/ui/chart";
import {
  averageProcessingDays,
  countByStatus,
  departmentOverdueRanking,
} from "#/entities/appeal/lib/appeal-analytics";
import { APPEAL_STATUS_LABELS } from "#/entities/appeal/model/appeal.schema";
import { mockRepository } from "#/data/mock/mock-repository";

export function AnalyticsPage() {
  const appeals = mockRepository.listAppeals();
  const departments = mockRepository.listDepartments();
  const referenceDate = mockRepository.getReferenceDate();
  const statuses = countByStatus(appeals);
  const ranking = departmentOverdueRanking(appeals, departments, referenceDate);
  const resolved = appeals.filter(
    (appeal) => appeal.status === "resolved" || appeal.status === "closed",
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-semibold text-2xl">Аналитика</h1>
        <p className="text-muted-foreground text-sm">
          Срезы по статусам, срокам и отделам на синтетическом наборе данных
        </p>
      </div>
      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Распределение статусов</CardTitle>
            <CardDescription>
              Отдельный статус просрочки сохранен как demo-состояние
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ value: { label: "Количество", color: "var(--chart-2)" } }}
              className="h-80 w-full"
            >
              <BarChart data={statuses} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={64}
                />
                <YAxis tickLine={false} axisLine={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={4}>
                  {statuses.map((item, index) => (
                    <Cell key={item.status} fill={`var(--chart-${(index % 5) + 1})`} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Контроль сроков по отделам</CardTitle>
            <CardDescription>Рейтинг рассчитан от текущей фиксированной даты</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {ranking.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border p-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {item.overdue} просрочено из {item.total}
                  </p>
                </div>
                <p className="font-mono text-2xl">{item.ratio}%</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Сводка обработки</CardTitle>
          <CardDescription>
            Среднее значение считается только по закрытым и решенным обращениям
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Summary
            label="Средняя обработка"
            value={`${averageProcessingDays(resolved, referenceDate)} дн.`}
          />
          <Summary
            label="Закрыто"
            value={String(
              statuses.find((item) => item.label === APPEAL_STATUS_LABELS.closed)?.value ?? 0,
            )}
          />
          <Summary
            label="Решено"
            value={String(
              statuses.find((item) => item.label === APPEAL_STATUS_LABELS.resolved)?.value ?? 0,
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="mt-2 font-mono text-3xl">{value}</p>
    </div>
  );
}
