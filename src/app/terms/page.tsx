import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";
import { pageMetadata, site } from "@/config/site";

export const metadata: Metadata = pageMetadata("/terms", "Terms of service", "The terms for using raghv.dev, requesting estimates, the client portal, and web development projects with Raghav Mahajan.");

export default function TermsPage() {
  return (
    <LegalPage
      path="/terms"
      title="Terms of service"
      updated="October 8, 2026"
      intro={<p>These terms cover using this website, the estimator and the client portal, and the general basis on which I take on projects. A signed proposal or quote for a specific project takes priority over these terms where they differ.</p>}
    >
      <section>
        <h2>Who I am</h2>
        <p>raghv.dev is run by {site.person}, a sole proprietor in Edmonton, Alberta, Canada. Contact: <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
      </section>

      <section>
        <h2>Estimates and quotes</h2>
        <ul>
          <li>Prices from the online estimator are <strong>estimates, not offers</strong>. The &ldquo;typical market quote&rdquo; shows what agencies commonly charge; &ldquo;my price&rdquo; is my indicative rate for the same scope.</li>
          <li>A project only starts once we both agree a written quote (scope, price, timeline and payment schedule).</li>
          <li>All prices are in Canadian dollars and exclude applicable taxes unless stated.</li>
        </ul>
      </section>

      <section>
        <h2>Payment</h2>
        <ul>
          <li>Unless the quote says otherwise, larger projects are billed in stages (for example a deposit, a mid-project payment and a final payment before launch).</li>
          <li>Invoices are due by the date shown on them. I may pause work on overdue accounts.</li>
          <li>Ongoing services (hosting, care plans) are billed monthly in advance and can be cancelled with 30 days&apos; notice.</li>
        </ul>
      </section>

      <section>
        <h2>Your responsibilities</h2>
        <ul>
          <li>Provide content, feedback and access (logins, domain, brand assets) in reasonable time. Delays on your side may move the timeline.</li>
          <li>Make sure you have the rights to any text, images or logos you give me.</li>
          <li>Keep your portal password private. You&apos;re responsible for activity under your account.</li>
        </ul>
      </section>

      <section>
        <h2>Ownership</h2>
        <p>
          Once paid in full, you own the final website, its content and the custom code written for you. I keep the right to
          reuse general techniques, non-client-specific code and open-source components, and, unless you ask me not to, to show
          the finished work in my portfolio. Third-party tools and licences remain subject to their own terms.
        </p>
      </section>

      <section>
        <h2>Warranty and support</h2>
        <p>
          I fix bugs in work I&apos;ve delivered free of charge for 30 days after launch. After that, support is covered by a care
          plan or billed hourly. I can&apos;t guarantee uninterrupted operation of third-party services (hosting, payment or email
          providers) or specific search rankings.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the extent the law allows, my total liability for any claim relating to a project is limited to the amount you paid
          me for that project, and I&apos;m not liable for indirect losses such as lost profits or data. Nothing here limits rights
          you have under consumer protection law.
        </p>
      </section>

      <section>
        <h2>Acceptable use of the site</h2>
        <p>Don&apos;t misuse this site: no attempts to break in, overload it, scrape it, or submit false or abusive information. I may suspend portal accounts that are misused.</p>
      </section>

      <section>
        <h2>Ending a project</h2>
        <p>Either of us can end a project with written notice. You pay for work done up to that point; I hand over everything completed and paid for. See the <a href="/refunds">refund policy</a>.</p>
      </section>

      <section>
        <h2>Governing law</h2>
        <p>These terms are governed by the laws of Alberta and the federal laws of Canada that apply there. Disputes will be handled in the courts of Alberta, after we&apos;ve first tried to resolve them in good faith.</p>
      </section>
    </LegalPage>
  );
}
