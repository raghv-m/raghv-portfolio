import "server-only";

import { logAudit } from "@/lib/audit";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ProjectRow } from "@/lib/supabase/database.types";

/**
 * The CRM layer: notes, follow-up tasks, projects + milestones, project messages, the per-person
 * activity timeline and the dashboard numbers. Admin functions expect requireAdmin() first.
 */

type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
const admin = () => getSupabaseAdmin();

// ---------------------------------------------------------------------------------------------
// Notes & tasks
// ---------------------------------------------------------------------------------------------

export async function addNote(actorId: string, email: string, body: string) {
  const { error } = await admin().from("crm_notes").insert({ person_email: email.toLowerCase(), body, author_id: actorId });
  if (error) throw error;
}

export async function setNotePinned(id: string, pinned: boolean) {
  await admin().from("crm_notes").update({ pinned }).eq("id", id);
}

export async function deleteNote(actorId: string, id: string) {
  await admin().from("crm_notes").delete().eq("id", id);
  await logAudit({ actorId, action: "crm.note_delete", resourceType: "crm_note", resourceId: id });
}

export async function addTask(input: { email?: string | null; title: string; dueAt?: string | null; priority: "low" | "normal" | "high" }) {
  const { error } = await admin()
    .from("crm_tasks")
    .insert({ person_email: input.email?.toLowerCase() || null, title: input.title, due_at: input.dueAt || null, priority: input.priority });
  if (error) throw error;
}

export async function setTaskDone(id: string, done: boolean) {
  await admin().from("crm_tasks").update({ done_at: done ? new Date().toISOString() : null }).eq("id", id);
}

export async function deleteTask(id: string) {
  await admin().from("crm_tasks").delete().eq("id", id);
}

export async function openTasks(limit = 50) {
  const { data } = await admin()
    .from("crm_tasks")
    .select("*")
    .is("done_at", null)
    .order("due_at", { ascending: true, nullsFirst: false })
    .limit(limit);
  return data ?? [];
}

// ---------------------------------------------------------------------------------------------
// Projects, milestones, messages
// ---------------------------------------------------------------------------------------------

/** Starts a project for a client, optionally from a signed contract (title, value and milestones come from it). */
export async function createProject(
  actorId: string,
  input: { clientId: string; title?: string; contractId?: string | null; description?: string; endDate?: string | null; valueCents?: number },
): Promise<Result<{ id: string }>> {
  const { data: client } = await admin().from("profiles").select("id, tenant_id, role").eq("id", input.clientId).maybeSingle();
  if (!client || client.role !== "client") return { ok: false, error: "Client not found" };

  let title = input.title?.trim() || "";
  let valueCents = input.valueCents ?? 0;
  let endDate = input.endDate || null;
  let estimateId: string | null = null;
  let milestones: string[] = ["Discovery & content", "Design approved", "Build complete", "Review & fixes", "Launch"];

  if (input.contractId) {
    const { data: contract } = await admin().from("contracts").select("*").eq("id", input.contractId).maybeSingle();
    if (!contract || contract.client_id !== client.id) return { ok: false, error: "Contract not found for this client" };
    const v = contract.variables as { projectTitle?: string; feeCents?: number; targetLaunch?: string; schedule?: { label: string }[] };
    title ||= v.projectTitle ?? contract.title;
    valueCents ||= v.feeCents ?? 0;
    endDate ||= v.targetLaunch ?? null;
    estimateId = contract.estimate_id;
    if (v.schedule?.length) milestones = ["Discovery & content", ...v.schedule.map((s) => s.label.replace(/^Deposit, on signing$/i, "Kick-off")), "Launch"].filter((m, i, all) => all.indexOf(m) === i);
  }
  if (!title) return { ok: false, error: "Give the project a title" };

  const { data: project, error } = await admin()
    .from("projects")
    .insert({
      client_id: client.id,
      tenant_id: client.tenant_id,
      title,
      description: input.description || null,
      status: "planning",
      start_date: new Date().toISOString(),
      end_date: endDate ? new Date(`${endDate}T23:59:59-07:00`).toISOString() : null,
      contract_id: input.contractId ?? null,
      estimate_id: estimateId,
      value_cents: valueCents,
    })
    .select("id")
    .single();
  if (error) throw error;
  await admin().from("milestones").insert(milestones.map((m, i) => ({ project_id: project.id, title: m, sort_order: i })));
  await logAudit({ actorId, action: "project.create", resourceType: "project", resourceId: project.id, changes: { title, from_contract: Boolean(input.contractId) } });
  return { ok: true, data: { id: project.id } };
}

/** Recomputes progress from completed milestones. */
async function syncProgress(projectId: string) {
  const { data: ms } = await admin().from("milestones").select("completed").eq("project_id", projectId);
  if (!ms?.length) return;
  const progress = Math.round((ms.filter((m) => m.completed).length / ms.length) * 100);
  await admin().from("projects").update({ progress }).eq("id", projectId);
}

export async function updateProject(actorId: string, id: string, update: Partial<Pick<ProjectRow, "title" | "description" | "status" | "end_date" | "value_cents">>) {
  await admin().from("projects").update(update).eq("id", id);
  await logAudit({ actorId, action: "project.update", resourceType: "project", resourceId: id, changes: update as Record<string, unknown> });
}

export async function addMilestone(projectId: string, title: string, dueDate?: string | null) {
  const { data: last } = await admin().from("milestones").select("sort_order").eq("project_id", projectId).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  await admin().from("milestones").insert({ project_id: projectId, title, due_date: dueDate ? new Date(`${dueDate}T23:59:59-07:00`).toISOString() : null, sort_order: (last?.sort_order ?? -1) + 1 });
  await syncProgress(projectId);
}

export async function setMilestoneDone(id: string, completed: boolean) {
  const { data } = await admin().from("milestones").update({ completed }).eq("id", id).select("project_id").single();
  if (data) await syncProgress(data.project_id);
}

export async function deleteMilestone(id: string) {
  const { data } = await admin().from("milestones").delete().eq("id", id).select("project_id").single();
  if (data) await syncProgress(data.project_id);
}

/** Posts a message to a project thread as the admin. Clients post through RLS as themselves. */
export async function postAdminMessage(actorId: string, projectId: string, body: string) {
  const { error } = await admin().from("messages").insert({ project_id: projectId, sender_id: actorId, body });
  if (error) throw error;
}

// ---------------------------------------------------------------------------------------------
// Timeline & dashboard
// ---------------------------------------------------------------------------------------------

export type TimelineEvent = { at: string; kind: string; title: string; detail?: string; href?: string };

/** Everything that happened with one person, newest first. */
export async function personTimeline(email: string, profileId: string | null): Promise<TimelineEvent[]> {
  const key = email.toLowerCase();
  const a = admin();
  const [estimates, notes, tasks, questionnaires, contracts, invoices, projects] = await Promise.all([
    a.from("estimates").select("id, reference, created_at, status").ilike("email", key),
    a.from("crm_notes").select("id, body, created_at").eq("person_email", key),
    a.from("crm_tasks").select("id, title, created_at, done_at").eq("person_email", key),
    profileId ? a.from("questionnaires").select("id, sent_at, submitted_at").eq("client_id", profileId) : Promise.resolve({ data: [] as { id: string; sent_at: string; submitted_at: string | null }[] }),
    profileId ? a.from("contracts").select("id, number, sent_at, client_signed_at, created_at").eq("client_id", profileId) : Promise.resolve({ data: [] as { id: string; number: string; sent_at: string | null; client_signed_at: string | null; created_at: string }[] }),
    profileId ? a.from("invoices").select("id, invoice_number, sent_date, paid_date, created_at, amount_due, currency").eq("client_id", profileId) : Promise.resolve({ data: [] as { id: string; invoice_number: string; sent_date: string | null; paid_date: string | null; created_at: string; amount_due: number; currency: string }[] }),
    profileId ? a.from("projects").select("id, title, created_at").eq("client_id", profileId) : Promise.resolve({ data: [] as { id: string; title: string; created_at: string }[] }),
  ]);
  const messages = isDatabaseConfigured
    ? await prisma.contactSubmission.findMany({ where: { email: key }, select: { subject: true, createdAt: true } }).catch(() => [])
    : [];

  const money = (c: number, cur: string) => new Intl.NumberFormat("en-CA", { style: "currency", currency: cur.toUpperCase() }).format(c / 100);
  const events: TimelineEvent[] = [
    ...(estimates.data ?? []).map((e) => ({ at: e.created_at, kind: "estimate", title: `Requested estimate ${e.reference}`, detail: e.status, href: `/admin/estimates/${e.id}` })),
    ...(notes.data ?? []).map((n) => ({ at: n.created_at, kind: "note", title: "Note", detail: n.body.slice(0, 160) })),
    ...(tasks.data ?? []).flatMap((t) => [
      { at: t.created_at, kind: "task", title: `Task: ${t.title}` },
      ...(t.done_at ? [{ at: t.done_at, kind: "task", title: `Done: ${t.title}` }] : []),
    ]),
    ...(questionnaires.data ?? []).flatMap((q) => [
      { at: q.sent_at, kind: "onboarding", title: "Questionnaire sent" },
      ...(q.submitted_at ? [{ at: q.submitted_at, kind: "onboarding", title: "Questionnaire answered" }] : []),
    ]),
    ...(contracts.data ?? []).flatMap((c) => [
      { at: c.created_at, kind: "contract", title: `Contract ${c.number} drafted`, href: `/admin/contracts/${c.id}` },
      ...(c.sent_at ? [{ at: c.sent_at, kind: "contract", title: `Contract ${c.number} sent`, href: `/admin/contracts/${c.id}` }] : []),
      ...(c.client_signed_at ? [{ at: c.client_signed_at, kind: "contract", title: `Contract ${c.number} signed`, href: `/admin/contracts/${c.id}` }] : []),
    ]),
    ...(invoices.data ?? []).flatMap((i) => [
      ...(i.sent_date ? [{ at: i.sent_date, kind: "invoice", title: `Invoice ${i.invoice_number} sent`, detail: money(i.amount_due, i.currency), href: `/admin/invoices/${i.id}` }] : []),
      ...(i.paid_date ? [{ at: i.paid_date, kind: "payment", title: `Invoice ${i.invoice_number} paid`, detail: money(i.amount_due, i.currency), href: `/admin/invoices/${i.id}` }] : []),
    ]),
    ...(projects.data ?? []).map((p) => ({ at: p.created_at, kind: "project", title: `Project started: ${p.title}`, href: `/admin/projects/${p.id}` })),
    ...messages.map((m) => ({ at: m.createdAt.toISOString(), kind: "message", title: `Contact form: ${m.subject}` })),
  ];
  return events.sort((x, y) => y.at.localeCompare(x.at));
}

export async function dashboardStats() {
  const a = admin();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
  const [paid, open, pipeline, activeProjects] = await Promise.all([
    a.from("invoices").select("amount_paid, paid_date").eq("status", "paid").gte("paid_date", yearStart),
    a.from("invoices").select("amount_due, amount_paid").in("status", ["sent", "overdue"]),
    a.from("estimates").select("my_low_cents, my_high_cents").in("status", ["new", "reviewed", "quoted"]),
    a.from("projects").select("id", { count: "exact", head: true }).in("status", ["planning", "in_progress", "review"]),
  ]);
  const sum = (rows: number[]) => rows.reduce((s, n) => s + n, 0);
  return {
    paidThisMonth: sum((paid.data ?? []).filter((i) => (i.paid_date ?? "") >= monthStart).map((i) => i.amount_paid)),
    paidThisYear: sum((paid.data ?? []).map((i) => i.amount_paid)),
    outstanding: sum((open.data ?? []).map((i) => i.amount_due - i.amount_paid)),
    pipelineValue: sum((pipeline.data ?? []).map((e) => Math.round((e.my_low_cents + e.my_high_cents) / 2))),
    activeProjects: activeProjects.count ?? 0,
  };
}
