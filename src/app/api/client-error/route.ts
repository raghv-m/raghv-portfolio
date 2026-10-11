import { z } from "zod";

import { apiError, withApiErrors } from "@/lib/api";
import { getClientIp, hashIp, rateLimit } from "@/lib/rateLimit";

const report = z.object({
  digest: z.string().max(100).nullable(),
  message: z.string().max(300),
  path: z.string().max(300),
});

/** Receives errors caught by error.tsx / global-error.tsx and writes them to the server log. */
async function handlePOST(req: Request) {
  const limit = await rateLimit(hashIp(getClientIp(req)), "clientError");
  if (!limit.success) return new Response(null, { status: 204 });

  const parsed = report.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError(400, "Invalid report.");

  const { digest, message, path } = parsed.data;
  console.error(`[client-error] ${path} digest=${digest ?? "none"} ${message.replace(/\s+/g, " ")}`);
  return new Response(null, { status: 204 });
}

export const POST = withApiErrors("POST /api/client-error", handlePOST);
