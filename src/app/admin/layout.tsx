import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Login page — no sidebar, just the full-screen form
  if (!session) return <>{children}</>;

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      {/* Left margin = sidebar width (w-52 = 208px) */}
      <main className="flex-1 min-w-0 ml-52">{children}</main>
    </div>
  );
}
