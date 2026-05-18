# 🎙️ Facilitator Guide — Copilot Squad (40 min)

Everything you need to run this workshop. Read it once before you present.

## The arc

Attendees build a **squad of custom Copilot agents** — mascot pets that wander a
navbar — and finish by using the squad to recruit a new member *live*. The energy
comes from the payoff: at minute 38 a new pet visibly walks into the app, built by
the agents they just made.

**One sentence to open with:** *"In the next 40 minutes you'll build a team of AI
coworkers — give them names, jobs, and tools — and watch them build software
together. By the end, one of them will hire the next one."*

## Pre-flight — send this 1 day before

> Install **VS Code** + **GitHub Copilot** + **Copilot Chat** extensions (signed
> in). Install **Node 18+** and **git**. Then clone the repo, run `npm install`
> and `npm run dev`, and confirm you see pets wandering a navbar.

If you skip this, you lose 10 minutes to setup. Don't skip it.

## Your own pre-flight (do this morning-of)

- [ ] `npm install && npm run dev` works; app loads with **5** pets.
- [ ] Copilot Chat opens; the agent dropdown is visible.
- [ ] `solution` branch exists: `git branch -a`.
- [ ] Projector test: the navbar pets and Copilot Chat are both legible.
- [ ] Have the `solution` branch open in a second window as your safety net.

---

## Run of show — 40 minutes

### 0:00–0:04 · Hook + concept (4 min)

- Show **Squad HQ** running. Hover a pet — it talks. Click one — it jumps to its
  card. Type a mission into Mission Control, hit *Route it* — Captain picks an
  agent. Let the room react.
- The reveal: **"Every pet is a real Copilot agent. Its brain is a file in
  `.github/`. The sixth pet is missing — you'll hire it by minute 40."**
- Name the four ideas on one slide: **Instructions · Agents · Skills ·
  Orchestration.** That's the whole workshop.

### 0:04–0:12 · LAB 1 — Squad Charter (8 min)

- Concept (1 min): `.github/copilot-instructions.md` loads into *every* chat. It's
  the difference between Copilot guessing and Copilot *knowing*.
- Attendees do [LAB 1](labs/LAB-1-instructions.md).
- **Demo the contrast** on the projector: ask Copilot a project question before
  and after. The "after" is specific. That's the whole point — make it visible.

### 0:12–0:21 · LAB 2 — Recruit Hammer (9 min)

- Concept (1.5 min): an agent = persona + **scoped tools** + handoffs. Hammer the
  point hard: **Scout has no `editFiles` — it literally cannot change code.** Tools
  are a safety boundary, not a suggestion.
- Attendees do [LAB 2](labs/LAB-2-first-agent.md).
- Walk the room. The #1 stumble is the agent not appearing in the dropdown — fix
  is *Reload Window* (see pitfalls).
- Demo: pick Hammer, give it the "LIVE badge" task, show it answer in persona and
  offer the Hawk handoff.

### 0:21–0:30 · LAB 3 — Forge a Skill (9 min)

- Concept (1.5 min): agent = *who*, skill = *what*. Prompt files run as `/slash`
  commands and take `${input:...}` variables. This skill scaffolds a whole
  teammate in one command — sell it as "the squad's most powerful tool."
- Attendees do [LAB 3](labs/LAB-3-skills.md).
- They build the skill but **do not run it** — build anticipation for LAB 4.
- Demo: type `/` in chat, show `recruit-squad-member` in the menu.

### 0:30–0:40 · LAB 4 — Assemble the Squad (10 min)

- Concept (2 min): orchestration. `agents:` (subagents) + `handoffs:`. An agent
  that commands agents. This is the pattern that scales.
- Attendees do [LAB 4](labs/LAB-4-the-squad.md): build Captain → give it a
  mission → run `/recruit-squad-member` → **reload the app**.
- **The payoff (do this together, on the projector):** everyone reloads Squad HQ.
  A sixth pet — Quill the owl — wanders in. Land the line: *"Your agents just
  hired their own teammate."*
- Close (1 min): recap the four ideas; point at the "Take it home" list in LAB 4.

---

## Live-demo tips

- **Keep `solution` open in a second window.** If an attendee's agent file is
  malformed, paste from solution and move on — don't debug YAML in front of 30
  people.
- The recruit skill in LAB 4 edits real files. If it stalls, you can `git checkout
  solution -- src/squad.ts src/mascots.ts` and copy `quill.agent.md` from solution
  — the pet still appears. The payoff survives.
- Type missions in the agent's voice ("Hammer, build…"). It's contagious; the room
  starts doing it too.

## Common pitfalls

| Symptom | Fix |
|---------|-----|
| New agent/skill not in the dropdown or `/` menu | `Cmd/Ctrl+Shift+P` → **Developer: Reload Window**. VS Code picks up `.github/agents` + `.github/prompts` on reload. |
| Agent ignores its persona | The file has no body, or it's in the wrong folder. Must be `.github/agents/*.agent.md`. |
| `${input:...}` not prompting | Check the `.prompt.md` extension and that it's under `.github/prompts/`. |
| Build fails after LAB 4 | A squad entry references an animal with no builder. Check `src/mascots.ts` `BUILDERS` map + the `animal` union in `squad.ts`. |
| Pets not moving | JS error — open the browser console. Usually a typo in `src/squad.ts`. |
| Behind on time | LAB 3 can be trimmed to "study the example + confirm it's in the menu" — the solution skill file already works. |

## If you have extra time (bonus)

- Run `/squad-standup` — the Captain reports on the repo in every agent's voice.
- Run `/review-pr` as Hawk on the LAB 4 changes.
- Show `gh copilot suggest "undo my last git commit"` in the terminal.
- Move an agent to `~/.copilot/agents` so it follows you across every repo.

## The point to leave them with

Custom agents aren't a gimmick. A scoped agent with the right tools and a sharp job
description is **more reliable** than a generic chat — because you've removed its
ability to do the wrong thing. The squad is just a fun way to feel that.
