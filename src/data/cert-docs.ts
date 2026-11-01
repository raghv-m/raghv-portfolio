/**
 * Certificate documents on file, rendered from the original PDFs in
 * ~/workspace/certificates-for-printing/ (page 1, JPEG). These power the
 * document wall on /certifications and the credential thumbnails on the
 * homepage: a row with a real document shows the document, not a stamp.
 *
 * All six earned documents are now filed. `image: null` renders an honest
 * "slot reserved" frame for anything earned but not yet scanned (the
 * CertWall component handles it); never invent a document that is not here.
 */
export type CertDoc = {
  id: string;
  name: string;
  meta: string;
  verify: string;
  image: string | null;
  width: number;
  height: number;
  rotate: number;
  fade: number;
};

export const CERT_DOCS: CertDoc[] = [
  {
    id: "security-plus",
    name: "CompTIA Security+",
    meta: "CompTIA · SY0-701 · certified Jun 15, 2026 · expires Jun 15, 2029",
    verify: "Candidate ID COMP001022991483 · verify code 6d90266ab020473b98077f3520048a59 at verify.CompTIA.org, printed on the document",
    image: "/images/certs/security-plus-1.jpg",
    width: 1760,
    height: 1360,
    rotate: -1.6,
    fade: 1,
  },
  {
    id: "isc2-cc",
    name: "ISC2 Certified in Cybersecurity (CC)",
    meta: "ISC2 · certification no. 4332427 · cycle Jul 1, 2026 to Jun 30, 2029",
    verify: "Certified since 2026 · certification number printed on the document",
    image: "/images/certs/isc2-cc-1.jpg",
    width: 1760,
    height: 1360,
    rotate: 1.2,
    fade: 0.97,
  },
  {
    id: "google-foundations",
    name: "Google — Foundations of Cybersecurity",
    meta: "Google · via Coursera · Jan 8, 2026",
    verify: "Verify code RMT26QI2LCT7, printed on the document",
    image: "/images/certs/google-foundations-1.jpg",
    width: 1430,
    height: 1105,
    rotate: -0.8,
    fade: 1,
  },
  {
    id: "google-play-it-safe",
    name: "Google — Play It Safe: Manage Security Risks",
    meta: "Google · via Coursera · Jan 18, 2026",
    verify: "Verify code 2O740XCWD0K4, printed on the document",
    image: "/images/certs/google-play-it-safe-1.jpg",
    width: 1430,
    height: 1105,
    rotate: 1.4,
    fade: 0.96,
  },
  {
    id: "google-connect-and-protect",
    name: "Google — Connect and Protect: Networks and Network Security",
    meta: "Google · via Coursera · Jan 28, 2026",
    verify: "Verify code CJO2CN150VW7, printed on the document",
    image: "/images/certs/google-connect-and-protect-1.jpg",
    width: 1430,
    height: 1105,
    rotate: -1.9,
    fade: 0.99,
  },
  {
    id: "first-aid",
    name: "Intermediate First Aid",
    meta: "APEX · CSA Standard Z1210-17 · issued Oct 2, 2026 · valid to Oct 2, 2029",
    verify: "Certificate no. 10748425, printed on the document",
    image: "/images/certs/first-aid-1.jpg",
    width: 1105,
    height: 1430,
    rotate: 0.7,
    fade: 1,
  },
];
