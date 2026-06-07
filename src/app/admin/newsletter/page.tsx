import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewsletterClient from "./NewsletterClient";

export default async function AdminNewsletterPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const [subscribers, total, active] = await Promise.all([
    prisma.subscriber.findMany({ orderBy: { subscribedAt: "desc" }, take: 200 }),
    prisma.subscriber.count(),
    prisma.subscriber.count({ where: { active: true } }),
  ]);

  return <NewsletterClient subscribers={subscribers} total={total} active={active} />;
}
