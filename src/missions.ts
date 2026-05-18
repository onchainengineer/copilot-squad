/**
 * THE MISSION ENGINE — the heart of Squad HQ.
 *
 * You hand it a task in plain English. It plans a route across the squad,
 * then runs that route as a live relay: each agent works in turn, streams a
 * report, and hands off to the next. The Deck and the dashboard both subscribe
 * to its events and animate in response.
 *
 * This is a *simulation* of how the real Copilot agents in `.github/agents/`
 * collaborate — recon → build → review, with explicit handoffs.
 */

import { getMember } from './squad';

export interface MissionStep {
  agentId: string;
  /** short verb shown in the stepper, e.g. "Recon" */
  action: string;
  /** report lines, streamed one at a time */
  report: string[];
}

export type MissionEvent =
  | { type: 'plan'; mission: string; steps: MissionStep[] }
  | { type: 'step-start'; index: number; step: MissionStep }
  | { type: 'handoff'; from: string; to: string }
  | { type: 'log'; agentId: string; text: string; final: boolean }
  | { type: 'step-done'; index: number; step: MissionStep }
  | { type: 'complete'; mission: string; steps: MissionStep[] };

type Listener = (e: MissionEvent) => void;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clip = (s: string) => (s.length > 52 ? s.slice(0, 50) + '…' : s);

/** Picks an ordered chain of agents for a mission — the Captain's brain. */
function plan(text: string): Array<{ agentId: string; action: string }> {
  const q = text.toLowerCase();
  const has = (...w: string[]) => w.some((x) => q.includes(x));

  let chain: Array<{ agentId: string; action: string }>;
  if (has('bug', 'fix', 'crash', 'error', 'broken', 'fail', 'wrong')) {
    chain = [s('patch', 'Diagnose & Fix'), s('hawk', 'Verify')];
  } else if (has('doc', 'readme', 'comment', 'explain', 'document')) {
    chain = [s('scout', 'Recon'), s('quill', 'Document')];
  } else if (has('build', 'add', 'create', 'feature', 'implement', 'ship', 'new ')) {
    chain = [s('scout', 'Recon'), s('hammer', 'Build'), s('hawk', 'Review')];
  } else if (has('review', 'audit', 'check', 'quality')) {
    chain = [s('hawk', 'Review')];
  } else if (has('find', 'where', 'locate', 'search', 'understand', 'how ')) {
    chain = [s('scout', 'Recon')];
  } else {
    chain = [s('captain', 'Triage'), s('scout', 'Recon'), s('hammer', 'Build')];
  }

  // Keep only agents that actually exist (e.g. Quill is recruited in LAB 4).
  const filtered = chain.filter((step) => getMember(step.agentId));
  return filtered.length ? filtered : [s('captain', 'Triage')];
}

const s = (agentId: string, action: string) => ({ agentId, action });

/** Themed, mission-aware report lines for each agent. */
function reportFor(agentId: string, mission: string): string[] {
  const m = clip(mission.trim() || 'untitled mission');
  const lines: Record<string, string[]> = {
    captain: [`Mission received — “${m}”.`, `Classified. Routing to the squad…`],
    scout: [
      `Parsing the objective — “${m}”.`,
      `Grepped the codebase · traced symbol usages across src/.`,
      `Located the relevant area. Recon complete — handing off.`,
    ],
    hammer: [
      `Target confirmed. Drafting the implementation…`,
      `Writing code — strict types, repo conventions, zero new deps.`,
      `npm run build → ✓ green.`,
      `Shipped. Passing the diff to Hawk for review.`,
    ],
    hawk: [
      `Inspecting the change set…`,
      `Correctness ✓ · Types ✓ · Scope ✓ · Conventions ✓`,
      `Verdict: approved — 1 nit, 0 blockers.`,
    ],
    patch: [
      `Reproduced the issue locally ✓`,
      `Root cause traced to src/ — applying the minimal fix.`,
      `Re-ran the build — green. Bug squashed.`,
    ],
    quill: [
      `Reading the code to document it accurately…`,
      `Drafted docstrings and a README section.`,
      `Docs written — verified against the source.`,
    ],
  };
  return lines[agentId] ?? [`On it — “${m}”.`, `Done.`];
}

export class MissionEngine {
  private listeners: Listener[] = [];
  private busy = false;
  /** running totals, for the HUD */
  stats = { missions: 0, steps: 0, handoffs: 0 };

  get running(): boolean {
    return this.busy;
  }

  subscribe(fn: Listener): void {
    this.listeners.push(fn);
  }

  private emit(e: MissionEvent): void {
    for (const fn of this.listeners) fn(e);
  }

  /** Plan + run a mission. Resolves when the relay is complete. */
  async run(text: string): Promise<void> {
    if (this.busy) return;
    const mission = text.trim();
    if (!mission) return;
    this.busy = true;

    const steps: MissionStep[] = plan(mission).map((p) => ({
      ...p,
      report: reportFor(p.agentId, mission),
    }));

    this.emit({ type: 'plan', mission, steps });
    await wait(650);

    for (let i = 0; i < steps.length; i++) {
      if (i > 0) {
        this.stats.handoffs++;
        this.emit({ type: 'handoff', from: steps[i - 1].agentId, to: steps[i].agentId });
        await wait(950);
      }
      this.emit({ type: 'step-start', index: i, step: steps[i] });
      await wait(520);

      const report = steps[i].report;
      for (let l = 0; l < report.length; l++) {
        this.emit({
          type: 'log',
          agentId: steps[i].agentId,
          text: report[l],
          final: l === report.length - 1,
        });
        await wait(680);
      }
      this.stats.steps++;
      this.emit({ type: 'step-done', index: i, step: steps[i] });
      await wait(420);
    }

    this.stats.missions++;
    this.emit({ type: 'complete', mission, steps });
    this.busy = false;
  }
}

/** Example missions shown as one-click chips. */
export const SAMPLE_MISSIONS: Array<{ icon: string; text: string }> = [
  { icon: '🔨', text: 'Build a dark-mode toggle for the dashboard' },
  { icon: '🐛', text: 'Fix the crash when the navbar loads' },
  { icon: '🔎', text: 'Find where missions get routed to agents' },
  { icon: '📝', text: 'Document how the mascot system works' },
];
