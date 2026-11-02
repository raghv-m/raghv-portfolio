import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";
import { pageMetadata, site } from "@/config/site";

export const metadata: Metadata = pageMetadata("/cookies", "Cookie policy", "Which cookies raghv.dev uses, why they are set, how long they last, and how to control or delete them in your browser settings.");

export default function CookiesPage() {
  return (
    <LegalPage path="/cookies" title="Cookie policy" updated="November 1, 2026" intro={<p>Cookies are small files a site stores in your browser. Here&apos;s every kind this site uses, and how to control them.</p>}>
      <section>
        <h2>Essential (always on)</h2>
        <p>Needed for the site to work, so they can&apos;t be switched off. They contain no tracking.</p>
        <ul>
          <li><strong>Sign-in session</strong> (Supabase, <code>sb-*</code>): keeps you signed in to the client portal.</li>
          <li><strong>Two-factor verification</strong> (<code>__Host-mfa</code>): admin only; proves the second sign-in step for 8 hours.</li>
          <li><strong>Form protection</strong> (CSRF token): stops other sites submitting forms as you.</li>
        </ul>
      </section>

      <section>
        <h2>Your choices and preferences</h2>
        <ul>
          <li><strong>Privacy choice</strong> (<code>cf-consent</code> cookie and browser storage): remembers whether you accepted or declined analytics on the privacy banner, for one year. You can change it any time with &ldquo;Privacy choices&rdquo; in the footer.</li>
          <li><strong>Theme</strong> (browser storage, not a cookie): remembers your light, dark or automatic theme choice. Nothing about it leaves your browser.</li>
        </ul>
      </section>

      <section>
        <h2>Analytics</h2>
        <p>
          This site loads Google Tag Manager and Google Analytics, which set cookies (<code>_ga</code>, <code>_ga_*</code>) to count
          visits and see which pages are useful. The data is aggregated and isn&apos;t used for advertising. There is no device
          fingerprinting and no cross-site advertising tracking. Vercel Web Analytics measures page views without cookies.
          The privacy banner records your choice about analytics; you can also block or delete these cookies in your
          browser settings at any time, as described below.
        </p>
      </section>

      <section>
        <h2>Third-party features</h2>
        <p>The address search on the estimate form loads Google Maps, which may set its own cookies under Google&apos;s policy.</p>
      </section>

      <section>
        <h2>Controlling cookies</h2>
        <p>
          You can block or delete cookies in your browser settings, or use Google&apos;s{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Analytics opt-out add-on</a>.
          Blocking essential cookies will stop the client portal from working. Questions: <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
