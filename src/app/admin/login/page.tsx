import { redirect } from "next/navigation";

// Old admin login URL: the sign-in page now lives at /auth/login.
export default function OldAdminLogin() {
  redirect("/auth/login?next=/admin");
}
