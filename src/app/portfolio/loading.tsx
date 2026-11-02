import { Skel, SkelPageHead } from "@/components/casefile/Skeleton";

/**
 * Portfolio loading state: the head, then exhibit panels down the rail,
 * each with a title block, copy lines and stack chips.
 */
export default function PortfolioLoading() {
  return (
    <div className="cf-wrap pb-24" role="status" aria-busy="true" aria-label="Loading the portfolio">
      <SkelPageHead />

      <div style={{ marginTop: 56 }} aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              border: "2px solid var(--cf-ink)",
              background: "var(--cf-paper-2)",
              padding: 26,
              marginTop: i === 0 ? 0 : 28,
              boxShadow: "6px 6px 0 var(--cf-shadow)",
            }}
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <Skel w={`${44 + ((i * 9) % 16)}%`} h={27} />
                <Skel w="30%" h={13} style={{ marginTop: 12 }} />
              </div>
              <Skel w={86} h={20} />
            </div>
            <Skel w="100%" h={13} style={{ marginTop: 22 }} />
            <Skel w="93%" h={13} style={{ marginTop: 9 }} />
            <Skel w="68%" h={13} style={{ marginTop: 9 }} />
            <div className="flex gap-2 flex-wrap" style={{ marginTop: 20 }}>
              {[64, 92, 78, 104, 70].map((w, j) => (
                <Skel key={j} w={w} h={24} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
