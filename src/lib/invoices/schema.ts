import { z } from "zod";

/** Admin "new invoice" form. Amounts arrive in cents (the form converts with parseDollarsToCents). */
export const createInvoiceSchema = z.object({
  clientId: z.uuid(),
  dueDate: z.iso.date(),
  currency: z.enum(["cad", "usd"]).default("cad"),
  notes: z.string().trim().max(2000).optional(),
  lineItems: z
    .array(
      z.object({
        description: z.string().trim().min(1, "Describe the work").max(500),
        quantity: z.coerce.number().int().min(1).max(10_000),
        unitAmount: z.coerce.number().int().min(0).max(100_000_000), // cents, up to $1M per unit
      }),
    )
    .min(1, "Add at least one line item")
    .max(50),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const invoiceIdSchema = z.object({ invoiceId: z.uuid() });
