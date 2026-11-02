import { Skel, SkelPageHead } from "@/components/casefile/Skeleton";

/**
 * Blog index loading state: mirrors BlogContent (head, filter chips, the
 * numbered archive rows) so the page lands in the shape it loads into.
 */
export default function BlogLoading() {
  return (
    <div className="cf-wrap pb-24" role="status" aria-busy="true" aria-label="Loading the blog">
      <div className="max-w-4xl mx-auto">
        <SkelPageHead />

        {/* Filter chips */}
        <div className="flex gap-2 mt-10 mb-10 flex-wrap" aria-hidden="true">
          {[76, 104, 88, 118].map((w, i) => (
            <Skel key={i} w={w} h={32} />
          ))}
        </div>

        {/* Archive rows */}
        <div style={{ borderTop: "2px solid var(--cf-ink)" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-start gap-5 py-6"
              style={{ borderBottom: "1px solid var(--cf-faint)" }}
              aria-hidden="true"
            >
              <Skel w={30} h={18} style={{ marginTop: 3 }} />
              <Skel w={86} h={13} style={{ marginTop: 5 }} />
              <div className="flex-1 min-w-0">
                <Skel w={`${58 + ((i * 13) % 30)}%`} h={21} />
                <Skel w={`${88 - ((i * 7) % 18)}%`} h={13} style={{ marginTop: 9 }} />
                <Skel w="42%" h={11} style={{ marginTop: 10 }} />
              </div>
              <Skel w={64} h={13} style={{ marginTop: 5 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
