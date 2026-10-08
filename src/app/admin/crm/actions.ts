"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  addMilestone,
  addNote,
  addTask,
  createProject,
  deleteMilestone,
  deleteNote,
  deleteTask,
  postAdminMessage,
  setMilestoneDone,
  setNotePinned,
  setTaskDone,
  updateProject,
} from "@/lib/crm";
import { requireAdmin } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type ActionResult = { ok: true } | { ok: false; error: string };
const uuid = z.uuid();
const fail = (error: string): ActionResult => ({ ok: false, error });

function refreshPerson(email?: string | null) {
  revalidatePath("/admin");
  revalidatePath("/admin/tasks");
  if (email) revalidatePath(`/admin/clients/${encodeURIComponent(email)}`);
}

// Notes ---------------------------------------------------------------------------------------

export async function addNoteAction(email: string, body: string): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  if (!z.email().safeParse(email).success) return fail("Invalid person");
  const text = z.string().trim().min(1, "Write something").max(10000).safeParse(body);
  if (!text.success) return fail(text.error.issues[0].message);
  await addNote(userId, email, text.data);
  refreshPerson(email);
  return { ok: true };
}

export async function toggleNotePinAction(id: string, pinned: boolean, email: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Invalid note");
  await setNotePinned(id, pinned);
  refreshPerson(email);
  return { ok: true };
}

export async function deleteNoteAction(id: string, email: string): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Invalid note");
  await deleteNote(userId, id);
  refreshPerson(email);
  return { ok: true };
}

// Tasks ---------------------------------------------------------------------------------------

const taskSchema = z.object({
  email: z.email().nullable().optional(),
  title: z.string().trim().min(1, "What needs doing?").max(300),
  dueAt: z.string().optional().nullable(),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});

export async function addTaskAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const due = parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;
  if (due && Number.isNaN(due.getTime())) return fail("Invalid due date");
  await addTask({ ...parsed.data, dueAt: due?.toISOString() ?? null });
  refreshPerson(parsed.data.email);
  return { ok: true };
}

export async function toggleTaskAction(id: string, done: boolean, email?: string | null): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Invalid task");
  await setTaskDone(id, done);
  refreshPerson(email);
  return { ok: true };
}

export async function deleteTaskAction(id: string, email?: string | null): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Invalid task");
  await deleteTask(id);
  refreshPerson(email);
  return { ok: true };
}

// Pipeline --------------------------------------------------------------------------------------

export async function moveDealAction(estimateId: string, status: "new" | "reviewed" | "quoted" | "converted" | "declined"): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(estimateId).success) return fail("Invalid deal");
  await getSupabaseAdmin().from("estimates").update({ status }).eq("id", estimateId);
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin/estimates");
  return { ok: true };
}

// Projects --------------------------------------------------------------------------------------

export async function createProjectAction(input: unknown) {
  const { userId } = await requireAdmin();
  const parsed = z
    .object({
      clientId: z.uuid(),
      contractId: z.uuid().nullable().optional(),
      title: z.string().trim().max(200).optional(),
      endDate: z.iso.date().nullable().optional(),
    })
    .safeParse(input);
  if (!parsed.success) return fail("Invalid project details");
  const result = await createProject(userId, parsed.data);
  if (!result.ok) return result;
  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${result.data.id}`);
}

const projectUpdate = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(4000).nullable().optional(),
  status: z.enum(["planning", "in_progress", "review", "completed", "on_hold", "cancelled"]).optional(),
  end_date: z.string().nullable().optional(),
  value_cents: z.number().int().min(0).optional(),
});

export async function updateProjectAction(id: string, update: unknown): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Invalid project");
  const parsed = projectUpdate.safeParse(update);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const data = { ...parsed.data, ...(parsed.data.end_date ? { end_date: new Date(`${parsed.data.end_date.slice(0, 10)}T23:59:59-07:00`).toISOString() } : {}) };
  await updateProject(userId, id, data);
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath("/admin/projects");
  revalidatePath("/portal");
  return { ok: true };
}

export async function addMilestoneAction(projectId: string, title: string, dueDate?: string | null): Promise<ActionResult> {
  await requireAdmin();
  const t = z.string().trim().min(1).max(200).safeParse(title);
  if (!uuid.safeParse(projectId).success || !t.success) return fail("Give the milestone a name");
  await addMilestone(projectId, t.data, dueDate);
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/portal");
  return { ok: true };
}

export async function toggleMilestoneAction(id: string, done: boolean, projectId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Invalid milestone");
  await setMilestoneDone(id, done);
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/portal");
  return { ok: true };
}

export async function deleteMilestoneAction(id: string, projectId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Invalid milestone");
  await deleteMilestone(id);
  revalidatePath(`/admin/projects/${projectId}`);
  return { ok: true };
}

export async function postProjectMessageAction(projectId: string, body: string): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const text = z.string().trim().min(1).max(10000).safeParse(body);
  if (!uuid.safeParse(projectId).success || !text.success) return fail("Write a message");
  await postAdminMessage(userId, projectId, text.data);
  return { ok: true };
}
