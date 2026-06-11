import { z } from "zod";

export const RoleSchema = z.enum(["manager", "executor", "admin"]);
export type Role = z.infer<typeof RoleSchema>;

export const ROLE_LABELS: Record<Role, string> = {
  manager: "Руководитель",
  executor: "Исполнитель",
  admin: "Администратор",
};
