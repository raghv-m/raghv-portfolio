import AdminSidebar from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Signed in + admin + TOTP for this session, or redirected to /auth/login or /auth/mfa.
  await requireAdmin();

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      {/* Left margin = sidebar width (w-52 = 208px) */}
      <main className="flex-1 min-w-0 ml-52">{children}</main>
    </div>
  );
}
