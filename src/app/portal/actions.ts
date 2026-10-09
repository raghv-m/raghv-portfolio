"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { questionnaireSchema } from "@/lib/contracts/questionnaire";
import { signContract, submitQuestionnaire } from "@/lib/contracts/service";
import { getClientIp, hashIp } from "@/lib/rateLimit";
import { requirePortalUser } from "@/lib/session";

type ActionResult = { ok: true } | { ok: false; error: string };

/** Client submits their onboarding questionnaire (only their own, only once). */
export async function submitQuestionnaireAction(questionnaireId: string, answers: unknown): Promise<ActionResult> {
  const { userId } = await requirePortalUser();
  if (!z.uuid().safeParse(questionnaireId).success) return { ok: false, error: "Questionnaire not found" };
  const parsed = questionnaireSchema.safeParse(answers);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form" };
  const result = await submitQuestionnaire(userId, questionnaireId, parsed.data);
  revalidatePath("/portal");
  return result.ok ? { ok: true } : result;
}

const signatureSchema = z.object({
  name: z.string().trim().min(2, "Type your full name to sign").max(120),
  title: z.string().trim().max(120).optional(),
  agree: z.literal(true, { error: "Tick the box to confirm you agree" }),
});

/** Client signs a contract sent to them. The service re-checks ownership, state and the text fingerprint. */
export async function signContractAction(contractId: string, input: unknown): Promise<ActionResult> {
  const { userId } = await requirePortalUser();
  if (!z.uuid().safeParse(contractId).success) return { ok: false, error: "Contract not found" };
  const parsed = signatureSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form" };

  const h = await headers();
  const ipHash = hashIp(getClientIp(new Request("http://x", { headers: h })));
  const result = await signContract(userId, contractId, {
    name: parsed.data.name,
    title: parsed.data.title || undefined,
    ipHash,
    userAgent: h.get("user-agent") ?? "",
  });
  revalidatePath("/portal");
  revalidatePath(`/portal/contracts/${contractId}`);
  return result.ok ? { ok: true } : result;
}

/** Client posts a message on one of their projects. RLS enforces sender = self and project access. */
export async function postClientMessageAction(projectId: string, body: string): Promise<ActionResult> {
  const { userId } = await requirePortalUser();
  const text = z.string().trim().min(1).max(10000).safeParse(body);
  if (!z.uuid().safeParse(projectId).success || !text.success) return { ok: false, error: "Write a message" };
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("messages").insert({ project_id: projectId, sender_id: userId, body: text.data });
  return error ? { ok: false, error: "Couldn't send that. Try again." } : { ok: true };
}
