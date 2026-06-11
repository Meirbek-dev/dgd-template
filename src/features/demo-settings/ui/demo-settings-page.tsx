import { Button } from "#/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { mockRepository } from "#/data/mock/mock-repository";
import { DEMO_DATASET_SIZE, DEMO_SEED } from "#/data/mock/seed";
import { inspectSyntheticQuality } from "#/data/mock/synthetic-quality";
import { formatDate } from "#/shared/lib/date-format";

export function DemoSettingsPage() {
  const appeals = mockRepository.listAppeals();
  const departments = mockRepository.listDepartments();
  const employees = mockRepository.listEmployees();
  const quality = inspectSyntheticQuality(appeals);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-semibold text-2xl">Demo-настройки</h1>
        <p className="text-muted-foreground text-sm">
          Технический контроль генерации, справочников и synthetic data guardrails
        </p>
      </div>
      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Генератор</CardTitle>
            <CardDescription>Детерминированный mock-набор</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <Row label="Seed" value={String(DEMO_SEED)} />
            <Row label="Размер" value={String(DEMO_DATASET_SIZE)} />
            <Row label="Reference date" value={formatDate(mockRepository.getReferenceDate())} />
            <Button
              variant="outline"
              onClick={() => {
                mockRepository.reset();
                window.location.reload();
              }}
            >
              Сбросить mock-изменения
            </Button>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Качество данных</CardTitle>
            <CardDescription>Проверки выполняются над текущим состоянием</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <Row label="Записи" value={String(quality.records)} />
            <Row label="Demo email domains" value={quality.emailsOk ? "пройдено" : "ошибка"} />
            <Row label="Synthetic flags" value={quality.syntheticOk ? "пройдено" : "ошибка"} />
            <Row label="12-значные ID" value={quality.identifiersOk ? "не найдены" : "ошибка"} />
            <Row label="Внешние URL" value={String(quality.externalUrls)} />
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Справочники</CardTitle>
            <CardDescription>Минимальный набор для фильтров и назначения</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <Row label="Отделы" value={String(departments.length)} />
            <Row label="Сотрудники" value={String(employees.length)} />
            <Row label="Роли" value="manager, executor, admin" />
            <Row label="Внешние API" value="не используются" />
          </CardContent>
        </Card>
      </section>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Справочник отделов</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((department) => (
            <div key={department.id} className="rounded-lg border p-3">
              <p className="font-medium">{department.name}</p>
              <p className="text-muted-foreground text-sm">{department.code}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-muted/50 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
