---
name: design-audit
description: Audit the visual design of a UI — hierarchy, spacing, typography, colour, alignment, states — and fix what's off. Use after building or changing any interface.
agent: agent
tools: ['codebase', 'search', 'editFiles', 'runCommands']
---

# Skill — Design Audit

Review a UI the way a design-conscious engineer would, then fix what's off.

## Procedure

1. **Look** — run the UI. Examine it screen by screen, and at narrow widths.
2. **Audit by category:**
   - **Hierarchy** — is the most important thing the most prominent?
   - **Spacing** — consistent rhythm; no cramped or random gaps.
   - **Typography** — a sane type scale; consistent weights.
   - **Colour** — purposeful, sufficient contrast, consistent accents.
   - **Alignment** — everything on a grid; nothing one pixel off.
   - **States** — hover, focus, empty, loading, and error all handled.
3. **Fix** — group findings by category and fix them, highest-impact first.
4. **Re-check** — confirm each fix in the running UI.

## Output

> **🎨 Design audit**
>
> Findings by category · fixed vs. noted · before/after on the key changes.
