# Copilot Command Centre — Repository Instructions

These instructions are loaded automatically into **every** Copilot Chat request in
this repo. Keep them short, true, and high-signal — this is the squad's shared brain.

## What this project is

TODO: Describe Command Centre in 2–3 sentences — what the app is, and that it is the
playground for the Copilot Command Centre workshop.

## Tech stack

- **Vite 5** + **vanilla TypeScript** (no framework, no JSX).
- Plain DOM APIs (`document.createElement`, `innerHTML`, `addEventListener`).
- One stylesheet: `src/style.css`. No CSS framework, no preprocessor.
- No runtime dependencies — keep it that way. Do not add npm packages.

## Project map

TODO: A short table of what each file under `src/` does — `squad.ts`,
`mascots.ts`, `missions.ts`, `navbar.ts`, `dashboard.ts`, `main.ts`.

## Code conventions

- **TypeScript strict.** No `any`. Type every export. No unused locals or params.
- Prefer small pure functions and `const`. Use `interface` for object shapes.
- Comments explain **why**, never **what**. Default to no comment.
- 2-space indent, single quotes, semicolons. Match the surrounding file.
- When you add a squad member, update `squad.ts` **and** add matching art in
  `mascots.ts` **and** create `.github/agents/<id>.agent.md`. All three, or none.
- Never break the build. `npm run build` must stay green.

## How the army works

TODO: Explain that each soldier is a custom agent in `.github/agents/`,
reusable skills live in `.github/prompts/`, and each agent stays in its lane.
