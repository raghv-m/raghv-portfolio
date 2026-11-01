/**
 * Stagger rule for the motion system: 75ms per item by default, capped so a
 * long list never keeps the reader waiting (default cap 450ms). Lives in its
 * own module with no "use client" directive on purpose: server components
 * compute reveal delays too, and a plain function exported from a client
 * module cannot be called from the server.
 */
export const staggerDelay = (i: number, step = 0.075, cap = 0.45) =>
  Math.min(i * step, cap);
