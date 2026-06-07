import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminMessagesClient from "./AdminMessagesClient";

export default async function AdminMessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const messages = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return <AdminMessagesClient messages={messages} />;
}
