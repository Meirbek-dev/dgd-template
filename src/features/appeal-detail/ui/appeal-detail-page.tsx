import * as React from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeftIcon, MessageSquareIcon } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import {
  APPEAL_CATEGORY_LABELS,
  APPEAL_STATUS_LABELS,
  type AppealStatus,
} from "#/entities/appeal/model/appeal.schema";
import { canPerformAction, canTransitionStatus } from "#/entities/rbac/model/permissions";
import { mockRepository } from "#/data/mock/mock-repository";
import { useDemoRole } from "#/features/demo-rbac/model/demo-role.store";
import { formatDate } from "#/shared/lib/date-format";
import { AppealStatusBadge } from "#/features/appeals-list/ui/appeal-status-badge";

const statuses = Object.keys(APPEAL_STATUS_LABELS) as AppealStatus[];

export function AppealDetailPage({ appealId }: { appealId: string }) {
  const { role } = useDemoRole();
  const [revision, setRevision] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const appeal = mockRepository.getAppeal(appealId);
  const employees = mockRepository.listEmployees();
  const departments = mockRepository.listDepartments();

  if (!appeal) {
    return (
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Обращение не найдено</CardTitle>
          <CardDescription>Проверьте demo-номер или вернитесь в реестр.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/appeals">В реестр</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentAppeal = appeal;
  const department = departments.find((item) => item.id === appeal.departmentId);
  const assignee = employees.find((item) => item.id === appeal.assigneeId);

  function updateStatus(status: AppealStatus) {
    if (!canTransitionStatus(role, currentAppeal.status, status)) {
      toast("Действие недоступно для выбранной demo-роли");
      return;
    }
    mockRepository.updateStatus(currentAppeal.id, status, role);
    setRevision(revision + 1);
    toast("Статус обращения изменен");
  }

  function addComment() {
    if (!canPerformAction(role, "comment") || comment.trim().length < 3) {
      toast("Комментарий недоступен или слишком короткий");
      return;
    }
    mockRepository.addComment(currentAppeal.id, comment.trim(), role);
    setComment("");
    setRevision(revision + 1);
    toast("Комментарий добавлен");
  }

  return (
    <div className="flex flex-col gap-4">
      <Button asChild variant="ghost" className="w-fit">
        <Link to="/appeals">
          <ArrowLeftIcon data-icon="inline-start" />В реестр
        </Link>
      </Button>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              {appeal.appealNumber}
              <AppealStatusBadge status={appeal.status} />
            </CardTitle>
            <CardDescription>
              {APPEAL_CATEGORY_LABELS[appeal.category]} · поступило {formatDate(appeal.receivedAt)}{" "}
              · срок {formatDate(appeal.dueAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <h1 className="font-semibold text-2xl">{appeal.subject}</h1>
              <p className="mt-2 text-muted-foreground">{appeal.description}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Info
                label="Заявитель"
                value={`${appeal.applicant.displayName} · ${appeal.applicant.syntheticIdentifier}`}
              />
              <Info label="Отдел" value={department?.name ?? "Не назначен"} />
              <Info label="Исполнитель" value={assignee?.displayName ?? "Не назначен"} />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Mock-действия</CardTitle>
            <CardDescription>Роль управляет только видимостью demo-операций</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Select
              value={appeal.status}
              onValueChange={(value) => updateStatus(value as AppealStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {APPEAL_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Внутренний комментарий"
            />
            <Button onClick={addComment}>
              <MessageSquareIcon data-icon="inline-start" />
              Добавить комментарий
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>История</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {appeal.history.map((event) => (
              <Info key={event.id} label={formatDate(event.createdAt)} value={event.message} />
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Комментарии</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {appeal.comments.length ? (
              appeal.comments.map((item) => (
                <Info
                  key={item.id}
                  label={`${formatDate(item.createdAt)} · ${item.authorRole}`}
                  value={item.text}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-sm">Комментариев пока нет.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
