/**
 * Website Development Services Agreement, filled in from contract variables. Pure (no framework
 * or database), so tests/contract.test.mts can check it. Output is simple markup the portal and
 * the PDF both render: "# " title, "## " headings, "- " bullets, blank line between paragraphs.
 *
 * Written for a sole proprietor in Alberta, Canada. It is a solid starting template, not legal
 * advice: have an Alberta lawyer review it once before relying on it.
 */

export type ContractVariables = {
  provider: { name: string; legalName: string; address: string; email: string; website: string };
  client: { legalName: string; operatingName?: string; businessType?: string; address: string; signerName: string; signerTitle: string; email: string };
  effectiveDate: string; // YYYY-MM-DD
  projectTitle: string;
  scope: string[];
  clientGoals?: string;
  exclusions: string[];
  startDate?: string;
  targetLaunch?: string;
  feeCents: number;
  currency: string;
  schedule: { label: string; pct: number }[];
  paymentMethods: string[];
  paymentTermsDays: number;
  lateInterestMonthlyPct: number;
  lateInterestAnnualPct: number;
  gstRegistered: boolean;
  gstNumber?: string | null;
  monthly?: { cents: number; description: string } | null;
  revisionRounds: number;
  warrantyDays: number;
  jurisdiction: string;
};

const money = (cents: number, currency: string) =>
  `${new Intl.NumberFormat("en-CA", { style: "currency", currency: currency.toUpperCase(), currencyDisplay: "narrowSymbol" }).format(cents / 100)} ${currency.toUpperCase()}`;

const date = (iso?: string) =>
  iso ? new Intl.DateTimeFormat("en-CA", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`)) : "a date agreed in writing";

/** Splits the fee across the payment schedule; any rounding remainder goes on the last payment. */
export function scheduleAmounts(feeCents: number, schedule: { label: string; pct: number }[]) {
  const amounts = schedule.map((s) => Math.round((feeCents * s.pct) / 100));
  if (amounts.length) amounts[amounts.length - 1] += feeCents - amounts.reduce((a, b) => a + b, 0);
  return schedule.map((s, i) => ({ ...s, cents: amounts[i] }));
}

export function buildContractBody(v: ContractVariables): string {
  const clientName = v.client.operatingName && v.client.operatingName !== v.client.legalName
    ? `${v.client.legalName}, operating as ${v.client.operatingName}`
    : v.client.legalName;
  const payments = scheduleAmounts(v.feeCents, v.schedule);
  const tax = v.gstRegistered
    ? `GST/HST will be added to each invoice at the applicable rate (registration no. ${v.gstNumber}).`
    : "The Developer is a small supplier not registered for GST/HST, so no GST/HST is charged. If the Developer becomes registered during the Project, GST/HST will be added to invoices issued after registration, with written notice.";

  return [
    `# Website Development Services Agreement`,
    `This Website Development Services Agreement (the "Agreement") is made effective ${date(v.effectiveDate)} (the "Effective Date") between:`,
    `- **${v.provider.legalName}**, ${v.provider.address} (${v.provider.email}) (the "Developer"); and\n- **${clientName}**${v.client.businessType ? `, a ${v.client.businessType.toLowerCase()}` : ""}, ${v.client.address}, represented by ${v.client.signerName}, ${v.client.signerTitle} (${v.client.email}) (the "Client").`,
    `The Developer and the Client are each a "Party" and together the "Parties".`,

    `## 1. The Project`,
    `The Developer will design, build and deliver the following for the Client (the "Project": ${v.projectTitle}):`,
    v.scope.map((item) => `- ${item}`).join("\n"),
    v.clientGoals ? `The Client's stated goals for the Project, which the Developer will use to guide design decisions: ${v.clientGoals}` : "",
    `Not included unless added by a Change Order (section 6):`,
    v.exclusions.map((item) => `- ${item}`).join("\n"),

    `## 2. Timeline`,
    `Work will start on ${v.startDate ? date(v.startDate) : "receipt of the deposit and the materials in section 7"}, with a target launch of ${date(v.targetLaunch)}. Dates are estimates in good faith. Delays caused by late content, feedback, approvals or payments from the Client move the timeline by at least the same amount, and are not a breach by the Developer.`,

    `## 3. Deliverables, Revisions and Acceptance`,
    `The Developer will share work for review at key stages. Each stage includes up to ${v.revisionRounds} rounds of reasonable revisions; further rounds are a Change Order. The Client will review and respond within 5 business days of each delivery. A deliverable is accepted when the Client approves it in writing (email or the client portal is enough) or uses it publicly, or 10 business days after delivery if the Client has not reported a material defect.`,

    `## 4. Fees`,
    `The total fee for the Project is **${money(v.feeCents, v.currency)}** (the "Fee"). ${tax}`,
    v.monthly && v.monthly.cents > 0
      ? `After launch, ongoing services (${v.monthly.description}) cost **${money(v.monthly.cents, v.currency)} per month**, billed monthly in advance, and continue until either Party cancels with 30 days' written notice.`
      : "",

    `## 5. Payment`,
    `The Fee is payable as follows:`,
    payments.map((p) => `- ${p.label}: ${p.pct}% (${money(p.cents, v.currency)})`).join("\n"),
    `Invoices are due ${v.paymentTermsDays} days after they are issued. Accepted payment methods: ${v.paymentMethods.join(", ")}. Work starts once the first payment is received. Overdue amounts bear interest at ${v.lateInterestMonthlyPct}% per month (${v.lateInterestAnnualPct}% per year), calculated monthly from the due date until paid. If an invoice is more than 15 days overdue, the Developer may pause work, after written notice, until it is paid. Ownership of deliverables passes only on payment in full (section 8).`,

    `## 6. Changes to the Scope`,
    `Requests outside the scope in section 1 are welcome but are handled as a written "Change Order" setting out the extra work, cost and effect on the timeline. Change Orders take effect once both Parties approve them in writing (email or the client portal is enough). Small adjustments the Developer agrees are minor may be done without one.`,

    `## 7. Client Responsibilities`,
    `The Client will: (a) provide content, images, branding, accounts and access (domain, hosting, third-party services) needed for the Project in reasonable time; (b) confirm it owns or has permission to use everything it provides, and that its content is lawful and accurate; (c) name one person who can give feedback and approvals; and (d) be responsible for the legal compliance of its own business, products, prices, and the content it publishes.`,

    `## 8. Intellectual Property`,
    `On payment of the Fee in full, the Client owns the final website and the custom code, designs and content created specifically for the Client in the Project, and the Developer assigns those rights to the Client. The Developer keeps ownership of its pre-existing tools, libraries, templates and know-how, and grants the Client a perpetual, royalty-free, non-exclusive licence to use any of them included in the deliverables. Open-source and third-party components remain under their own licences. Unless the Client objects in writing, the Developer may show the finished work and a short description in its portfolio, without disclosing confidential information.`,

    `## 9. Confidentiality`,
    `Each Party will keep the other's non-public business information confidential, use it only for the Project, and protect it with reasonable care, during the Agreement and for 3 years after. This does not apply to information that is public, already known to the recipient, independently developed, or required to be disclosed by law (with prompt notice where allowed).`,

    `## 10. Privacy and Personal Information`,
    `Each Party will comply with applicable privacy law, including the Personal Information Protection and Electronic Documents Act (PIPEDA) and Alberta's Personal Information Protection Act where they apply. Where the Developer handles personal information on the Client's behalf (for example, form submissions or customer data), it will do so only to perform the Project, keep it secure, not sell it, and return or delete it at the end of the Project unless law requires otherwise. The Client is responsible for its own website privacy policy and for having the right to collect the personal information its site collects.`,

    `## 11. Third-Party Services and Hosting`,
    `The Project may rely on third-party services (for example hosting, domains, payment, email or analytics providers). Their fees are paid by the Client unless the Fee says otherwise, and they are governed by the providers' own terms. The Developer is not responsible for outages, changes, or pricing of third-party services, but will reasonably help resolve issues within the Project.`,

    `## 12. Warranty and Support`,
    `The Developer warrants that it will perform the work professionally and with reasonable skill and care, and that the deliverables will substantially match the agreed scope at acceptance. The Developer will fix defects in its own work reported within ${v.warrantyDays} days after launch at no charge. This warranty does not cover changes made by others, third-party services, new browsers or devices released after launch, or misuse. Except as stated in this section, and to the extent permitted by law, the deliverables are provided without other warranties, express or implied. The Developer does not guarantee specific search rankings, traffic or sales.`,

    `## 13. Limitation of Liability`,
    `To the extent permitted by law: (a) neither Party is liable for indirect, consequential, special or punitive damages, or lost profits, revenue or data; and (b) the Developer's total liability arising from this Agreement is limited to the amount of the Fee paid by the Client. These limits do not apply to a Party's fraud, wilful misconduct, or breach of section 9.`,

    `## 14. Indemnity`,
    `The Client will indemnify the Developer against third-party claims arising from content or materials the Client provides, or from the Client's business, products or services. The Developer will indemnify the Client against third-party claims that original work created by the Developer for the Project infringes that third party's intellectual property, provided the Client promptly notifies the Developer and lets it control the defence.`,

    `## 15. Term and Termination`,
    `This Agreement starts on the Effective Date and continues until the Project is complete and paid for (and, for ongoing services, until cancelled). Either Party may end it: (a) with 14 days' written notice for any reason; or (b) immediately by written notice if the other Party materially breaches it and does not fix the breach within 10 days of being told. On termination the Client pays for work done up to the termination date (at the Fee's pro-rated value), the Developer refunds any amount paid beyond that, and the Developer delivers all completed, paid-for work. Sections 5, 8, 9, 10, 13, 14, 18 and 20 survive termination.`,

    `## 16. Independent Contractor`,
    `The Developer is an independent contractor, not an employee, partner or agent of the Client, and is responsible for its own taxes, tools and working methods.`,

    `## 17. Force Majeure`,
    `Neither Party is liable for delay or failure caused by events beyond its reasonable control (for example natural disasters, pandemics, utility or internet failures, or acts of government), provided it notifies the other Party promptly and resumes as soon as reasonably possible. Payment obligations for work already done are not excused.`,

    `## 18. Disputes and Governing Law`,
    `The Parties will first try in good faith to resolve any dispute by discussion within 30 days. This Agreement is governed by the laws of the Province of ${v.jurisdiction} and the federal laws of Canada applicable there, and the Parties submit to the courts of ${v.jurisdiction}.`,

    `## 19. Electronic Signatures`,
    `The Parties agree to sign this Agreement electronically. An electronic signature (including typing a name and confirming through the Developer's client portal) has the same legal effect as a handwritten signature, in accordance with the Electronic Transactions Act (Alberta) and Part 2 of PIPEDA. The Developer will keep a record of the signature, the date and time, and a fingerprint (SHA-256 hash) of this Agreement's exact text.`,

    `## 20. General`,
    `This Agreement, any accepted Change Orders and any accepted quote form the entire agreement between the Parties about the Project and replace any earlier discussions or estimates. If any part is unenforceable, the rest remains in effect. Changes must be in writing and accepted by both Parties. Neither Party may assign this Agreement without the other's written consent, except the Developer may use subcontractors for parts of the work while remaining responsible for them. Notices are given by email to the addresses above. A Party's delay in enforcing a right is not a waiver of it.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** The defaults a new contract starts with; everything is editable in the admin console. */
export const DEFAULT_EXCLUSIONS = [
  "Writing or sourcing content, photography or video beyond what is listed above",
  "Third-party fees (domain, hosting, paid plugins, payment processing, stock media)",
  "Ongoing maintenance, updates or new features after the warranty period, unless a monthly plan is included",
  "Search engine advertising and ongoing SEO campaigns",
];

export const SCHEDULE_PRESETS: Record<string, { label: string; pct: number }[]> = {
  "40-40-20": [
    { label: "Deposit, on signing", pct: 40 },
    { label: "On design approval", pct: 40 },
    { label: "On launch", pct: 20 },
  ],
  "50-50": [
    { label: "Deposit, on signing", pct: 50 },
    { label: "On launch", pct: 50 },
  ],
  "100-upfront": [{ label: "Before work starts", pct: 100 }],
};
