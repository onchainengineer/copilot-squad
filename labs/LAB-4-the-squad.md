# LAB 4 — Assemble the Army 🐕 ⏱️ ~10 min

> **You'll learn:** orchestration — an agent that commands other agents, with
> subagents and handoffs. Then you run the whole army, live.

## Why this matters

You have specialists. But who decides *which* specialist? Who sequences a job that
needs three of them? That's an **orchestrator agent** — and it's the most powerful
pattern in Copilot's toolkit.

An orchestrator uses two extra frontmatter fields:

- **`agents:`** — other agents it can invoke as **subagents**.
- **`handoffs:`** — buttons to pass control to a teammate.

You're building **Captain** — and then using the assembled army to recruit the
missing sixth soldier.

## Step 1 — Build the Captain (4 min)

Create **`.github/agents/captain.agent.md`**.

Frontmatter — note `agents:` lists the whole army as subagents:

```yaml
---
name: Captain
description: Orchestrator agent — reads any mission and routes it to the right teammate
tools: ['codebase', 'search', 'usages']
agents: ['Scout', 'Hammer', 'Hawk', 'Patch', 'Quill']
handoffs:
  - label: Send to Scout (recon)
    agent: Scout
    prompt: Run recon on the mission described above.
    send: false
  - label: Send to Hammer (build)
    agent: Hammer
    prompt: Build the feature described above.
    send: false
  - label: Send to Patch (fix)
    agent: Patch
    prompt: Fix the bug described above.
    send: false
---
```

> `Quill` is in the `agents:` list even though it doesn't exist yet — you're about
> to recruit it. Add Hawk/Quill handoffs too if you like.

In the body, give Captain its job: **route, don't do**. It should classify a
mission, name the soldier(s) for it, plan multi-step chains
(*recon → build → review*), and dispatch. Give it a routing table:

| Mission is about… | Send to |
|-------------------|---------|
| finding / understanding | Scout 🦊 |
| building a feature | Hammer 🦫 |
| reviewing a change | Hawk 🦅 |
| a bug | Patch 🐙 |
| docs | Quill 🦉 |

The one rule that matters: **the Captain never writes code itself.** If it's
tempted to, that's the signal to delegate.

## Step 2 — Give the Captain a mission (2 min)

Reload VS Code. Pick **Captain** from the agent dropdown. Then:

```
Captain, the army is missing a Scribe — an agent that writes docs and
comments. Plan how we recruit one.
```

Captain should produce a **mission briefing**: classify it, and point at the
`/recruit-soldier` skill as the tool for the job. The army is thinking
together. 🧠

## Step 3 — Recruit Quill, live 🦉 (3 min)

Now run the skill you forged in LAB 3. In Copilot Chat:

```
/recruit-soldier
```

Provide the inputs when prompted:

- **name:** `Quill`
- **animal:** `owl`
- **role:** `Scribe Agent`
- **color:** `#14b8a6`
- **specialty:** `Writes the docs, comments, and READMEs that make the codebase make sense.`

The skill will: add Quill to `src/squad.ts`, wire up the owl soldier, create
`.github/agents/quill.agent.md`, and run the build.

## Step 4 — The payoff (1 min)

Look at the running app (`npm run dev` — reload the page if needed):

🎉 **A sixth soldier — Quill the owl — is now wandering the navbar.**

Open the agent dropdown: **Quill** is now a teammate you can chat with. You built
an agent, a skill, and an orchestrator — and used them together to grow the army.

## ✅ Done when

- [ ] `.github/agents/captain.agent.md` exists with `agents:` + `handoffs:`
- [ ] Captain produces a routing plan instead of doing the work itself
- [ ] `/recruit-soldier` created Quill across all three files
- [ ] Six soldiers wander Command Centre; **Quill** is in the agent dropdown
- [ ] `npm run build` is green

## Stuck? Peek at the answer key

```bash
git show solution:.github/agents/captain.agent.md
git diff main solution -- src/squad.ts
```

---

## 🏁 You did it

You now know the full Copilot customization stack:

- **Instructions** — shared knowledge for every chat
- **Agents** — specialists with scoped tools and personas
- **Skills** — reusable `/slash` jobs
- **Orchestration** — agents that command agents

### Take it home

- Build a 7th soldier for *your* real repo — a reviewer tuned to your conventions.
- Turn your team's most-repeated request into a `.prompt.md` skill.
- Move a favorite agent to your user profile (`~/.copilot/agents`) to reuse it
  across every project.
- Try the GitHub Copilot CLI: `gh copilot suggest` / `gh copilot explain`.
