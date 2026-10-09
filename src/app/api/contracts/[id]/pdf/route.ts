import { NextResponse } from "next/server";
import { z } from "zod";

import { getContractPdfUrl } from "@/lib/contracts/service";
import { hasVerifiedMfa, getSignedIn } from "@/lib/session";

/** Signed contract PDF: the client it belongs to, or the admin (with 2FA). 404 otherwise. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return new NextResponse("Not found", { status: 404 });
  const signedIn = await getSignedIn();
  if (!signedIn) return new NextResponse("Not found", { status: 404 });
  const isAdmin = signedIn.profile.role === "admin" && (await hasVerifiedMfa(signedIn));
  const url = await getContractPdfUrl(id, { userId: signedIn.userId, isAdmin });
  if (!url) return new NextResponse("Not found", { status: 404 });
  const response = NextResponse.redirect(url, 303);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
