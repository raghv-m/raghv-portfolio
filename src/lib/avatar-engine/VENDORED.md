# Vendored avatar engine

These modules are the rendering/playback engine of **Bible Strong Avatar
Lab** (`@bible-strong/avatar-core` 0.1.0, AGPL-3.0-only — see
`LICENSE.avatar-lab.txt`), copied from the package sources so the site's
procedural avatar can run under this site's Content-Security-Policy.

Why not the npm package itself? The published package validates avatar
definitions with AJV, which compiles its JSON schema with `new Function`
when the module loads. The site's CSP allows no `'unsafe-eval'`, so the
import throws `EvalError` in the browser and React discards the avatar.

What changed, exactly:

- `avatarDefinition.ts` — the AJV schema check was removed (documented in
  the file header). The dependency-free structural and semantic checks are
  verbatim upstream. The site's definition (`src/data/avatar.json`) is
  validated against the full upstream AJV schema at build/design time
  with the published package, so no validation coverage is lost where it
  matters.
- `runtime.ts` — one lint-only change: a `let` that is only ever mutated,
  never reassigned, is a `const` here (`prefer-const`); behaviour is
  identical.
- Every other module is a verbatim copy of the package source.

The React player (`src/components/casefile/AvatarPlayer.tsx`) is a thin
port of the upstream `@bible-strong/avatar-react` component's paint and
playback loop, written against this engine.
