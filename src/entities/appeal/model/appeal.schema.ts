import { z } from "zod";
import { CitizenSchema } from "#/entities/citizen/model/citizen.schema";
import { RoleSchema } from "#/entities/rbac/model/role.schema";

const isoDateTime = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Expected ISO datetime");

export const AppealStatusSchema = z.enum([
  "new",
  "in_progress",
  "waiting",
  "resolved",
  "overdue",
  "closed",
]);
export type AppealStatus = z.infer<typeof AppealStatusSchema>;

export const AppealCategorySchema = z.enum([
  "consultation",
  "registration",
  "tax_reporting",
  "debt",
  "complaint",
  "technical_issue",
  "other",
]);
export type AppealCategory = z.infer<typeof AppealCategorySchema>;

export const APPEAL_STATUS_LABELS: Record<AppealStatus, string> = {
  new: "Новое",
  in_progress: "В работе",
  waiting: "Ожидает",
  resolved: "Решено",
  overdue: "Просрочено",
  closed: "Закрыто",
};

export const APPEAL_CATEGORY_LABELS: Record<AppealCategory, string> = {
  consultation: "Консультация",
  registration: "Регистрация",
  tax_reporting: "Налоговая отчетность",
  debt: "Задолженность",
  complaint: "Жалоба",
  technical_issue: "Техническая проблема",
  other: "Иное",
};

export const AppealCommentSchema = z
  .object({
    id: z.string().regex(/^comment_\d{6}_\d{2}$/),
    appealId: z.string().regex(/^appeal_\d{6}$/),
    authorEmployeeId: z.string().regex(/^emp_\d{6}$/),
    authorRole: RoleSchema,
    text: z
      .string()
      .min(3)
      .max(600)
      .refine((value) => !/[<>]/.test(value), "HTML is forbidden"),
    createdAt: isoDateTime,
    visibility: z.literal("internal"),
    synthetic: z.literal(true),
  })
  .strict();
export type AppealComment = z.infer<typeof AppealCommentSchema>;

export const AppealHistoryEventSchema = z
  .object({
    id: z.string().regex(/^history_\d{6}_\d{2}$/),
    appealId: z.string().regex(/^appeal_\d{6}$/),
    type: z.enum(["created", "status_changed", "assigned", "comment_added", "resolved", "closed"]),
    createdAt: isoDateTime,
    actorEmployeeId: z
      .string()
      .regex(/^emp_\d{6}$/)
      .nullable()
      .optional(),
    fromStatus: AppealStatusSchema.nullable().optional(),
    toStatus: AppealStatusSchema.nullable().optional(),
    message: z.string().min(3),
    synthetic: z.literal(true),
  })
  .strict();
export type AppealHistoryEvent = z.infer<typeof AppealHistoryEventSchema>;

export const AppealSchema = z
  .object({
    id: z.string().regex(/^appeal_\d{6}$/),
    appealNumber: z.string().regex(/^SYN-2026-\d{6}$/),
    receivedAt: isoDateTime,
    dueAt: isoDateTime,
    resolvedAt: isoDateTime.nullable().optional(),
    closedAt: isoDateTime.nullable().optional(),
    applicant: CitizenSchema,
    category: AppealCategorySchema,
    subject: z.string().min(6),
    description: z.string().min(20).max(1200),
    departmentId: z.string().regex(/^dep_[a-z_]+$/),
    assigneeId: z
      .string()
      .regex(/^emp_\d{6}$/)
      .nullable()
      .optional(),
    status: AppealStatusSchema,
    priority: z.enum(["low", "normal", "high"]),
    channel: z.enum(["web", "office", "phone", "email", "other"]),
    comments: z.array(AppealCommentSchema),
    history: z.array(AppealHistoryEventSchema),
    synthetic: z.literal(true),
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
  })
  .strict()
  .superRefine((data, ctx) => {
    if (Date.parse(data.dueAt) <= Date.parse(data.receivedAt)) {
      ctx.addIssue({
        code: "custom",
        path: ["dueAt"],
        message: "dueAt must be later than receivedAt",
      });
    }
    if (data.status === "closed" && !data.closedAt) {
      ctx.addIssue({
        code: "custom",
        path: ["closedAt"],
        message: "closed appeals require closedAt",
      });
    }
  });

export type Appeal = z.infer<typeof AppealSchema>;
