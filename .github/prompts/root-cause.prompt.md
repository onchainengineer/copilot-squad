---
name: root-cause
description: Diagnose a bug down to its true root cause and fix it — reproduce, isolate, diagnose, fix, verify. Use for any crash, wrong result, or failing build.
agent: Patch
tools: ['codebase', 'search', 'usages', 'editFiles', 'runCommands', 'problems', 'runTests']
---

# Skill — Root Cause

Find the *real* cause of a defect — not the symptom — and fix it there.

## Procedure

1. **Reproduce** — state the exact symptom and the steps that trigger it. If you
   cannot reproduce it, say so before going further.
2. **Isolate** — narrow the failure by elimination: bisect the change history,
   the inputs, the code path. Find the smallest case that still fails.
3. **Diagnose** — identify the root cause and cite it (`file:line`). Explain in one
   or two sentences *why* it breaks. Separate cause from symptom.
4. **Fix** — make the smallest change that addresses the root cause. Never silence
   the error or weaken a check just to make red go green.
5. **Verify** — re-run the build and tests. Confirm the symptom is gone and nothing
   adjacent regressed. Add a regression test if one is missing.

## Output

> **🐙 Root-cause report**
>
> **Symptom** · **Root cause** (`file:line` + why) · **Fix** · **Verified** (build/test evidence).
