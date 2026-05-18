# 🐾 Copilot Squad — VS Code Extension

> Your own squad of GitHub Copilot agents — animated mascot companions, a routing
> `@squad` chat participant, and one-click agent scaffolding.

Copilot Squad turns custom GitHub Copilot agents into a **team you can see and
command**. Six mascot agents roam an animated command center, react to what you do
in the editor, and get put to work straight from VS Code.

This is the companion extension for the **Copilot Squad workshop** — install it
and you walk in with a working squad already at your side.

---

## What it gives you

### 🟦 The `@squad` chat participant
Type `@squad <task>` in Copilot Chat. The **Captain** reads the mission, routes it
to the right specialist, and answers in that agent's voice — using the persona
from `.github/agents/`.

```
@squad fix the navbar crash      →  🐕 Captain routes to Patch 🐙
@squad /roster                   →  the full squad
@squad /recruit                  →  scaffold a new agent
```

### 🐾 Squad HQ — the command center
An animated webview where the mascots roam, react to your **live editor activity**
(save a file, watch the right agent light up), and can be put to work with a click.

### 🧭 The Squad sidebar
An Activity Bar view listing every agent and skill discovered in `.github/`.
Click an agent to open its brain; click a skill to run it.

### 🚀 One-click scaffolding
- **Set Up the Squad** — deploys six ready-made agents, skills, and a shared
  charter into your workspace `.github/` folder.
- **Recruit a New Agent** — interactively scaffolds a brand-new `.agent.md`,
  tuned to your project.

### 🦊 A status-bar mascot
A small live presence that cycles the squad and flashes the agent at work.

---

## The squad

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

The `@squad` participant uses the VS Code Language Model API with your Copilot
subscription. No other services, no MCP, no cloud agents.

---

## Run it from source

```bash
cd extension
npm install
npm run compile
```

Then press **F5** in VS Code to launch the Extension Development Host. Open the
🐾 **Copilot Squad** icon in the Activity Bar, or run **Copilot Squad: Open Squad
HQ** from the Command Palette.

To package a shareable `.vsix`:

```bash
npx @vscode/vsce package
```

---

## Commands

| Command | What it does |
|---------|--------------|
| `Copilot Squad: Open Squad HQ` | Opens the animated command center |
| `Copilot Squad: Set Up the Squad` | Deploys the squad into `.github/` |
| `Copilot Squad: Recruit a New Agent` | Scaffolds a new `.agent.md` |
| `Copilot Squad: Ask the Squad` | Opens Copilot Chat with `@squad` |

---

Built for the **Copilot Squad** workshop. The pets are your agents — go give them
work to do.
