import { redirect } from "next/navigation";

// Admin home until the dashboard lands (rebuild phase 10). The layout has already checked admin + 2FA.
export default function AdminHome() {
  redirect("/admin/messages");
}
