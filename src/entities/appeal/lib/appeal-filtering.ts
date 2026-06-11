import type { Appeal, AppealCategory, AppealStatus } from "../model/appeal.schema";
import { isAppealOverdue } from "./appeal-overdue";

export type AppealFilters = {
  query?: string;
  status?: AppealStatus | "all";
  category?: AppealCategory | "all";
  departmentId?: string;
  overdue?: boolean;
};

export function filterAppeals(appeals: Appeal[], filters: AppealFilters, referenceDate: Date) {
  const query = filters.query?.trim().toLowerCase();
  return appeals.filter((appeal) => {
    if (filters.status && filters.status !== "all" && appeal.status !== filters.status)
      return false;
    if (filters.category && filters.category !== "all" && appeal.category !== filters.category)
      return false;
    if (
      filters.departmentId &&
      filters.departmentId !== "all" &&
      appeal.departmentId !== filters.departmentId
    )
      return false;
    if (filters.overdue && !isAppealOverdue(appeal, referenceDate)) return false;
    if (!query) return true;
    return [
      appeal.appealNumber,
      appeal.subject,
      appeal.applicant.displayName,
      appeal.applicant.syntheticIdentifier,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}
