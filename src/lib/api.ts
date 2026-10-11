import { NextResponse } from "next/server";

/**
 * One shape for every API error: { error: "short message", status }. The message is written
 * for people (forms show it as-is); internal details only go to the server log.
 */
export function apiError(status: number, message: string, headers?: HeadersInit) {
  return NextResponse.json({ error: message, status }, { status, headers });
}

/** Logs an unexpected failure with context and returns a generic 500. */
export function apiFailure(context: string, error: unknown, message = "Something went wrong on our side. Please try again.") {
  console.error(`[api] ${context}`, error);
  return apiError(500, message);
}

/** The first validation problem as a plain sentence, e.g. "title: Required". */
export function zodMessage(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const first = error.issues[0];
  if (!first) return "Some fields are missing or invalid.";
  const field = first.path.map(String).join(".");
  return field ? `${field}: ${first.message}` : first.message;
}

/**
 * Wraps a route handler so an unexpected throw becomes a logged, generic JSON 500 instead of
 * Next's HTML error page. Next's own control-flow errors (redirect, notFound...) pass through.
 */
export function withApiErrors<A extends unknown[]>(context: string, handler: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      const digest = (error as { digest?: unknown } | null)?.digest;
      if (typeof digest === "string" && digest.startsWith("NEXT_")) throw error;
      return apiFailure(context, error);
    }
  };
}
