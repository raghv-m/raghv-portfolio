import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";
import { pageMetadata, site } from "@/config/site";

export const metadata: Metadata = pageMetadata("/privacy", "Privacy policy", "How raghv.dev collects, uses, stores and protects your personal information, and your rights under Canadian privacy law (PIPEDA).");

export default function PrivacyPage() {
  return (
    <LegalPage
      path="/privacy"
      title="Privacy policy"
      updated="October 8, 2026"
      intro={
        <p>
          This site is run by {site.person}, a sole proprietor in Edmonton, Alberta, Canada (&ldquo;I&rdquo;, &ldquo;me&rdquo;).
          I collect only what I need to reply to you and do the work you hire me for, I never sell your information, and you
          can ask me to see, correct or delete it at any time. This policy follows Canada&apos;s{" "}
          <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA).
        </p>
      }
    >
      <section>
        <h2>What I collect</h2>
        <ul>
          <li><strong>Estimate requests:</strong> your name, email, and optionally your business name, phone number, business address, project description, timeline and budget, plus the options you picked.</li>
          <li><strong>Contact messages:</strong> your name, email, subject and message.</li>
          <li><strong>Client portal accounts:</strong> your email, name, a securely hashed password, and the projects, messages, files and invoices we share there.</li>
          <li><strong>Newsletter:</strong> your email and, if you give it, your name.</li>
          <li><strong>Technical data:</strong> a one-way hash of your IP address (to stop spam and abuse), and, only if you allow analytics cookies, anonymous usage statistics (see the <a href="/cookies">cookie policy</a>).</li>
        </ul>
      </section>

      <section>
        <h2>Why I use it</h2>
        <ul>
          <li>To prepare your estimate and quote, and reply to you.</li>
          <li>To set up and run your client portal, deliver your project, and send invoices.</li>
          <li>To send the newsletter you signed up for (unsubscribe any time from any email).</li>
          <li>To keep the site secure and working, and to meet legal and tax record-keeping duties.</li>
        </ul>
        <p className="mt-3">By submitting a form you consent to these uses. I don&apos;t use your information for anything else without asking.</p>
      </section>

      <section>
        <h2>Who processes it for me</h2>
        <p>I use a small number of trusted services to run the site. They process data only on my instructions:</p>
        <ul>
          <li><strong>Supabase</strong>: database, client portal sign-in and file storage (servers in the United States).</li>
          <li><strong>Turso</strong>: database for blog posts, messages and newsletter sign-ups (United States).</li>
          <li><strong>Vercel</strong>: website hosting (global network).</li>
          <li><strong>Resend</strong>: sending emails (United States).</li>
          <li><strong>Google</strong>: Maps address autocomplete on the estimate form, and Tag Manager/Analytics if you accept cookies.</li>
        </ul>
        <p className="mt-3">
          Some of these services store data outside Canada, so it may be subject to the laws of those countries. Each provider
          is contractually required to protect it.
        </p>
      </section>

      <section>
        <h2>How long I keep it</h2>
        <ul>
          <li>Estimate requests and messages that don&apos;t lead to a project: up to 2 years, then deleted.</li>
          <li>Client project records and invoices: 6 years after the work ends, as Canadian tax law requires.</li>
          <li>Newsletter: until you unsubscribe.</li>
        </ul>
      </section>

      <section>
        <h2>How I protect it</h2>
        <p>
          Everything travels over HTTPS. Databases enforce row-level security so each client can only ever see their own data,
          passwords are never stored in plain text, admin access requires two-factor authentication, and every admin change is
          recorded in an audit log that can&apos;t be edited.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          You can ask to see the personal information I hold about you, correct it, or have it deleted (except records I must keep
          by law), and you can withdraw consent at any time. If you&apos;re in the EU or UK, you also have the rights given by the
          GDPR. Email <a href={`mailto:${site.email}`}>{site.email}</a> and I&apos;ll respond within 30 days. If you&apos;re not
          satisfied, you can contact the Office of the Privacy Commissioner of Canada at{" "}
          <a href="https://www.priv.gc.ca" target="_blank" rel="noopener noreferrer">priv.gc.ca</a>.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>This site isn&apos;t aimed at children under 16, and I don&apos;t knowingly collect their information.</p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>If I change this policy, I&apos;ll update the date at the top. Significant changes affecting clients will be emailed.</p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>{site.person} · Edmonton, Alberta, Canada · <a href={`mailto:${site.email}`}>{site.email}</a></p>
      </section>
    </LegalPage>
  );
}
