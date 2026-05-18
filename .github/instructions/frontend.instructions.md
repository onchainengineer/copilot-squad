---
applyTo: "src/**/*.ts"
---

# Frontend instructions — Command Centre app code

These rules apply to any TypeScript file under `src/`. They load **on top of** the
repo-wide `copilot-instructions.md` whenever an `src/**/*.ts` file is in context.

## DOM, not framework

- No React, no JSX, no framework. Plain DOM: `createElement`, `innerHTML`,
  `addEventListener`, `querySelector`.
- Build markup with template literals. Keep them readable.
- When injecting text that could come from user input, do not interpolate it raw
  into `innerHTML`. The army roster data is trusted; user-typed strings are not.

## Types

- Every exported function and value is explicitly typed.
- Object shapes use `interface`. Unions are spelled out (see the `animal` union
  in `squad.ts`).
- No `any`, no non-null `!` unless the value is genuinely guaranteed.

## Animation code

- The navbar loop in `navbar.ts` is driven by `requestAnimationFrame`. Do not put
  CSS `transition` on properties that the rAF loop writes (`transform` on `.pet`) —
  they will fight.
- Keep per-frame work cheap: no DOM queries inside the loop, cache element refs.

## Style

- 2-space indent, single quotes, semicolons.
- Small pure functions. `const` by default.
- A comment must justify its existence by explaining *why*. Otherwise delete it.
