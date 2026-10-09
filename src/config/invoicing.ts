/**
 * Your business details for invoices and contracts. Edit here, not in the PDF or contract code.
 *
 * The address and phone appear only on private documents (invoices, contracts), never on the
 * public website.
 *
 * TODO(owner):
 *  - Trade name: in Alberta you must register a trade name before trading under it (any registry
 *    agent, about $60-$100). Once registered, set tradeNameRegistered: true and documents will read
 *    "Raghav Mahajan, operating as Raghv Digital".
 *  - If you register for GST/HST (mandatory once revenue passes $30,000 in four consecutive
 *    quarters), set gstNumber; invoices then need tax lines before you charge it.
 */
const tradeName = "Raghv Digital";
const tradeNameRegistered = false;

export const invoicing = {
  businessName: tradeNameRegistered ? tradeName : "Raghav Mahajan",
  tradeName,
  tradeNameRegistered,
  /** The legal party on contracts and invoices. A sole proprietor contracts in their own name. */
  legalName: tradeNameRegistered ? `Raghav Mahajan, operating as ${tradeName}` : "Raghav Mahajan (sole proprietor)",
  tagline: "Web Development & Cybersecurity",
  addressLines: ["Unit 303, 107 Watt Common SW", "Edmonton, AB T6X 3C6", "Canada"],
  phone: "825-343-1168",
  email: "raaghvv0508@gmail.com",
  website: "raghv.dev",
  gstNumber: null as string | null,
  defaultCurrency: "cad",
  /** Shown under the totals. */
  paymentInstructions: "Payment by Interac e-Transfer to the email above. Please include the invoice number.",
  /** Ways clients can pay; offered in the questionnaire and written into contracts. */
  paymentMethods: ["Interac e-Transfer", "Bank transfer (EFT)", "Credit card (via secure payment link)", "Cheque"],
  /** Days to pay after an invoice is issued. */
  paymentTermsDays: 14,
  /** Monthly interest on overdue balances. The Interest Act (s. 4) requires the yearly rate too. */
  lateInterestMonthlyPct: 1.5,
  lateInterestAnnualPct: 19.56,
  /** Deposit taken before work starts, as a % of the project fee (written into contracts). */
  depositPct: 40,
  jurisdiction: "Alberta",
} as const;

/** The legal lines printed at the bottom of every invoice. */
export function invoiceLegalLines(): string[] {
  const gst = invoicing.gstNumber
    ? `GST/HST registration no. ${invoicing.gstNumber}.`
    : "GST/HST not charged: the supplier is a small supplier not registered for GST/HST (Excise Tax Act, s. 148).";
  return [
    `Payment terms: net ${invoicing.paymentTermsDays} days from the invoice date, in the currency shown.`,
    `Overdue balances bear interest at ${invoicing.lateInterestMonthlyPct}% per month (${invoicing.lateInterestAnnualPct}% per year), calculated monthly, from the due date until paid.`,
    gst,
    `Issued under the services agreement between the parties (if any) and the terms at ${invoicing.website}/terms. Governed by the laws of ${invoicing.jurisdiction} and the federal laws of Canada applicable there.`,
    `Questions about this invoice: ${invoicing.email}. Thank you for your business.`,
  ];
}
