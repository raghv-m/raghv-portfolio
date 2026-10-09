import Link from "next/link";

import { AdminPage } from "@/components/admin/ui";
import { getFullCatalog } from "@/lib/estimator/catalog";

import { PricingEditor } from "./PricingEditor";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const items = await getFullCatalog();
  return (
    <AdminPage label="Estimator" title="Pricing" actions={<Link href="/estimate" target="_blank" className="btn-ghost">Preview estimator ↗</Link>}>
      <p className="text-sm text-[var(--text-muted)] mb-6 max-w-2xl">
        Every option on the public estimator. Change a price and press Save on that row; the estimator updates within 5
        minutes. Turning an item off hides it from new estimates without touching ones already sent. All prices CAD.
      </p>
      <PricingEditor items={items} />
    </AdminPage>
  );
}
