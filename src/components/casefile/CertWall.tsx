import type { CSSProperties } from "react";
import Image from "next/image";

import { CERT_DOCS } from "@/data/cert-docs";
import { Reveal } from "./Reveal";

/**
 * The document wall: every certificate he can produce, filed as a paper
 * exhibit — each at its own tilt and fade, settling straighter on hover.
 * All six earned documents are filed; the empty-frame branch stays for any
 * future credential earned before its scan lands in src/data/cert-docs.ts.
 */
export function CertWall() {
  return (
    <div className="cf-docwall">
      {CERT_DOCS.map((doc, i) => (
        <Reveal key={doc.id} delay={0.05 + (i % 2) * 0.08}>
          <figure
            className="cf-doc"
            style={{ "--tilt": `${doc.rotate}deg`, opacity: doc.fade } as CSSProperties}
          >
            {doc.image ? (
              <Image src={doc.image} alt={`${doc.name} certificate issued to Raghav Mahajan`} width={doc.width} height={doc.height} />
            ) : (
              <div className="cf-pending-frame" style={{ aspectRatio: `${doc.width} / ${doc.height}` }}>
                <span className="cf-pending-tag">Slot reserved</span>
                <p className="cf-caption" style={{ maxWidth: 300 }}>
                  The credential is earned and listed below. The document scan has not been filed yet.
                </p>
              </div>
            )}
            <figcaption className="cf-caption">
              <b>{doc.name}.</b> {doc.meta}
              {doc.verify ? <> · {doc.verify}.</> : null}
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
