import { permanentRedirect } from "next/navigation";

/**
 * The home lab merged into /cybersecurity as its #home-lab section
 * (round 2). This route stays as a permanent redirect so old links and
 * bookmarks land on the lab section of the combined page.
 */
export default function HomelabPage() {
  permanentRedirect("/cybersecurity#home-lab");
}
