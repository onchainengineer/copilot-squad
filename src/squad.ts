/**
 * THE ARMY ROSTER — single source of truth.
 *
 * Every entry here becomes a soldier wandering the navbar AND a card in HQ.
 * Each soldier also has a matching Copilot agent file in
 * `.github/agents/<id>.agent.md`. The soldier IS the agent.
 *
 * Want a new soldier? You *could* hand-edit this file... or you could let
 * the army do it for you. Run the `/recruit-soldier` skill. (See LAB 3.)
 */

export interface SquadMember {
  /** kebab-case id — must match the .agent.md filename */
  id: string;
  /** display name */
  name: string;
  /** one-line job title */
  role: string;
  /** the animal — drives which soldier SVG is drawn */
  animal: 'fox' | 'beaver' | 'hawk' | 'octopus' | 'owl' | 'corgi';
  /** accent color, hex */
  color: string;
  /** what this agent is brilliant at */
  specialty: string;
  /** said when you hover the soldier */
  catchphrase: string;
  /** random chatter the soldier mutters while wandering */
  quips: string[];
}

export const squad: SquadMember[] = [
  {
    id: 'scout',
    name: 'Scout',
    role: 'Recon Agent',
    animal: 'fox',
    color: '#f59e0b',
    specialty: 'Maps the codebase, hunts down where things live, researches the unknown.',
    catchphrase: "I've already found it.",
    quips: ['sniff sniff...', 'found a TODO over here', 'this function is used in 4 places', 'tracking it down'],
  },
  {
    id: 'hammer',
    name: 'Hammer',
    role: 'Builder Agent',
    animal: 'beaver',
    color: '#3b82f6',
    specialty: 'Turns plans into working code. Ships features, scaffolds modules.',
    catchphrase: 'Say less. Building it now.',
    quips: ['*hammering*', 'shipped it', 'one more feature', 'load-bearing code only'],
  },
  {
    id: 'hawk',
    name: 'Hawk',
    role: 'Reviewer Agent',
    animal: 'hawk',
    color: '#ef4444',
    specialty: 'Eagle-eye code review. Catches bugs, smells, and risky changes before they land.',
    catchphrase: 'I see everything.',
    quips: ['eyes on the diff', 'that nullcheck is missing', 'nice — clean', 'circling back'],
  },
  {
    id: 'patch',
    name: 'Patch',
    role: 'Fixer Agent',
    animal: 'octopus',
    color: '#a855f7',
    specialty: 'Eight arms, zero bugs. Reproduces, diagnoses, and squashes defects.',
    catchphrase: 'Hand me the bug.',
    quips: ['reproduced it', 'got it with arm #4', 'root cause found', 'patching...'],
  },
  {
    id: 'captain',
    name: 'Captain',
    role: 'Orchestrator Agent',
    animal: 'corgi',
    color: '#10b981',
    specialty: 'Reads the mission, picks the right teammate, hands off the work. The glue.',
    catchphrase: 'Army — assemble.',
    quips: ['who has the ball?', 'good call, team', 'routing this one', 'standup in 5'],
  },
  {
    id: 'quill',
    name: 'Quill',
    role: 'Scribe Agent',
    animal: 'owl',
    color: '#14b8a6',
    specialty: 'Writes the docs, the comments, the READMEs. Makes the codebase make sense.',
    catchphrase: 'If it isn’t written down, it didn’t happen.',
    quips: ['drafting...', 'this needs a docstring', 'hoot — clarified', 'words words words'],
  },
];

export const getMember = (id: string): SquadMember | undefined =>
  squad.find((m) => m.id === id);
