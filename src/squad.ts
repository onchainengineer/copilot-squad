/**
 * THE SQUAD ROSTER — single source of truth.
 *
 * Every entry here becomes a mascot wandering the navbar AND a card in HQ.
 * Each squad member also has a matching Copilot agent file in
 * `.github/agents/<id>.agent.md`. The pet IS the agent.
 *
 * Want a new teammate? You *could* hand-edit this file... or you could let
 * the squad do it for you. Run the `/recruit-squad-member` skill. (See LAB 3.)
 */

export interface SquadMember {
  /** kebab-case id — must match the .agent.md filename */
  id: string;
  /** display name */
  name: string;
  /** one-line job title */
  role: string;
  /** the animal — drives which mascot SVG is drawn */
  animal: 'fox' | 'beaver' | 'hawk' | 'octopus' | 'owl' | 'corgi';
  /** accent color, hex */
  color: string;
  /** what this agent is brilliant at */
  specialty: string;
  /** said when you hover the mascot */
  catchphrase: string;
  /** random chatter the mascot mutters while wandering */
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
    catchphrase: 'Squad — assemble.',
    quips: ['who has the ball?', 'good call, team', 'routing this one', 'standup in 5'],
  },
  // The squad is missing its sixth member — a Scribe.
  // You'll recruit Quill the owl in LAB 4 using the /recruit-squad-member skill.
];

export const getMember = (id: string): SquadMember | undefined =>
  squad.find((m) => m.id === id);
