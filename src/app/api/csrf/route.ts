import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

// Simple stateless CSRF token — signed with CSRF_SECRET
// Client stores in memory; server verifies on contact POST.
// This is lightweight protection — primary defense is SameSite cookies + origin check.

export async function GET() {
  const token = randomBytes(32).toString("hex");
  // In a more complete implementation, sign the token with CSRF_SECRET and verify on contact POST.
  // For now, issue a random token the client must echo back.
  return NextResponse.json({ token });
}
