import { z } from "zod";

export const DepartmentSchema = z
  .object({
    id: z.string().regex(/^dep_[a-z_]+$/),
    name: z.string().min(3),
    shortName: z.string().min(3),
    code: z.string().regex(/^DEP-[A-Z-]+$/),
    isActive: z.boolean(),
  })
  .strict();

export type Department = z.infer<typeof DepartmentSchema>;
