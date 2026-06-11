import type { AppealStatus } from "#/entities/appeal/model/appeal.schema";
import type { Role } from "./role.schema";

export type AppealAction = "assign" | "comment" | "change_status" | "close" | "export";

const ROLE_ACTIONS: Record<Role, AppealAction[]> = {
  manager: ["assign", "comment", "change_status", "close", "export"],
  executor: ["comment", "change_status"],
  admin: ["export"],
};

export function canPerformAction(role: Role, action: AppealAction) {
  return ROLE_ACTIONS[role].includes(action);
}

export function canTransitionStatus(role: Role, from: AppealStatus, to: AppealStatus) {
  if (!canPerformAction(role, "change_status")) return false;
  if (from === "closed") return false;
  if (to === "closed") return canPerformAction(role, "close");
  if (from === "resolved") return false;
  if (from === "new") return ["in_progress", "waiting", "overdue"].includes(to);
  if (from === "in_progress") return ["waiting", "resolved", "overdue"].includes(to);
  if (from === "waiting") return ["in_progress", "resolved", "overdue"].includes(to);
  if (from === "overdue") return ["in_progress", "resolved"].includes(to);
  return false;
}
