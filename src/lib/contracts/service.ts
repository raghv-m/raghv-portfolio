import "server-only";

import { createHash } from "node:crypto";

import { invoicing } from "@/config/invoicing";
import { logAudit } from "@/lib/audit";
import { sendContractSignedEmail, sendContractToSignEmail, sendQuestionnaireEmail } from "@/lib/mail";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

import { renderContractPdf } from "./pdf";
import type { QuestionnaireAnswers } from "./questionnaire";
import { buildContractBody, DEFAULT_EXCLUSIONS, SCHEDULE_PRESETS, type ContractVariables } from "./template";

/**
 * Onboarding questionnaire and services agreements.
 * Admin functions expect requireAdmin() to have run; client functions take the signed-in user's
 * id and re-check that the record is theirs and in the right state before changing anything.
 */

type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
const admin = () => getSupabaseAdmin();
const sha256 = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");
const today = () => new Date().toISOString().slice(0, 10);

async function loadClient(clientId: string) {
  const { data } = await admin().from("profiles").select("id, email, full_name, tenant_id, role").eq("id", clientId).maybeSingle();
  return data?.role === "client" ? data : null;
}

async function logEmail(row: { type: "questionnaire_sent" | "contract_sent" | "contract_signed"; to: string; contractId?: string; error?: string | null }) {
  await admin()
    .from("email_sends")
    .insert({ type: row.type, recipient_email: row.to, contract_id: row.contractId ?? null, status: row.error ? "failed" : "sent", error_message: row.error ?? null });
}

// ---------------------------------------------------------------------------------------------
// Questionnaire
// ---------------------------------------------------------------------------------------------

export async function sendQuestionnaire(actorId: string, clientId: string, origin: string): Promise<Result<{ id: string }>> {
  const client = await loadClient(clientId);
  if (!client) return { ok: false, error: "Client not found" };

  const { data: estimate } = await admin()
    .from("estimates")
    .select("id")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Reuse an unanswered questionnaire instead of piling up duplicates.
  const { data: open } = await admin().from("questionnaires").select("id").eq("client_id", clientId).eq("status", "sent").maybeSingle();
  const questionnaire = open
    ? open
    : (await admin().from("questionnaires").insert({ client_id: clientId, tenant_id: client.tenant_id, estimate_id: estimate?.id ?? null }).select("id").single()).data;
  if (!questionnaire) return { ok: false, error: "Couldn't create the questionnaire" };

  let error: string | null = null;
  try {
    await sendQuestionnaireEmail({ to: client.email, name: client.full_name || "there", url: `${origin}/portal/questionnaire/${questionnaire.id}` });
  } catch (e) {
    error = e instanceof Error ? e.message : "Email failed";
  }
  await logEmail({ type: "questionnaire_sent", to: client.email, error });
  await logAudit({ actorId, action: "questionnaire.send", resourceType: "questionnaire", resourceId: questionnaire.id, changes: { client: client.email } });
  return error ? { ok: false, error: `Questionnaire created, but the email failed (${error}). Share the portal link instead.` } : { ok: true, data: { id: questionnaire.id } };
}

export async function submitQuestionnaire(userId: string, questionnaireId: string, answers: QuestionnaireAnswers): Promise<Result> {
  const { data: q } = await admin().from("questionnaires").select("id, client_id, status").eq("id", questionnaireId).maybeSingle();
  if (!q || q.client_id !== userId) return { ok: false, error: "Questionnaire not found" };
  if (q.status === "submitted") return { ok: false, error: "This questionnaire was already submitted. Message me if something changed." };

  const { data, error } = await admin()
    .from("questionnaires")
    .update({ answers, status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", questionnaireId)
    .eq("status", "sent")
    .select("id");
  if (error) throw error;
  if (!data?.length) return { ok: false, error: "This questionnaire was already submitted." };

  // Keep the client's display name in step with what they told us.
  await admin().from("profiles").update({ full_name: answers.signerName }).eq("id", userId).is("full_name", null);
  await logAudit({ actorId: userId, action: "questionnaire.submit", resourceType: "questionnaire", resourceId: questionnaireId });
  return { ok: true, data: undefined };
}

// ---------------------------------------------------------------------------------------------
// Contracts
// ---------------------------------------------------------------------------------------------

function providerParty(): ContractVariables["provider"] {
  return {
    name: invoicing.businessName,
    legalName: invoicing.legalName,
    address: invoicing.addressLines.join(", "),
    email: `${invoicing.email}, ${invoicing.phone}`,
    website: invoicing.website,
  };
}

/** Builds the starting variables from the client's latest questionnaire and estimate. */
async function initialVariables(clientId: string) {
  const client = await loadClient(clientId);
  if (!client) return null;
  const [{ data: q }, { data: estimate }] = await Promise.all([
    admin().from("questionnaires").select("*").eq("client_id", clientId).eq("status", "submitted").order("submitted_at", { ascending: false }).limit(1).maybeSingle(),
    admin().from("estimates").select("*").eq("client_id", clientId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const a = (q?.answers ?? {}) as Partial<QuestionnaireAnswers>;
  const categoryLabel = estimate
    ? (await admin().from("pricing_items").select("label").eq("slug", estimate.category_slug).maybeSingle()).data?.label ?? estimate.category_slug
    : null;

  // Fee: the middle of the "my price" range they were shown, rounded to $50; edit before sending.
  const feeCents = estimate ? Math.round(((estimate.my_low_cents + estimate.my_high_cents) / 2) / 5000) * 5000 : 0;
  const scope = estimate
    ? [
        `${categoryLabel}${estimate.pages ? `, ${estimate.pages} page${estimate.pages === 1 ? "" : "s"}` : ""}`,
        ...estimate.line_items.slice(1).filter((l) => !/extra page/i.test(l.label) && l.oneTimeCents > 0).map((l) => l.label),
        "Responsive design for phones, tablets and desktops",
        "Launch on the agreed hosting, with SSL (HTTPS)",
      ]
    : ["(describe the work)"];
  if (a.mustHaves) scope.push(`Specific requirements: ${a.mustHaves}`);
  const monthlyLine = estimate?.line_items.find((l) => l.monthlyCents > 0);

  const variables: ContractVariables = {
    provider: providerParty(),
    client: {
      legalName: a.legalName || client.full_name || client.email,
      operatingName: a.operatingName || undefined,
      businessType: a.businessType,
      address: [a.addressLine1, a.addressLine2, a.city && `${a.city}, ${a.region ?? ""} ${a.postalCode ?? ""}`.trim(), a.country].filter(Boolean).join(", ") || "(client address)",
      signerName: a.signerName || client.full_name || "(signer name)",
      signerTitle: a.signerTitle || "(title)",
      email: a.signerEmail || client.email,
    },
    effectiveDate: today(),
    projectTitle: categoryLabel ? `${categoryLabel} for ${a.operatingName || a.legalName || client.full_name || "the Client"}` : "Website project",
    scope,
    clientGoals: a.projectGoals,
    exclusions: [...DEFAULT_EXCLUSIONS],
    targetLaunch: a.targetLaunch,
    feeCents,
    currency: "cad",
    schedule: SCHEDULE_PRESETS[a.paymentSchedule ?? "40-40-20"] ?? SCHEDULE_PRESETS["40-40-20"],
    paymentMethods: a.paymentMethod ? [a.paymentMethod, ...invoicing.paymentMethods.filter((m) => m !== a.paymentMethod)] : [...invoicing.paymentMethods],
    paymentTermsDays: invoicing.paymentTermsDays,
    lateInterestMonthlyPct: invoicing.lateInterestMonthlyPct,
    lateInterestAnnualPct: invoicing.lateInterestAnnualPct,
    gstRegistered: Boolean(invoicing.gstNumber),
    gstNumber: invoicing.gstNumber,
    monthly: monthlyLine ? { cents: monthlyLine.monthlyCents, description: monthlyLine.label } : null,
    revisionRounds: 2,
    warrantyDays: 30,
    jurisdiction: invoicing.jurisdiction,
  };
  return { client, variables, questionnaireId: q?.id ?? null, estimateId: estimate?.id ?? null };
}

export async function draftContract(actorId: string, clientId: string): Promise<Result<{ id: string }>> {
  const initial = await initialVariables(clientId);
  if (!initial) return { ok: false, error: "Client not found" };
  const { data, error } = await admin()
    .from("contracts")
    .insert({
      client_id: clientId,
      tenant_id: initial.client.tenant_id,
      estimate_id: initial.estimateId,
      questionnaire_id: initial.questionnaireId,
      variables: initial.variables as unknown as Record<string, unknown>,
      body: buildContractBody(initial.variables),
    })
    .select("id, number")
    .single();
  if (error) throw error;
  await logAudit({ actorId, action: "contract.draft", resourceType: "contract", resourceId: data.id, changes: { number: data.number, from_questionnaire: Boolean(initial.questionnaireId) } });
  return { ok: true, data: { id: data.id } };
}

/** Saves edited variables and regenerates the text, or saves hand-edited text. Drafts only. */
export async function updateContract(actorId: string, id: string, update: { variables?: ContractVariables; body?: string }): Promise<Result> {
  const { data: current } = await admin().from("contracts").select("status").eq("id", id).maybeSingle();
  if (!current) return { ok: false, error: "Contract not found" };
  if (current.status !== "draft") return { ok: false, error: "Only drafts can be edited. Void it and draft a new one to change a sent contract." };
  const body = update.body ?? (update.variables ? buildContractBody(update.variables) : undefined);
  const { error } = await admin()
    .from("contracts")
    .update({ ...(update.variables ? { variables: update.variables as unknown as Record<string, unknown> } : {}), ...(body !== undefined ? { body } : {}) })
    .eq("id", id)
    .eq("status", "draft");
  if (error) throw error;
  await logAudit({ actorId, action: update.body !== undefined ? "contract.edit_text" : "contract.edit_terms", resourceType: "contract", resourceId: id });
  return { ok: true, data: undefined };
}

/** Freezes the text (fingerprint), signs as the Developer, and emails the client a signing link. */
export async function sendContract(actorId: string, id: string, providerSignatureName: string, origin: string): Promise<Result> {
  const { data: contract } = await admin().from("contracts").select("*").eq("id", id).maybeSingle();
  if (!contract) return { ok: false, error: "Contract not found" };
  if (contract.status !== "draft") return { ok: false, error: `This contract is already ${contract.status}.` };
  const vars = contract.variables as unknown as ContractVariables;
  if (!vars.feeCents || vars.feeCents <= 0) return { ok: false, error: "Set the project fee before sending." };
  if (/\((client address|signer name|title|describe the work)\)/.test(contract.body)) {
    return { ok: false, error: "Fill in the placeholders in brackets (address, signer, scope) before sending." };
  }

  const now = new Date().toISOString();
  const { data: updated, error } = await admin()
    .from("contracts")
    .update({ status: "sent", sent_at: now, body_sha256: sha256(contract.body), provider_signature_name: providerSignatureName, provider_signed_at: now })
    .eq("id", id)
    .eq("status", "draft")
    .select("id");
  if (error) throw error;
  if (!updated?.length) return { ok: false, error: "This contract was already sent." };

  const client = await loadClient(contract.client_id);
  const to = vars.client.email || client?.email;
  let emailError: string | null = null;
  try {
    if (!to) throw new Error("No client email");
    await sendContractToSignEmail({ to, name: vars.client.signerName, number: contract.number, title: contract.title, url: `${origin}/portal/contracts/${id}` });
  } catch (e) {
    emailError = e instanceof Error ? e.message : "Email failed";
  }
  await logEmail({ type: "contract_sent", to: to ?? "(none)", contractId: id, error: emailError });
  await logAudit({ actorId, action: "contract.send", resourceType: "contract", resourceId: id, changes: { number: contract.number } });
  return emailError ? { ok: false, error: `Sent, but the email failed (${emailError}). Share the portal link instead.` } : { ok: true, data: undefined };
}

/**
 * The client signs: re-checks it's their contract, it's awaiting signature, and its text still
 * matches the fingerprint taken when it was sent. Then records the signature, renders the
 * signed PDF, stores it privately, and emails both parties a copy.
 */
export async function signContract(
  userId: string,
  id: string,
  signature: { name: string; title?: string; ipHash: string; userAgent: string },
): Promise<Result> {
  const { data: contract } = await admin().from("contracts").select("*").eq("id", id).maybeSingle();
  if (!contract || contract.client_id !== userId) return { ok: false, error: "Contract not found" };
  if (contract.status !== "sent") return { ok: false, error: contract.status === "signed" ? "This contract is already signed." : "This contract isn't open for signing." };
  if (!contract.body_sha256 || sha256(contract.body) !== contract.body_sha256) {
    await logAudit({ actorId: userId, action: "contract.integrity_failure", resourceType: "contract", resourceId: id });
    return { ok: false, error: "This contract's text changed after it was sent, so it can't be signed. Please contact me." };
  }

  const signedAt = new Date().toISOString();
  const vars = contract.variables as unknown as ContractVariables;
  const pdf = await renderContractPdf({
    number: contract.number,
    body: contract.body,
    bodySha256: contract.body_sha256,
    provider: { name: vars.provider.legalName, signatureName: contract.provider_signature_name ?? vars.provider.name, signedAt: contract.provider_signed_at ?? contract.sent_at ?? signedAt },
    client: { name: vars.client.legalName, signatureName: signature.name, title: signature.title, signedAt, ipHash: signature.ipHash, userAgent: signature.userAgent },
  });
  const path = `${contract.id}.pdf`;
  const { error: uploadError } = await admin().storage.from("contracts").upload(path, pdf, { contentType: "application/pdf", upsert: true });
  if (uploadError) throw uploadError;

  const { data: updated, error } = await admin()
    .from("contracts")
    .update({
      status: "signed",
      client_signature_name: signature.name,
      client_signature_title: signature.title ?? null,
      client_signed_at: signedAt,
      client_ip_hash: signature.ipHash,
      client_user_agent: signature.userAgent.slice(0, 300),
      pdf_path: path,
    })
    .eq("id", id)
    .eq("status", "sent")
    .select("id");
  if (error) throw error;
  if (!updated?.length) return { ok: false, error: "This contract is already signed." };

  await logAudit({ actorId: userId, action: "contract.sign", resourceType: "contract", resourceId: id, changes: { number: contract.number, sha256: contract.body_sha256 } });

  for (const to of [vars.client.email, invoicing.email]) {
    let emailError: string | null = null;
    try {
      await sendContractSignedEmail({ to, name: to === invoicing.email ? invoicing.businessName : vars.client.signerName, number: contract.number, clientName: vars.client.legalName, pdf, forProvider: to === invoicing.email });
    } catch (e) {
      emailError = e instanceof Error ? e.message : "Email failed";
    }
    await logEmail({ type: "contract_signed", to, contractId: id, error: emailError });
  }
  return { ok: true, data: undefined };
}

export async function voidContract(actorId: string, id: string): Promise<Result> {
  const { data, error } = await admin().from("contracts").update({ status: "void" }).eq("id", id).neq("status", "void").select("id");
  if (error) throw error;
  if (!data?.length) return { ok: false, error: "Contract not found or already void" };
  await logAudit({ actorId, action: "contract.void", resourceType: "contract", resourceId: id });
  return { ok: true, data: undefined };
}

/** 5-minute link to a signed contract's PDF, after checking the caller may see it (RLS). */
export async function getContractPdfUrl(id: string, visibleTo: { userId: string; isAdmin: boolean }): Promise<string | null> {
  const { data } = await admin().from("contracts").select("client_id, pdf_path").eq("id", id).maybeSingle();
  if (!data?.pdf_path || (!visibleTo.isAdmin && data.client_id !== visibleTo.userId)) return null;
  const { data: signed } = await admin().storage.from("contracts").createSignedUrl(data.pdf_path, 300);
  return signed?.signedUrl ?? null;
}

