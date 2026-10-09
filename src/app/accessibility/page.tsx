import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";
import { pageMetadata, site } from "@/config/site";

export const metadata: Metadata = pageMetadata("/accessibility", "Accessibility statement", "raghv.dev's commitment to WCAG 2.1 AA accessibility, known limitations, and how to report a barrier.");

export default function AccessibilityPage() {
  return (
    <LegalPage path="/accessibility" title="Accessibility statement" updated="October 8, 2026" intro={<p>I want everyone to be able to use this site, including people using screen readers, keyboards only, magnification or reduced motion.</p>}>
      <section>
        <h2>The standard I aim for</h2>
        <p>This site aims to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at level AA, in line with the Accessible Canada Act. Sites I build for clients are held to the same standard on request.</p>
      </section>
      <section>
        <h2>What&apos;s in place</h2>
        <ul>
          <li>Semantic headings and landmarks, labelled form fields and buttons.</li>
          <li>Everything usable with a keyboard, with visible focus.</li>
          <li>Text contrast designed to meet AA on the dark theme.</li>
          <li>Decorative animations are not essential to any content.</li>
        </ul>
      </section>
      <section>
        <h2>Known limitations</h2>
        <ul>
          <li>Some decorative 3D and particle effects on the home page are visual only and are skipped by screen readers.</li>
          <li>The Google Maps address search is provided by Google; you can always type your address into the plain fields below it instead.</li>
        </ul>
      </section>
      <section>
        <h2>Report a barrier</h2>
        <p>If anything is hard to use, email <a href={`mailto:${site.email}`}>{site.email}</a> with the page and what happened. I&apos;ll reply within 5 business days and fix what I can, or get you the information another way.</p>
      </section>
    </LegalPage>
  );
}
