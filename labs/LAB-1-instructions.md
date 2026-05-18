# LAB 1 — The Army Charter ⏱️ ~8 min

> **You'll learn:** custom instructions — the shared knowledge every Copilot agent
> in this repo automatically gets.

## Why this matters

By default, Copilot knows nothing about *your* project — your stack, your
conventions, your "we don't do that here." So you re-explain it in every chat.

A **custom instructions** file fixes that. `.github/copilot-instructions.md` is
loaded into **every single Copilot Chat request** in this repo, for everyone. It's
the army's shared brain. Get this right and every agent you build stands on it.

## Step 1 — See the problem (1 min)

Open **Copilot Chat** in VS Code. Ask:

```
What is this project and what are its coding conventions?
```

Right now the answer is vague — Copilot is guessing. Let's fix that.

## Step 2 — Open the charter (1 min)

Open `.github/copilot-instructions.md`. It's a **skeleton** with `TODO` markers.
Notice it's plain Markdown — no frontmatter needed. This one file, this one path.

## Step 3 — Fill it in (4 min)

Replace each `TODO` so the file fully describes Command Centre. It should cover:

- **What the project is** — Command Centre, a Vite + vanilla TypeScript SPA; the
  playground for this workshop.
- **Tech stack** — Vite 5, vanilla TS, plain DOM, one stylesheet, **zero runtime
  dependencies** (and a rule: don't add npm packages).
- **A project map** — what each file in `src/` does.
- **Code conventions** — TS strict, no `any`, 2-space indent, single quotes,
  comments explain *why* not *what*, never break the build.
- **How the army works** — agents live in `.github/agents/`, skills in
  `.github/prompts/`, each agent stays in its lane.

💡 **Pro move:** let Copilot help. Select a `TODO` line and ask Copilot Chat:
*"Fill this in based on the actual files in src/."* Then check what it wrote.

## Step 4 — Prove it works (2 min)

Ask Copilot Chat the **same question** as Step 1:

```
What is this project and what are its coding conventions?
```

The answer should now be specific and correct. Then try:

```
Add a function to src/squad.ts that returns soldiers by animal.
```

Watch it follow your conventions — explicit types, no `any`, `const`, the right
style. That's the charter doing its job. *(You can discard that change.)*

## ✅ Done when

- [ ] `.github/copilot-instructions.md` has no `TODO` left
- [ ] Copilot correctly describes the project and its conventions
- [ ] A code suggestion visibly respects your stated style

## Stuck? Peek at the answer key

```bash
git show solution:.github/copilot-instructions.md
```

---

➡️ **Next:** [LAB 2 — Recruit Hammer](LAB-2-first-agent.md). The charter is the
shared brain; now you'll build a soldier with a brain of its own.
