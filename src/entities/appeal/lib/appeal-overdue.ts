import type { Appeal } from "../model/appeal.schema";

import type { AppealStatus } from "../model/appeal.schema";

const ACTIVE_STATUSES: AppealStatus[] = ["new", "in_progress", "waiting", "overdue"];

export function isAppealOverdue(appeal: Appeal, referenceDate: Date) {
  return (
    ACTIVE_STATUSES.includes(appeal.status) && Date.parse(appeal.dueAt) < referenceDate.getTime()
  );
}

export function processingDays(appeal: Appeal, referenceDate: Date) {
  const end = appeal.resolvedAt ?? appeal.closedAt ?? referenceDate.toISOString();
  return Math.max(1, Math.ceil((Date.parse(end) - Date.parse(appeal.receivedAt)) / 86_400_000));
}
