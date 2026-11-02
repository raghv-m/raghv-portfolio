import { Skel } from "@/components/casefile/Skeleton";

/**
 * Single-post loading state: kicker, two-line display title, meta row,
 * then paragraph blocks in the measure the article sets in.
 */
export default function BlogPostLoading() {
  return (
    <div className="cf-wrap pb-24" role="status" aria-busy="true" aria-label="Loading the post">
      <div className="max-w-3xl mx-auto" style={{ paddingTop: 56 }}>
        <Skel w={170} h={12} />
        <Skel w="94%" h={46} style={{ marginTop: 20 }} />
        <Skel w="62%" h={46} style={{ marginTop: 10 }} />
        <div className="flex items-center gap-4" style={{ marginTop: 24 }} aria-hidden="true">
          <Skel w={120} h={12} />
          <Skel w={84} h={12} />
          <Skel w={96} h={12} />
        </div>

        <div style={{ marginTop: 44 }} aria-hidden="true">
          {[100, 97, 100, 88, 100, 64].map((w, i) => (
            <Skel key={i} w={`${w}%`} h={14} style={{ marginTop: i === 0 ? 0 : 11 }} />
          ))}
        </div>

        <Skel w="38%" h={26} style={{ marginTop: 44 }} />
        <div style={{ marginTop: 22 }} aria-hidden="true">
          {[100, 92, 100, 96, 71].map((w, i) => (
            <Skel key={i} w={`${w}%`} h={14} style={{ marginTop: i === 0 ? 0 : 11 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
