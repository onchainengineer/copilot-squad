---
name: recruit-soldier
description: Scaffold a brand-new soldier end-to-end — roster entry, mascot art, and agent file
argument-hint: name=Quill animal=owl role="Scribe Agent"
agent: agent
tools: ['codebase', 'search', 'editFiles', 'runCommands', 'problems']
---

# Skill — Recruit a new soldier

You are recruiting a new teammate into the Copilot Command Centre. This is a **multi-file
scaffold** — when you finish, a new mascot should wander the navbar AND a new
Copilot agent should exist. Do all of it, or none of it.

## Inputs

- **Name:** ${input:name:Display name, e.g. Quill}
- **Animal:** ${input:animal:fox | beaver | hawk | octopus | owl | corgi — or a new one}
- **Role:** ${input:role:One-line job title, e.g. Scribe Agent}
- **Accent color:** ${input:color:Hex color, e.g. #14b8a6}
- **Specialty:** ${input:specialty:One sentence on what this agent is brilliant at}

Derive the **id** as the lowercase kebab-case of the name (e.g. `Quill` → `quill`).

## Steps — do them in order

### 1. Roster entry — `src/squad.ts`

Add a new `SquadMember` object to the `squad` array. Fill every field:
`id`, `name`, `role`, `animal`, `color`, `specialty`, plus a `catchphrase` and a
4-item `quips` array written in the new member's voice. Match the style of the
existing entries exactly.

### 2. Mascot art — `src/mascots.ts`

- If the animal already has a builder function, you're done with this step.
- If the animal is **new**: add it to the `animal` union type in `src/squad.ts`,
  write a new builder function in `src/mascots.ts` in the same cohesive "blob pet"
  style as the others (reuse the shared `eyes()` helper), and register it in the
  `BUILDERS` map.

### 3. Agent file — `.github/agents/<id>.agent.md`

Create the Copilot agent for this member. Model it on the existing agents
(`scout.agent.md`, `hammer.agent.md`, …): YAML frontmatter with `name`,
`description`, a sensible `tools` list for the role, and at least one `handoff`.
The body must give the agent a clear single job, an operating procedure, an output
format, and rules — written in the member's personality.

### 4. Verify

Run `npm run build`. It must pass with no errors in `problems`. If it fails, fix
it before reporting done.

## Report

End with a short recruitment report: the new member's name, the three files you
created or edited, and the build status. Remind the user to reload Command Centre to see
the new mascot, and to pick the new agent from the Copilot Chat agent dropdown.
