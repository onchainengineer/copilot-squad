# 🐾 Copilot Command Centre — VS Code Extension

> A command centre for your GitHub Copilot agents — a native Army sidebar, a
> routing `@army` chat participant, and one-click agent scaffolding.

Copilot Command Centre turns custom GitHub Copilot agents into an **army you can see
and command** — entirely in VS Code's own surfaces. No webview: the army lives in
the Activity Bar sidebar, the status bar, and Copilot Chat.

This is the companion extension for the **Copilot Command Centre workshop** —
install it and you walk in with a working army already at your side.

---

## What it gives you

### 🟦 The `@army` chat participant
Type `@army <task>` in Copilot Chat. The **Captain** reads the mission, routes it
to the right specialist, and answers in that agent's voice — using the persona
from `.github/agents/`.

```
@army fix the navbar crash    →  🐕 Captain routes to Patch 🐙
@army /roster                 →  the full army
@army /recruit                →  scaffold a new agent
```

### 🧭 The Army sidebar
A native Activity Bar view listing every agent and skill discovered in `.github/`.
Each agent shows a **live status** — it flips to *working…* (with a spinner) when
you save a file in that agent's domain. Click an agent to open its brain; click a
skill to run it.

### 🚀 One-click scaffolding
- **Set Up the Army** — deploys six ready-made agents, skills, and a shared
  charter into your workspace `.github/` folder.
- **Recruit a New Agent** — interactively scaffolds a brand-new `.agent.md`,
  tuned to your project.

### 🦊 A status-bar soldier
A small live presence that cycles the army and flashes the agent at work.

---

## The army

| Agent | Role | Specialty |
|-------|------|-----------|
| 🦊 Scout | Recon | Finds where things live, researches the unknown |
| 🦫 Hammer | Builder | Ships features, scaffolds modules |
| 🦅 Hawk | Reviewer | Catches bugs, smells, risky changes |
| 🐙 Patch | Fixer | Reproduces and squashes defects |
| 🐕 Captain | Orchestrator | Routes the mission to the right teammate |
| 🦉 Quill | Scribe | Writes docs, comments, READMEs |

---

## Requirements

- VS Code **1.96+**
- The **GitHub Copilot** + **Copilot Chat** extensions, signed in

The `@army` participant uses the VS Code Language Model API with your Copilot
subscription. No other services, no MCP, no cloud agents.

---

## Run it from source

```bash
cd extension
npm install
npm run compile
```

Then press **F5** in VS Code to launch the Extension Development Host. Open the
🐾 **Copilot Command Centre** icon in the Activity Bar to see the Army sidebar.

To package a shareable `.vsix`:

```bash
npx @vscode/vsce package
```

---

## Commands

| Command | What it does |
|---------|--------------|
| `Copilot Command Centre: Set Up the Army in This Workspace` | Deploys the army into `.github/` |
| `Copilot Command Centre: Recruit a New Agent` | Scaffolds a new `.agent.md` |
| `Copilot Command Centre: Ask the Centre` | Opens Copilot Chat with `@army` |

---

Built for the **Copilot Command Centre** workshop. The soldiers are your agents — go
give them work to do.
