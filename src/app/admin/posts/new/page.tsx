import { requireAdmin } from "@/lib/session";
import PostEditor from "@/components/admin/PostEditor";

export default async function NewPostPage() {
  await requireAdmin();
  return <PostEditor />;
}
