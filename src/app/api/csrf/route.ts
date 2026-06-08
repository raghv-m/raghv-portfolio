import { NextResponse } from "next/server";
import { generateCsrfToken } from "@/lib/csrf";

export async function GET() {
  try {
    const token = generateCsrfToken();
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
}
