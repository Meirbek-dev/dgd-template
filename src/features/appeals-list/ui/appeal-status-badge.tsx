import { Badge } from "#/components/ui/badge";
import { APPEAL_STATUS_LABELS, type AppealStatus } from "#/entities/appeal/model/appeal.schema";

export function AppealStatusBadge({ status }: { status: AppealStatus }) {
  const variant =
    status === "overdue"
      ? "destructive"
      : status === "resolved" || status === "closed"
        ? "secondary"
        : "outline";
  return <Badge variant={variant}>{APPEAL_STATUS_LABELS[status]}</Badge>;
}
