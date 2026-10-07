import { NextResponse } from "next/server";
import { z } from "zod";

import { getInvoicePdfUrl } from "@/lib/invoices/service";
import { getSignedIn } from "@/lib/session";

/**
 * GET /api/invoices/<id>/pdf → redirects to a 5-minute signed URL for the PDF, if the signed-in
 * user can see that invoice (RLS decides: clients their own non-draft invoices, admin all).
 * Anything else is a 404, so the endpoint doesn't confirm which invoice ids exist.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return new NextResponse("Not found", { status: 404 });

  const signedIn = await getSignedIn();
  if (!signedIn) return new NextResponse("Not found", { status: 404 });

  const url = await getInvoicePdfUrl(id);
  if (!url) return new NextResponse("Not found", { status: 404 });

  const response = NextResponse.redirect(url, 303);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
