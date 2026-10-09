import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9-]{1,60}$/);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

/** What the public estimate form submits. Prices are never accepted from the browser. */
export const estimateSubmissionSchema = z.object({
  category: slug,
  pages: z.coerce.number().int().min(1).max(200),
  features: z.array(slug).max(40).default([]),
  integrations: z.array(slug).max(40).default([]),
  hosting: slug.nullable().default(null),
  addons: z.array(slug).max(20).default([]),
  description: optionalText(4000),
  timeline: z.enum(["asap", "1-month", "2-3-months", "flexible"]).optional(),
  budget: z.enum(["under-2k", "2k-5k", "5k-10k", "10k-25k", "25k-plus", "not-sure"]).optional(),
  name: z.string().trim().min(1, "Tell me your name").max(120),
  email: z.email("Enter a valid email").max(320),
  company: optionalText(160),
  phone: optionalText(40),
  address: z
    .object({
      line1: optionalText(200),
      line2: optionalText(200),
      city: optionalText(120),
      region: optionalText(120),
      postalCode: optionalText(20),
      country: optionalText(120),
      placeId: optionalText(300),
    })
    .partial()
    .prefault({}),
  consent: z.literal(true, { error: "Please agree to the privacy policy so I can reply." }),
  // Honeypot: real people never see or fill this.
  website: z.string().max(0).optional(),
});

export type EstimateSubmission = z.input<typeof estimateSubmissionSchema>;

export const TIMELINE_LABELS: Record<string, string> = {
  asap: "As soon as possible",
  "1-month": "Within a month",
  "2-3-months": "In 2–3 months",
  flexible: "Flexible",
};

export const BUDGET_LABELS: Record<string, string> = {
  "under-2k": "Under $2,000",
  "2k-5k": "$2,000 – $5,000",
  "5k-10k": "$5,000 – $10,000",
  "10k-25k": "$10,000 – $25,000",
  "25k-plus": "$25,000+",
  "not-sure": "Not sure yet",
};
