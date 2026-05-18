# Copilot Command Centre — Repository Instructions

These instructions are loaded automatically into **every** Copilot Chat request in
this repo. Keep them short, true, and high-signal — this is the army's shared brain.

## What this project is

**Command Centre** is a small Vite + TypeScript single-page app. It visualizes a army of
AI agents as animated mascot "pets" that wander a navbar. It is the playground for the
*Copilot Command Centre* workshop — the app is where the agents do their work.

## Tech stack

- **Vite 5** + **vanilla TypeScript** (no framework, no JSX).
- Plain DOM APIs (`document.createElement`, `innerHTML`, `addEventListener`).
- One stylesheet: `src/style.css`. No CSS framework, no preprocessor.
- No runtime dependencies — keep it that way. Do not add npm packages.

## Project map

| Path | What it is |
|------|-----------|
| `src/squad.ts` | The roster — single source of truth for soldiers. |
| `src/mascots.ts` | One SVG builder per animal. |
| `src/missions.ts` | The mission engine — plans a route and runs it as a live relay. |
| `src/navbar.ts` | The animated "Deck" — mascots wander, spotlight, hand off. |
| `src/dashboard.ts` | HQ panels: HUD, mission control, roster. |
| `src/main.ts` | Entry point — wires every panel to the shared MissionEngine. |
| `.github/agents/` | The army's Copilot agents (one `.agent.md` per member). |
| `.github/prompts/` | Reusable skills, runnable as `/slash` commands. |

## Code conventions

- **TypeScript strict.** No `any`. Type every export. No unused locals or params.
- Prefer small pure functions and `const`. Use `interface` for object shapes.
- Comments explain **why**, never **what**. Default to no comment.
- 2-space indent, single quotes, semicolons. Match the surrounding file.
- When you add a soldier, update `squad.ts` **and** add matching art in
  `mascots.ts` **and** create `.github/agents/<id>.agent.md`. All three, or none.
- Never break the build. `npm run build` must stay green.

## How the army works

Each soldier is a **custom agent** in `.github/agents/`. Each agent has a
narrow job, a restricted tool set, and a personality. The **Captain** agent routes
work to the right teammate. Reusable multi-step jobs live as **skills** (prompt
files) in `.github/prompts/`.

When you act as a soldier: stay in your lane, do your one job well, and hand off
explicitly when the work belongs to a teammate.
