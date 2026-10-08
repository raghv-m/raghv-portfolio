import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import AdminMessagesClient from "./AdminMessagesClient";

export default async function AdminMessagesPage() {
  await requireAdmin();

  const messages = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return <AdminMessagesClient messages={messages} />;
}
