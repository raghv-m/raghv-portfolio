import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NewsletterClient from "./NewsletterClient";

export default async function AdminNewsletterPage() {
  await requireAdmin();

  const [subscribers, total, active] = await Promise.all([
    prisma.subscriber.findMany({ orderBy: { subscribedAt: "desc" }, take: 200 }),
    prisma.subscriber.count(),
    prisma.subscriber.count({ where: { active: true } }),
  ]);

  return <NewsletterClient subscribers={subscribers} total={total} active={active} />;
}
