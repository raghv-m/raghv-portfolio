import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Shared session check for admin API routes. Returns the session, or null if unauthenticated —
// callers keep their existing `if (!session) return 401` shape.
export async function requireAdmin() {
  return getServerSession(authOptions);
}
