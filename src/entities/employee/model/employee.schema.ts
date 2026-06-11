import { z } from "zod";

export const EmployeeSchema = z
  .object({
    id: z.string().regex(/^emp_\d{6}$/),
    displayName: z.string().min(3),
    departmentId: z.string().regex(/^dep_[a-z_]+$/),
    position: z.string().min(3),
    email: z
      .string()
      .email()
      .regex(/@example\.invalid$/),
    isActive: z.boolean(),
    synthetic: z.literal(true),
  })
  .strict();

export type Employee = z.infer<typeof EmployeeSchema>;
