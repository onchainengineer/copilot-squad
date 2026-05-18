# 🐾 Copilot Command Centre

> Build an **army of custom GitHub Copilot agents** — each one a soldier that
> wanders your navbar — and watch them work together to build software.

A 40-minute, hands-on workshop on **custom Copilot agents, skills, and
instructions**, all inside VS Code. No cloud agents, no MCP — just the GitHub
Copilot extension and files in `.github/`.

![the army](https://img.shields.io/badge/army-6%20agents-7c5cff) ![vscode](https://img.shields.io/badge/VS%20Code-Copilot-0a84ff)

---

## What you're building

**Command Centre** is a little web app: six soldiers — Scout 🦊, Hammer 🦫, Hawk 🦅,
Patch 🐙, Captain 🐕, Quill 🦉 — wander an animated navbar.

Here's the twist: **each soldier is a real Copilot agent.** Its brain lives in
`.github/agents/<name>.agent.md`. By the end of the workshop you'll have:

- Written the army's **shared instructions** (every agent's common knowledge)
- Built a **custom agent** from scratch — persona, tools, handoffs
- Built a **skill** — a reusable, runnable `/slash` command
- Built the **Captain**, an orchestrator that routes work across the whole army
- Used the army to **recruit a new soldier live** — and watched a new soldier wander
  into the navbar

These are real, production-grade Copilot features. The soldiers just make it fun.

---

## Before the workshop — 5 minutes, do this first

You need:

1. **VS Code** (latest) with the **GitHub Copilot** + **Copilot Chat** extensions,
   signed in with a Copilot-enabled account.
2. **Node.js 18+** and **git**.

Then clone and warm up the app:

```bash
git clone <this-repo-url> copilot-command-centre
cd copilot-command-centre
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). You should see five soldiers
wandering a navbar. ✅ You're ready.

> The sixth soldier, **Quill**, is missing. You'll recruit it in LAB 4.

---

## The VS Code extension

The repo also ships a companion **VS Code extension** in [`extension/`](extension/) —
install it and you have your own Copilot Command Centre inside the editor:

- a `@army` **Copilot Chat participant** that routes any task to the right agent
- an animated **Command Centre** panel where the soldiers react to your edits
- an **army sidebar** and one-click **Set Up / Recruit** scaffolding

```bash
cd extension && npm install && npm run compile   # then press F5 to launch
```

See [`extension/README.md`](extension/README.md) for the full tour.

---

## The VS Code extension

The repo also ships a companion **VS Code extension** in [`extension/`](extension/) —
install it and you have your own Copilot Squad inside the editor:

- a `@squad` **Copilot Chat participant** that routes any task to the right agent
- an animated **Squad HQ** command center where the mascots react to your edits
- a **Squad sidebar** and one-click **Set Up / Recruit** scaffolding

```bash
cd extension && npm install && npm run compile   # then press F5 to launch
```

See [`extension/README.md`](extension/README.md) for the full tour.

---

## The two branches

| Branch | What it is |
|--------|-----------|
| `main` | **Starter.** You build the agents here during the labs. |
| `solution` | **Answer key.** The finished army. Peek if you're stuck: `git show solution:.github/agents/hammer.agent.md` |

---

## The labs — 4 × ~8 min

| # | Lab | You'll learn |
|---|-----|--------------|
| 1 | [Army Charter](labs/LAB-1-instructions.md) | **Custom instructions** — shared agent knowledge |
| 2 | [Recruit Hammer](labs/LAB-2-first-agent.md) | **Custom agents** — persona, tools, handoffs |
| 3 | [Forge a Skill](labs/LAB-3-skills.md) | **Prompt files** — reusable `/slash` commands |
| 4 | [Assemble the Army](labs/LAB-4-the-squad.md) | **Orchestration** — multi-agent handoffs, live |

Facilitators: see [WORKSHOP.md](WORKSHOP.md) for the full run-of-show.

---

## Cheat sheet — Copilot customization

| File | Lives in | What it does |
|------|----------|--------------|
| `copilot-instructions.md` | `.github/` | Loaded into **every** chat. Shared rules. |
| `*.instructions.md` | `.github/instructions/` | Scoped rules — `applyTo` a file glob. |
| `*.agent.md` | `.github/agents/` | A **custom agent** — persona + tools + handoffs. |
| `*.prompt.md` | `.github/prompts/` | A **skill** — a reusable prompt, run as `/name`. |

Rule of thumb: **instructions** shape *how* Copilot behaves, **agents** are *who*
is doing the work, **skills** are *repeatable jobs* you hand to them.
