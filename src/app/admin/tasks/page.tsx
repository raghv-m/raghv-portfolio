import { AdminPage, Panel } from "@/components/admin/ui";
import { TaskList } from "@/components/crm/TaskList";
import { openTasks } from "@/lib/crm";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const [open, { data: done }] = await Promise.all([
    openTasks(200),
    getSupabaseAdmin().from("crm_tasks").select("*").not("done_at", "is", null).order("done_at", { ascending: false }).limit(20),
  ]);
  return (
    <AdminPage label="CRM" title="Tasks & follow-ups">
      <div className="space-y-6 max-w-3xl">
        <Panel title={`Open (${open.length})`}>
          <TaskList tasks={open} showPerson />
        </Panel>
        {done && done.length > 0 && (
          <Panel title="Recently done">
            <TaskList tasks={done} showPerson />
          </Panel>
        )}
      </div>
    </AdminPage>
  );
}
