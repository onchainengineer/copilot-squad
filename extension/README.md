# 🐾 Copilot Command Centre — VS Code Extension

> A command centre for your GitHub Copilot agents — animated soldier companions, a
> routing `@army` chat participant, and one-click agent scaffolding.

Copilot Command Centre turns custom GitHub Copilot agents into an **army you can see
and command**. Six soldiers roam an animated command centre, react to what you
do in the editor, and get put to work straight from VS Code.

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

### 🐾 The Command Centre
An animated webview where the soldiers roam, react to your **live editor activity**
(save a file, watch the right agent light up), and can be put to work with a click.

### 🧭 The Army sidebar
An Activity Bar view listing every agent and skill discovered in `.github/`.
Click an agent to open its brain; click a skill to run it.

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
🐾 **Copilot Command Centre** icon in the Activity Bar, or run **Copilot Command
Centre: Open the Command Centre** from the Command Palette.

To package a shareable `.vsix`:

```bash
npx @vscode/vsce package
```

---

## Commands

| Command | What it does |
|---------|--------------|
| `Copilot Command Centre: Open the Command Centre` | Opens the animated command centre |
| `Copilot Command Centre: Set Up the Army in This Workspace` | Deploys the army into `.github/` |
| `Copilot Command Centre: Recruit a New Agent` | Scaffolds a new `.agent.md` |
| `Copilot Command Centre: Ask the Centre` | Opens Copilot Chat with `@army` |

---

Built for the **Copilot Command Centre** workshop. The soldiers are your agents — go
give them work to do.
