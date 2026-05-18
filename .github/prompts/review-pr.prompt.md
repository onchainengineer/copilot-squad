---
name: review-pr
description: Run Hawk's full structured review on the current pending changes
agent: Hawk
tools: ['codebase', 'search', 'usages', 'changes', 'problems']
---

# Skill — Review the pending changes

Run a complete code review of the **uncommitted changes** in this repo.

Steps:

1. Use `changes` to gather every modified, added, and deleted file.
2. For each change, inspect it against the criteria in your Hawk review checklist:
   correctness, type safety, scope creep, convention violations, runtime risk.
3. Cross-check conventions against `.github/copilot-instructions.md`.
4. Check `problems` for any compiler or linter errors introduced.

Then produce your standard **🦅 Review** report, grouped by severity
(🔴 Blocking / 🟡 Should fix / 🟢 Nits / ✅ Good) with a final verdict.

If there are 🔴 Blocking findings, offer the handoff to **Patch** to fix them.

${input:focus:Optional — narrow the review to a specific file or concern}
