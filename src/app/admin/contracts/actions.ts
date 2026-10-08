"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { draftContract, sendContract, sendQuestionnaire, updateContract, voidContract } from "@/lib/contracts/service";
import type { ContractVariables } from "@/lib/contracts/template";
import { requestOrigin } from "@/lib/origin";
import { requireAdmin } from "@/lib/session";

type ActionResult = { ok: true } | { ok: false; error: string };
const id = z.uuid();

function refresh(contractId?: string) {
  revalidatePath("/admin/contracts");
  if (contractId) revalidatePath(`/admin/contracts/${contractId}`);
  revalidatePath("/portal");
}

export async function sendQuestionnaireAction(clientId: string): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  if (!id.safeParse(clientId).success) return { ok: false, error: "Invalid client" };
  const result = await sendQuestionnaire(userId, clientId, await requestOrigin());
  revalidatePath("/admin/clients");
  return result.ok ? { ok: true } : result;
}

export async function draftContractAction(clientId: string): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  if (!id.safeParse(clientId).success) return { ok: false, error: "Invalid client" };
  const result = await draftContract(userId, clientId);
  if (!result.ok) return result;
  refresh();
  redirect(`/admin/contracts/${result.data.id}`);
}

const variablesSchema = z.object({
  provider: z.object({ name: z.string(), legalName: z.string(), address: z.string(), email: z.string(), website: z.string() }),
  client: z.object({
    legalName: z.string().trim().min(1).max(200),
    operatingName: z.string().trim().max(200).optional(),
    businessType: z.string().max(80).optional(),
    address: z.string().trim().min(1).max(400),
    signerName: z.string().trim().min(1).max(120),
    signerTitle: z.string().trim().min(1).max(120),
    email: z.email(),
  }),
  effectiveDate: z.iso.date(),
  projectTitle: z.string().trim().min(1).max(200),
  scope: z.array(z.string().trim().min(1).max(500)).min(1).max(40),
  clientGoals: z.string().max(4000).optional(),
  exclusions: z.array(z.string().trim().min(1).max(500)).max(30),
  startDate: z.iso.date().optional(),
  targetLaunch: z.iso.date().optional(),
  feeCents: z.number().int().min(0).max(100_000_000),
  currency: z.enum(["cad", "usd"]),
  schedule: z.array(z.object({ label: z.string().trim().min(1).max(120), pct: z.number().min(0).max(100) })).min(1).max(8)
    .refine((s) => Math.abs(s.reduce((sum, p) => sum + p.pct, 0) - 100) < 0.001, "Payment schedule must add up to 100%"),
  paymentMethods: z.array(z.string().trim().min(1).max(120)).min(1).max(8),
  paymentTermsDays: z.number().int().min(0).max(120),
  lateInterestMonthlyPct: z.number().min(0).max(5),
  lateInterestAnnualPct: z.number().min(0).max(80),
  gstRegistered: z.boolean(),
  gstNumber: z.string().nullable().optional(),
  monthly: z.object({ cents: z.number().int().min(0), description: z.string().max(200) }).nullable().optional(),
  revisionRounds: z.number().int().min(0).max(10),
  warrantyDays: z.number().int().min(0).max(365),
  jurisdiction: z.string().min(1).max(80),
});

export async function updateContractTermsAction(contractId: string, variables: unknown): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  if (!id.safeParse(contractId).success) return { ok: false, error: "Invalid contract" };
  const parsed = variablesSchema.safeParse(variables);
  if (!parsed.success) return { ok: false, error: `${parsed.error.issues[0]?.path.join(".")}: ${parsed.error.issues[0]?.message}` };
  const result = await updateContract(userId, contractId, { variables: parsed.data as ContractVariables });
  refresh(contractId);
  return result.ok ? { ok: true } : result;
}

export async function updateContractTextAction(contractId: string, body: string): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  if (!id.safeParse(contractId).success || typeof body !== "string" || body.length > 200_000) return { ok: false, error: "Invalid input" };
  const result = await updateContract(userId, contractId, { body });
  refresh(contractId);
  return result.ok ? { ok: true } : result;
}

export async function sendContractAction(contractId: string, signatureName: string): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const name = z.string().trim().min(2).max(120).safeParse(signatureName);
  if (!id.safeParse(contractId).success || !name.success) return { ok: false, error: "Type your full name to sign" };
  const result = await sendContract(userId, contractId, name.data, await requestOrigin());
  refresh(contractId);
  return result.ok ? { ok: true } : result;
}

export async function voidContractAction(contractId: string): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  if (!id.safeParse(contractId).success) return { ok: false, error: "Invalid contract" };
  const result = await voidContract(userId, contractId);
  refresh(contractId);
  return result.ok ? { ok: true } : result;
}
