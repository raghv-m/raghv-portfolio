import * as React from "react";

/**
 * React's <ViewTransition>, reached through a shim on purpose.
 *
 * The App Router runtime ships a React build that includes ViewTransition
 * (see node_modules/next/dist/docs/01-app/02-guides/view-transitions.md:
 * "View transitions work in the App Router with no configuration"), but the
 * published @types/react (checked: 19.2.17) does not declare the export yet,
 * so a direct import fails the production type check. This wrapper picks the
 * real component up at runtime when it exists and renders children bare when
 * it does not, so navigation never breaks either way; the CSS in
 * src/app/ux-pass.css carries the actual animation.
 */

export type ViewTransitionClass = string | Record<string, string>;

export type ViewTransitionProps = {
  name?: string;
  enter?: ViewTransitionClass;
  exit?: ViewTransitionClass;
  share?: ViewTransitionClass;
  default?: ViewTransitionClass;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

const RuntimeViewTransition = (
  React as unknown as { ViewTransition?: React.ComponentType<ViewTransitionProps> }
).ViewTransition;

export function ViewTransition(props: ViewTransitionProps) {
  if (RuntimeViewTransition) return <RuntimeViewTransition {...props} />;
  return <>{props.children}</>;
}
