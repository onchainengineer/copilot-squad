---
name: ship-it
description: Pre-merge ship workflow — validate, review, commit, and verify a change is ready to land. Use when a change is finished and you want to ship it safely.
agent: agent
tools: ['codebase', 'search', 'changes', 'editFiles', 'runCommands', 'problems']
---

# Skill — Ship It

Take the current change from "looks done" to "safely landed". Work every gate in
order; stop and report the moment one fails.

## Procedure

1. **Scope check** — review the diff (`changes`). Confirm it does exactly what was
   intended: no stray edits, no debug code, no secrets, no commented-out blocks.
2. **Build & checks** — run the build, the linter, and the test suite. All green.
   If something fails, fix the root cause — never skip or suppress it.
3. **Self-review** — read the diff as a reviewer would: correctness, error
   handling, edge cases, naming. Fix anything you would flag in someone else.
4. **Commit** — stage the specific files (never `-A` blindly) and write a message
   that explains the *why*, not just the *what*.
5. **Verify** — after landing, confirm the change behaves as expected and that
   nothing adjacent regressed.

## Output

> **🚀 Ship report**
>
> Scope ✓/✗ · Build ✓/✗ · Tests ✓/✗ · Self-review ✓/✗
>
> **Landed:** what shipped. **Watch:** what to keep an eye on. **Follow-ups:** any.

Never land with a failing gate. If you cannot make a gate green, stop and report.
