import { permanentRedirect } from "next/navigation";

/**
 * The career roadmap merged into /experience (round 2). This route stays as
 * a permanent redirect so old links and bookmarks land on the combined page.
 */
export default function CareerPage() {
  permanentRedirect("/experience");
}
