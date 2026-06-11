import * as React from "react";
import { Link } from "@tanstack/react-router";
import { DownloadIcon, SearchIcon, XIcon } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { filterAppeals } from "#/entities/appeal/lib/appeal-filtering";
import {
  APPEAL_CATEGORY_LABELS,
  APPEAL_STATUS_LABELS,
  type AppealCategory,
  type AppealStatus,
} from "#/entities/appeal/model/appeal.schema";
import { mockRepository } from "#/data/mock/mock-repository";
import { formatDate } from "#/shared/lib/date-format";
import { AppealStatusBadge } from "./appeal-status-badge";

const statuses = Object.keys(APPEAL_STATUS_LABELS) as AppealStatus[];
const categories = Object.keys(APPEAL_CATEGORY_LABELS) as AppealCategory[];

export function AppealsListPage() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<AppealStatus | "all">("all");
  const [category, setCategory] = React.useState<AppealCategory | "all">("all");
  const [departmentId, setDepartmentId] = React.useState("all");
  const [overdue, setOverdue] = React.useState(false);
  const appeals = mockRepository.listAppeals();
  const departments = mockRepository.listDepartments();
  const referenceDate = mockRepository.getReferenceDate();
  const filtered = filterAppeals(
    appeals,
    { query, status, category, departmentId, overdue },
    referenceDate,
  ).slice(0, 100);

  function resetFilters() {
    setQuery("");
    setStatus("all");
    setCategory("all");
    setDepartmentId("all");
    setOverdue(false);
  }

  function exportCsv() {
    const rows = [
      ["Номер", "Дата", "Категория", "Статус", "Отдел", "Заявитель"],
      ...filtered.map((appeal) => [
        appeal.appealNumber,
        formatDate(appeal.receivedAt),
        APPEAL_CATEGORY_LABELS[appeal.category],
        APPEAL_STATUS_LABELS[appeal.status],
        departments.find((department) => department.id === appeal.departmentId)?.shortName ?? "",
        appeal.applicant.displayName,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";"))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "synthetic-appeals.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="font-semibold text-2xl">Реестр обращений</h1>
          <p className="text-muted-foreground text-sm">
            Показаны первые 100 строк из текущей выборки, всего найдено {filtered.length}
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <DownloadIcon data-icon="inline-start" />
          Экспорт CSV
        </Button>
      </div>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <div className="relative min-w-64 flex-1">
            <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2 text-muted-foreground" />
            <Input
              className="pl-8"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Номер, тема или заявитель"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as AppealStatus | "all")}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Все статусы</SelectItem>
                {statuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {APPEAL_STATUS_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value as AppealCategory | "all")}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Все категории</SelectItem>
                {categories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {APPEAL_CATEGORY_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={departmentId} onValueChange={(value) => setDepartmentId(value)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Отдел" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Все отделы</SelectItem>
                {departments.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.shortName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            variant={overdue ? "secondary" : "outline"}
            onClick={() => setOverdue((value) => !value)}
          >
            Просрочки
          </Button>
          <Button variant="ghost" onClick={resetFilters}>
            <XIcon data-icon="inline-start" />
            Сбросить
          </Button>
        </CardContent>
      </Card>
      <Card className="rounded-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Номер</TableHead>
                <TableHead>Тема</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Отдел</TableHead>
                <TableHead>Срок</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Обращения не найдены. Измените фильтры или сбросьте поиск.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((appeal) => (
                  <TableRow key={appeal.id}>
                    <TableCell className="font-mono">
                      <Link
                        to="/appeals/$appealId"
                        params={{ appealId: appeal.id }}
                        className="underline-offset-4 hover:underline"
                      >
                        {appeal.appealNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="min-w-72 whitespace-normal">
                      {appeal.subject}
                      <div className="text-muted-foreground text-xs">
                        {appeal.applicant.displayName}
                      </div>
                    </TableCell>
                    <TableCell>{APPEAL_CATEGORY_LABELS[appeal.category]}</TableCell>
                    <TableCell>
                      {
                        departments.find((department) => department.id === appeal.departmentId)
                          ?.shortName
                      }
                    </TableCell>
                    <TableCell>{formatDate(appeal.dueAt)}</TableCell>
                    <TableCell>
                      <AppealStatusBadge status={appeal.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
