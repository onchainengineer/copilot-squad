---
name: qa-sweep
description: Systematically exercise a feature, catalogue every bug by severity, then fix or report. Use after building a feature, before shipping.
argument-hint: optional — the feature or area to focus the sweep on
agent: agent
tools: ['codebase', 'search', 'editFiles', 'runCommands', 'problems']
---

# Skill — QA Sweep

Hunt for defects the way a careful tester would, then fix them.

## Procedure

1. **Map the surface** — list what to test: the golden path, the edge cases, error
   states, empty states, and anything adjacent the change could have broken.
   ${input:area:Optional — narrow the sweep to a feature or area}
2. **Exercise it** — walk every path. For a UI, run it and interact. For logic,
   run it with real inputs *and* hostile ones.
3. **Catalogue** — record each defect with: what you did, what happened, what
   *should* happen, and a severity — 🔴 critical · 🟠 high · 🟡 medium · ⚪ cosmetic.
4. **Fix or file** — fix 🔴 and 🟠 defects at the root cause with focused commits.
   Report 🟡 and ⚪ clearly so they can be triaged.
5. **Re-test** — confirm each fix, and that the fix broke nothing else.

## Output

> **🔎 QA sweep — <area>**
>
> Defects grouped by severity · fixed vs. filed · final verdict: **ship / hold**.
