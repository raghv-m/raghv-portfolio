import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { postProjectMessageAction } from "@/app/admin/crm/actions";
import { AdminPage, Panel, StatusPill } from "@/components/admin/ui";
import { MessageThread } from "@/components/crm/MessageThread";
import { requireAdmin } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

import { ProjectControls } from "./ProjectControls";

export const dynamic = "force-dynamic";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { userId } = await requireAdmin();
  const admin = getSupabaseAdmin();
  const { data: project } = await admin.from("projects").select("*").eq("id", id).maybeSingle();
  if (!project) notFound();
  const [{ data: milestones }, { data: messages }, { data: client }] = await Promise.all([
    admin.from("milestones").select("*").eq("project_id", id).order("sort_order"),
    admin.from("messages").select("id, sender_id, body, created_at").eq("project_id", id).order("created_at"),
    admin.from("profiles").select("id, email, full_name").eq("id", project.client_id).maybeSingle(),
  ]);

  return (
    <AdminPage
      label="Project"
      title={project.title}
      back={{ href: "/admin/projects", text: "All projects" }}
      actions={
        <>
          <StatusPill status={project.status.replace("_", " ")} />
          {client && <Link href={`/admin/clients/${encodeURIComponent(client.email)}`} className="btn-ghost">{client.full_name || client.email}</Link>}
          {project.contract_id && <Link href={`/admin/contracts/${project.contract_id}`} className="btn-ghost">Contract</Link>}
        </>
      }
    >
      <div className="grid xl:grid-cols-[1fr_400px] gap-6 items-start">
        <ProjectControls
          project={{ id: project.id, title: project.title, description: project.description, status: project.status, endDate: project.end_date?.slice(0, 10) ?? "", valueCents: project.value_cents, progress: project.progress }}
          milestones={(milestones ?? []).map((m) => ({ id: m.id, title: m.title, completed: m.completed, dueDate: m.due_date }))}
        />
        <Panel title="Messages with the client">
          <MessageThread
            projectId={project.id}
            meId={userId}
            names={client ? { [client.id]: client.full_name || client.email } : {}}
            initial={messages ?? []}
            send={postProjectMessageAction}
          />
        </Panel>
      </div>
    </AdminPage>
  );
}
