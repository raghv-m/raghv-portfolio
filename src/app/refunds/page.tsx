import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";
import { pageMetadata, site } from "@/config/site";

export const metadata: Metadata = pageMetadata("/refunds", "Refund policy", "How deposits, cancellations and refunds work for web development projects and monthly services with raghv.dev.");

export default function RefundsPage() {
  return (
    <LegalPage path="/refunds" title="Refund policy" updated="October 8, 2026" intro={<p>Custom work is made for you, so refunds depend on how far the project has got. The aim is simple: you pay for work done, and nothing more.</p>}>
      <section>
        <h2>Before work starts</h2>
        <p>If you cancel before I&apos;ve started (after accepting a quote and paying a deposit), you get a full refund of the deposit, minus any third-party costs already paid for you (for example a domain or theme licence).</p>
      </section>
      <section>
        <h2>During a project</h2>
        <p>If you cancel part-way, I invoice for the work completed to that point at the agreed rate, refund any amount paid beyond that, and hand over everything finished so far.</p>
      </section>
      <section>
        <h2>After delivery</h2>
        <p>Delivered and approved work isn&apos;t refundable, but bugs in my work are fixed free for 30 days after launch. If something isn&apos;t what we agreed, tell me and I&apos;ll put it right first.</p>
      </section>
      <section>
        <h2>Monthly services</h2>
        <p>Hosting and care plans are billed monthly in advance and can be cancelled with 30 days&apos; notice. The current month isn&apos;t refunded, and there are no cancellation fees.</p>
      </section>
      <section>
        <h2>Clients in the EU or UK</h2>
        <p>If consumer law gives you a 14-day cooling-off period, you keep it. If you ask me to start within those 14 days and then cancel, you pay only for the work done before you cancelled.</p>
      </section>
      <section>
        <h2>How to ask</h2>
        <p>Email <a href={`mailto:${site.email}`}>{site.email}</a> with your invoice number. Approved refunds are paid back the same way you paid, within 10 business days.</p>
      </section>
    </LegalPage>
  );
}
