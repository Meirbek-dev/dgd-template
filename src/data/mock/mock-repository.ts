import type { Appeal, AppealStatus } from "#/entities/appeal/model/appeal.schema";
import type { Role } from "#/entities/rbac/model/role.schema";
import { DEMO_REFERENCE_DATE } from "./reference-date";
import { mockDb } from "./mock-db";

const STORAGE_KEY = "dgd-template.synthetic.appeals.v1";

function readStoredAppeals() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Appeal[];
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function persist(appeals: Appeal[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appeals));
  }
}

let appealsState: Appeal[] = readStoredAppeals() ?? mockDb.appeals;

export const mockRepository = {
  getReferenceDate: () => DEMO_REFERENCE_DATE,
  listDepartments: () => mockDb.departments,
  listEmployees: () => mockDb.employees,
  listAppeals: () => appealsState,
  getAppeal: (appealId: string) => appealsState.find((appeal) => appeal.id === appealId),
  updateStatus: (appealId: string, status: AppealStatus, role: Role) => {
    const now = DEMO_REFERENCE_DATE.toISOString();
    appealsState = appealsState.map((appeal) =>
      appeal.id === appealId
        ? {
            ...appeal,
            status,
            resolvedAt: status === "resolved" ? now : appeal.resolvedAt,
            closedAt: status === "closed" ? now : appeal.closedAt,
            updatedAt: now,
            history: [
              ...appeal.history,
              {
                id: `history_${appeal.id.slice(-6)}_${String(appeal.history.length + 1).padStart(2, "0")}`,
                appealId,
                type:
                  status === "closed"
                    ? "closed"
                    : status === "resolved"
                      ? "resolved"
                      : "status_changed",
                createdAt: now,
                actorEmployeeId: appeal.assigneeId ?? mockDb.employees[0].id,
                fromStatus: appeal.status,
                toStatus: status,
                message: `Demo-роль ${role} изменила статус обращения.`,
                synthetic: true,
              },
            ],
          }
        : appeal,
    );
    persist(appealsState);
    return appealsState.find((appeal) => appeal.id === appealId);
  },
  addComment: (appealId: string, text: string, role: Role) => {
    const now = DEMO_REFERENCE_DATE.toISOString();
    appealsState = appealsState.map((appeal) =>
      appeal.id === appealId
        ? {
            ...appeal,
            updatedAt: now,
            comments: [
              ...appeal.comments,
              {
                id: `comment_${appeal.id.slice(-6)}_${String(appeal.comments.length + 1).padStart(2, "0")}`,
                appealId,
                authorEmployeeId: appeal.assigneeId ?? mockDb.employees[0].id,
                authorRole: role,
                text,
                createdAt: now,
                visibility: "internal",
                synthetic: true,
              },
            ],
          }
        : appeal,
    );
    persist(appealsState);
    return appealsState.find((appeal) => appeal.id === appealId);
  },
  reset: () => {
    appealsState = mockDb.appeals;
    persist(appealsState);
  },
};
