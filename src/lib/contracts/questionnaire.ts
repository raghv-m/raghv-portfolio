import { z } from "zod";

/**
 * The onboarding questionnaire a client fills in from their portal. Its answers fill in the
 * services agreement automatically. Shared by the form (labels, options) and the server (schema).
 */

export const PAYMENT_METHODS = ["Interac e-Transfer", "Bank transfer (EFT)", "Credit card (via secure payment link)", "Cheque"] as const;
export const PAYMENT_SCHEDULES = {
  "40-40-20": "40% deposit, 40% at design approval, 20% at launch",
  "50-50": "50% deposit, 50% at launch",
  "100-upfront": "100% before work starts",
} as const;
export const BUSINESS_TYPES = ["Sole proprietorship", "Corporation", "Partnership", "Non-profit / charity", "Individual (personal project)"] as const;

const text = (max: number) => z.string().trim().max(max);
const required = (max: number, message: string) => z.string().trim().min(1, message).max(max);

export const questionnaireSchema = z.object({
  // About your business (becomes the "Client" party on the contract)
  legalName: required(200, "Your legal business name is required (or your full name for a personal project)"),
  operatingName: text(200).optional(),
  businessType: z.enum(BUSINESS_TYPES),
  addressLine1: required(200, "A mailing address is required for the contract"),
  addressLine2: text(200).optional(),
  city: required(120, "City is required"),
  region: required(120, "Province / state is required"),
  postalCode: required(20, "Postal code is required"),
  country: required(120, "Country is required"),
  phone: text(40).optional(),
  // Who signs
  signerName: required(120, "Who will sign the agreement?"),
  signerTitle: required(120, "Their title (e.g. Owner, Director)"),
  signerEmail: z.email("Enter a valid email for the signer"),
  // The project
  projectGoals: required(4000, "Tell me what the project should achieve"),
  audience: text(2000).optional(),
  mustHaves: text(4000).optional(),
  pagesList: text(2000).optional(),
  referenceSites: text(2000).optional(),
  contentReady: z.enum(["all", "some", "none"]),
  brandAssets: z.enum(["yes", "partly", "no"]),
  domainStatus: z.enum(["have-domain", "need-domain", "not-sure"]),
  hostingNotes: text(1000).optional(),
  targetLaunch: z.iso.date().optional().or(z.literal("").transform(() => undefined)),
  // Payment
  paymentMethod: z.enum(PAYMENT_METHODS),
  paymentSchedule: z.enum(Object.keys(PAYMENT_SCHEDULES) as [keyof typeof PAYMENT_SCHEDULES, ...(keyof typeof PAYMENT_SCHEDULES)[]]),
  billingEmail: z.email("Enter a valid billing email"),
  // Anything else
  notes: text(4000).optional(),
  consentElectronic: z.literal(true, { error: "Please agree to receive and sign documents electronically" }),
});

export type QuestionnaireAnswers = z.infer<typeof questionnaireSchema>;
