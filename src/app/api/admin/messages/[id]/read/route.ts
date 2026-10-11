import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { apiError, withApiErrors } from "@/lib/api";

async function handlePATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return apiError(401, "Please sign in again.");
  }

  const { id } = await params;

  await prisma.contactSubmission.update({
    where: { id },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}

export const PATCH = withApiErrors("PATCH /api/admin/messages/[id]/read", handlePATCH);
