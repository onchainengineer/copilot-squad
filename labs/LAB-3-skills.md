# LAB 3 — Forge a Skill 🛠️ ⏱️ ~9 min

> **You'll learn:** prompt files — reusable, parameterized jobs you run as `/slash`
> commands in Copilot Chat.

## Why this matters

An **agent** is a *who*. A **skill** is a *what* — a job you do over and over,
captured once so anyone can run it perfectly every time. In Copilot, skills are
**prompt files**: `.github/prompts/*.prompt.md`, runnable by typing `/name`.

You're going to forge the army's most powerful skill: **`/recruit-soldier`** —
a one-command scaffold that creates a whole new soldier (roster entry + soldier art
+ agent file). You'll *use* it in LAB 4.

## Step 1 — Study a worked example (2 min)

Open `.github/prompts/review-pr.prompt.md`:

```yaml
---
name: review-pr
description: Run Hawk's full structured review on the current pending changes
agent: Hawk
tools: ['codebase', 'search', 'usages', 'changes', 'problems']
---
```

Key fields:

- `name` — what you type after `/` in chat (`/review-pr`).
- `agent` — which agent runs it. `Hawk` here; can also be `agent`, `ask`, `plan`.
- `tools` — tools available for this run.
- The **body** is the instructions. It can pull in user input with
  `${input:name:placeholder}` variables.

**Agent vs. skill:** an agent is a persistent persona you *switch into*. A skill is
a one-shot job you *invoke* — and it can target any agent.

## Step 2 — Create the skill (5 min)

Create **`.github/prompts/recruit-soldier.prompt.md`**.

Frontmatter — this skill edits files and runs the build, so:

```yaml
---
name: recruit-soldier
description: Scaffold a brand-new soldier — roster entry, soldier art, agent file
argument-hint: name=Quill animal=owl role="Scribe Agent"
agent: agent
tools: ['codebase', 'search', 'editFiles', 'runCommands', 'problems']
---
```

In the body, write the recruitment procedure. It should:

1. **Collect inputs** with `${input:...}` variables — name, animal, role, accent
   color, specialty. For example:
   ```
   - **Name:** ${input:name:Display name, e.g. Quill}
   - **Animal:** ${input:animal:owl, fox, beaver…}
   ```
2. **Add a roster entry** to `src/squad.ts` — a full `SquadMember` object, every
   field filled, with a catchphrase and 4 quips in the new soldier's voice.
3. **Handle soldier art** in `src/mascots.ts` — reuse an existing animal's builder,
   or add a new one + extend the `animal` union if the animal is new.
4. **Create the agent file** `.github/agents/<id>.agent.md`, modeled on the
   existing agents.
5. **Run `npm run build`** to verify, and report what it created.

The whole point of a skill: write the procedure **once**, correctly, so it runs
the same way every time — no matter who triggers it.

## Step 3 — Confirm the skill is live (2 min)

1. Reload VS Code if needed.
2. In Copilot Chat, type `/` — you should see **`recruit-soldier`** in the
   list, with your `description` next to it.

**Don't run it yet.** That's the grand finale — LAB 4.

## ✅ Done when

- [ ] `.github/prompts/recruit-soldier.prompt.md` exists
- [ ] It uses `${input:...}` variables for the new soldier's details
- [ ] `/recruit-soldier` appears in the Copilot Chat `/` menu

## Stuck? Peek at the answer key

```bash
git show solution:.github/prompts/recruit-soldier.prompt.md
```

---

➡️ **Next:** [LAB 4 — Assemble the Army](LAB-4-the-squad.md). Time to build the
Captain and watch the whole army work together — live.
