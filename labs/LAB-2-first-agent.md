# LAB 2 — Recruit Hammer 🦫 ⏱️ ~9 min

> **You'll learn:** custom agents — a named teammate with its own persona, its own
> tool set, and the ability to hand work to other agents.

## Why this matters

Custom instructions shape *every* chat the same way. But real work needs
*specialists* — a builder thinks differently from a reviewer. A **custom agent**
is a persona you can pick from the Copilot Chat dropdown: it has a focused job,
a **restricted set of tools**, and **handoffs** to teammates.

The army already has Scout, Hawk, and Patch. **Hammer the Builder is missing.**
You're recruiting it.

## Step 1 — Study a worked example (2 min)

Open `.github/agents/scout.agent.md`. Every agent file has two parts:

**① YAML frontmatter** — the config:

```yaml
---
name: Scout
description: Recon agent — maps the codebase, finds where things live
tools: ['codebase', 'search', 'usages', 'fetch', 'githubRepo']
handoffs:
  - label: Hand to Hammer to build it
    agent: Hammer
    prompt: Build the feature described in the recon report above.
    send: false
---
```

- `name` / `description` — what shows in the agent picker.
- `tools` — **what this agent is allowed to do.** Scout is read-only: it can
  search and read, but it has **no `editFiles`** — it physically cannot change
  code. That restriction *is* the design.
- `handoffs` — buttons that pass the work to another agent.

**② The Markdown body** — the agent's system prompt: its personality, its
operating procedure, its output format, its rules.

## Step 2 — Create Hammer (5 min)

Create a new file: **`.github/agents/hammer.agent.md`**.

Give it this frontmatter — note Hammer **can** edit files and run commands,
because a builder must:

```yaml
---
name: Hammer
description: Builder agent — turns plans into working code, ships features
tools: ['codebase', 'search', 'usages', 'editFiles', 'runCommands', 'problems']
handoffs:
  - label: Hand to Hawk for review
    agent: Hawk
    prompt: Review the change just made above. Be thorough.
    send: false
---
```

Then write the body. Give Hammer:

- **A persona** — eager, decisive, tidy. Catchphrase: *"Say less. Building it now."*
- **One job** — turn a clear request into working, build-passing code.
- **An operating procedure** — confirm the target → make the change → run
  `npm run build` to prove it compiles → summarize.
- **Hard rules** — scope discipline (build *only* what was asked, no bonus
  refactors), TS strict, keep the build green, hand off to Hawk when done.
- **An output format** — a short "🦫 Build report".

💡 Don't overthink the prose. A custom agent is just a clear job description. Write
it the way you'd brief a new recruit.

## Step 3 — Put Hammer to work (2 min)

1. Reload VS Code if needed (`Cmd/Ctrl+Shift+P` → *Developer: Reload Window*).
2. Open Copilot Chat → click the **agent dropdown** → pick **Hammer**.
3. Give it a real mission:

```
Hammer, add a small pulsing "LIVE" badge next to the "agents on duty"
text in the deck header.
```

Watch Hammer: it should answer **in persona**, make a focused change to
`src/main.ts` + `src/style.css`, run the build, and offer the **handoff to Hawk**.
Check the app in the browser — the badge should be there.

## ✅ Done when

- [ ] `.github/agents/hammer.agent.md` exists with frontmatter + body
- [ ] **Hammer** appears in the Copilot Chat agent dropdown
- [ ] Hammer completes a task in persona and offers the Hawk handoff

## Stuck? Peek at the answer key

```bash
git show solution:.github/agents/hammer.agent.md
```

---

➡️ **Next:** [LAB 3 — Forge a Skill](LAB-3-skills.md). Hammer is a *who*. Next you
build a *what* — a repeatable job any agent can run.
