---
name: squad-standup
description: The Captain runs a daily-standup style report on the state of the repo
agent: Captain
tools: ['codebase', 'search', 'changes']
---

# Skill — Squad Standup

Run a fun, fast "standup" for the squad. The Captain chairs it.

1. Use `changes` to see what's been touched recently, and skim the repo state.
2. For **each** squad member in `.github/agents/`, write a one-line standup update
   *in that member's voice*, covering work in their lane:
   - **Scout** 🦊 — anything worth exploring or unclear in the codebase?
   - **Hammer** 🦫 — what's built / what's ready to build?
   - **Hawk** 🦅 — any review concerns in the current changes?
   - **Patch** 🐙 — any bugs, failing builds, or risky spots?
   - **Quill** 🦉 — anything missing docs?
3. Close with the Captain's call: the single most important next mission and who
   owns it.

Keep it punchy — this is a standup, not a status report. Format as:

> **🐕 Squad Standup — <date>**
>
> 🦊 **Scout:** …
> 🦫 **Hammer:** …
> 🦅 **Hawk:** …
> 🐙 **Patch:** …
> 🦉 **Quill:** …
>
> **🐕 Captain's call:** <the next mission> → <owner>
