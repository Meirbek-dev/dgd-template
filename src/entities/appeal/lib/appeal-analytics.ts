import type { Department } from "#/entities/department/model/department.schema";
import type { Appeal, AppealCategory, AppealStatus } from "../model/appeal.schema";
import { APPEAL_CATEGORY_LABELS, APPEAL_STATUS_LABELS } from "../model/appeal.schema";
import { isAppealOverdue, processingDays } from "./appeal-overdue";

export function countByStatus(appeals: Appeal[]) {
  return Object.keys(APPEAL_STATUS_LABELS).map((status) => ({
    status: status as AppealStatus,
    label: APPEAL_STATUS_LABELS[status as AppealStatus],
    value: appeals.filter((appeal) => appeal.status === status).length,
  }));
}

export function countByCategory(appeals: Appeal[]) {
  return Object.keys(APPEAL_CATEGORY_LABELS).map((category) => ({
    category: category as AppealCategory,
    label: APPEAL_CATEGORY_LABELS[category as AppealCategory],
    value: appeals.filter((appeal) => appeal.category === category).length,
  }));
}

export function buildDailyIntake(appeals: Appeal[]) {
  const buckets = new Map<string, number>();
  for (const appeal of appeals) {
    const key = appeal.receivedAt.slice(5, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return Array.from(buckets.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-14)
    .map(([date, value]) => ({ date, value }));
}

export function averageProcessingDays(appeals: Appeal[], referenceDate: Date) {
  if (appeals.length === 0) return 0;
  const total = appeals.reduce((sum, appeal) => sum + processingDays(appeal, referenceDate), 0);
  return Number((total / appeals.length).toFixed(1));
}

export function departmentOverdueRanking(
  appeals: Appeal[],
  departments: Department[],
  referenceDate: Date,
) {
  return departments
    .map((department) => {
      const items = appeals.filter((appeal) => appeal.departmentId === department.id);
      const overdue = items.filter((appeal) => isAppealOverdue(appeal, referenceDate)).length;
      return {
        id: department.id,
        name: department.shortName,
        total: items.length,
        overdue,
        ratio: items.length ? Math.round((overdue / items.length) * 100) : 0,
      };
    })
    .sort((left, right) => right.overdue - left.overdue);
}

export function dashboardMetrics(appeals: Appeal[], referenceDate: Date) {
  const active = appeals.filter((appeal) => !["closed", "resolved"].includes(appeal.status));
  const overdue = appeals.filter((appeal) => isAppealOverdue(appeal, referenceDate));
  const resolved = appeals.filter(
    (appeal) => appeal.status === "resolved" || appeal.status === "closed",
  );
  return [
    {
      id: "total",
      label: "Всего обращений",
      value: appeals.length,
      unit: "count" as const,
      severity: "neutral" as const,
    },
    {
      id: "active",
      label: "В активной работе",
      value: active.length,
      unit: "count" as const,
      severity: "neutral" as const,
    },
    {
      id: "overdue",
      label: "Просрочено",
      value: overdue.length,
      unit: "count" as const,
      severity: "critical" as const,
    },
    {
      id: "avg",
      label: "Средняя обработка",
      value: averageProcessingDays(resolved, referenceDate),
      unit: "days" as const,
      severity: "positive" as const,
    },
  ];
}
