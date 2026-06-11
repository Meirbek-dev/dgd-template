import { z } from "zod";

const demoEmailSchema = z
  .string()
  .email()
  .refine(
    (value) => /@(example\.invalid|example\.test)$/.test(value),
    "Only demo email domains are allowed",
  );

const syntheticIdSchema = z
  .string()
  .min(8)
  .refine((value) => !/^\d{12}$/.test(value), "Real-looking numeric identifiers are forbidden");

export const CitizenSchema = z
  .object({
    id: z.string().regex(/^citizen_\d{6}$/),
    displayName: z.string().min(3),
    syntheticIdentifier: syntheticIdSchema.regex(/^SYN-CIT-\d{6}$/),
    type: z.enum(["individual", "sole_proprietor", "legal_entity_representative"]),
    email: demoEmailSchema,
    phone: z.string().regex(/^\+7 000 000 \d{2} \d{2}$/),
    addressLine: z.string().regex(/^Синтетический адрес #\d{3}$/),
    synthetic: z.literal(true),
  })
  .strict();

export type Citizen = z.infer<typeof CitizenSchema>;
