---
name: plan-review
description: Pressure-test an engineering plan for feasibility, risk, scope, and timeline before work starts. Use on any design doc or implementation plan.
agent: plan
tools: ['codebase', 'search', 'usages']
---

# Skill — Plan Review

Pressure-test a plan before anyone writes code.

## Procedure

1. **Restate the goal** — in one line: what is this plan trying to achieve, and
   for whom.
2. **Feasibility** — check the plan against the *actual* codebase. Are its
   assumptions true? What dependencies and unknowns are unaddressed?
3. **Risk** — name what could go wrong: hidden complexity, scope creep, migration
   hazards, things that could break adjacent features.
4. **Scope** — is this the smallest plan that solves the problem? Flag anything
   speculative or that could be deferred.
5. **Decompose** — if the plan is large, propose how to split it into safely
   shippable increments.

## Output

> **🐕 Plan review**
>
> **Risk matrix** — each risk: likelihood · impact · mitigation.
> **Open questions** — what must be answered before starting.
> **Verdict** — approve · rework · decompose.
