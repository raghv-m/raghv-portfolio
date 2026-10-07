/**
 * What appears on invoices as "from". Edit here, not in the PDF code.
 * TODO(owner): if you register for GST/HST (required once revenue passes $30k in 4 quarters),
 * add the number here and tax lines to invoices before charging it.
 */
export const invoicing = {
  businessName: "Raghav Mahajan",
  tagline: "Software & Security",
  addressLines: ["Edmonton, Alberta", "Canada"],
  email: "raaghvv0508@gmail.com",
  website: "raghv.dev",
  gstNumber: null as string | null,
  defaultCurrency: "cad",
  /** Shown under the totals. */
  paymentInstructions: "Payment by Interac e-Transfer to the email above. Please include the invoice number.",
} as const;
