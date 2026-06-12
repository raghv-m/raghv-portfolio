import { NextResponse } from "next/server";
import { generateCsrfToken } from "@/lib/csrf";

export async function GET() {
  try {
    const token = generateCsrfToken();
    const res = NextResponse.json({ token });
    // Double-submit cookie: the client sends the token in the body;
    // the server verifies body === cookie. SameSite=Strict blocks cross-site reads.
    res.cookies.set("csrf", token, {
      httpOnly: false,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 3600,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
}
