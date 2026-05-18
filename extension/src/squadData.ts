/**
 * The army roster + routing brain, shared across the extension.
 *
 * The roster is embedded so the soldiers, status bar, and routing work even
 * before a workspace has any `.github/agents` files. When those files DO
 * exist, the extension reads the real persona from disk.
 */

import * as vscode from 'vscode';

export interface SquadAgent {
  id: string;
  name: string;
  role: string;
  /** soldier emoji */
  emoji: string;
  animal: string;
  /** accent color, hex */
  color: string;
  blurb: string;
  /** routing keywords */
  keywords: string[];
}

export const SQUAD: SquadAgent[] = [
  {
    id: 'scout',
    name: 'Scout',
    role: 'Recon Agent',
    emoji: '🦊',
    animal: 'fox',
    color: '#f59e0b',
    blurb: 'Maps the codebase, finds where things live, researches the unknown.',
    keywords: ['find', 'where', 'locate', 'search', 'explore', 'research', 'understand', 'how does', 'map'],
  },
  {
    id: 'hammer',
    name: 'Hammer',
    role: 'Builder Agent',
    emoji: '🦫',
    animal: 'beaver',
    color: '#3b82f6',
    blurb: 'Turns plans into working code. Ships features, scaffolds modules.',
    keywords: ['build', 'add', 'create', 'implement', 'feature', 'scaffold', 'make', 'ship', 'new'],
  },
  {
    id: 'hawk',
    name: 'Hawk',
    role: 'Reviewer Agent',
    emoji: '🦅',
    animal: 'hawk',
    color: '#ef4444',
    blurb: 'Eagle-eye code review. Catches bugs, smells, and risky changes.',
    keywords: ['review', 'audit', 'check', 'quality', 'smell', 'risky', 'inspect', 'pr', 'diff'],
  },
  {
    id: 'patch',
    name: 'Patch',
    role: 'Fixer Agent',
    emoji: '🐙',
    animal: 'octopus',
    color: '#a855f7',
    blurb: 'Eight arms, zero bugs. Reproduces, diagnoses, and squashes defects.',
    keywords: ['bug', 'fix', 'broken', 'error', 'crash', 'fail', 'debug', 'repro', 'issue', 'wrong'],
  },
  {
    id: 'captain',
    name: 'Captain',
    role: 'Orchestrator Agent',
    emoji: '🐕',
    animal: 'corgi',
    color: '#10b981',
    blurb: 'Reads the mission, picks the right teammate, and routes the work.',
    keywords: ['plan', 'orchestrate', 'route', 'who', 'organize', 'coordinate'],
  },
  {
    id: 'quill',
    name: 'Quill',
    role: 'Scribe Agent',
    emoji: '🦉',
    animal: 'owl',
    color: '#14b8a6',
    blurb: 'Writes the docs, comments, and READMEs. Makes the codebase make sense.',
    keywords: ['doc', 'document', 'readme', 'comment', 'explain', 'guide', 'changelog'],
  },
];

export const getAgent = (id: string): SquadAgent | undefined =>
  SQUAD.find((a) => a.id === id);

export interface Routing {
  agent: SquadAgent;
  reason: string;
}

/** The Captain's brain — picks the agent whose lane a request falls in. */
export function routeAgent(text: string): Routing {
  const q = text.toLowerCase();
  let best: SquadAgent | undefined;
  let bestScore = 0;
  for (const agent of SQUAD) {
    if (agent.id === 'captain') continue;
    const score = agent.keywords.reduce((n, w) => (q.includes(w) ? n + 1 : n), 0);
    if (score > bestScore) {
      bestScore = score;
      best = agent;
    }
  }
  if (!best) {
    return {
      agent: getAgent('captain')!,
      reason: "No clear specialty match — I'll take point, break it down, and route the pieces.",
    };
  }
  return { agent: best, reason: `This is ${best.name}'s lane: ${best.blurb.toLowerCase()}` };
}

/* ── Workspace integration ────────────────────────────────── */

export function workspaceRoot(): vscode.Uri | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri;
}

async function listMarkdown(relDir: string, suffix: string): Promise<vscode.Uri[]> {
  const root = workspaceRoot();
  if (!root) return [];
  const dir = vscode.Uri.joinPath(root, relDir);
  try {
    const entries = await vscode.workspace.fs.readDirectory(dir);
    return entries
      .filter(([name, type]) => type === vscode.FileType.File && name.endsWith(suffix))
      .map(([name]) => vscode.Uri.joinPath(dir, name))
      .sort((a, b) => a.path.localeCompare(b.path));
  } catch {
    return [];
  }
}

/** All `.github/agents/*.agent.md` files in the workspace. */
export const findAgentFiles = (): Promise<vscode.Uri[]> =>
  listMarkdown('.github/agents', '.agent.md');

/** All `.github/prompts/*.prompt.md` skill files in the workspace. */
export const findSkillFiles = (): Promise<vscode.Uri[]> =>
  listMarkdown('.github/prompts', '.prompt.md');

/** Strip YAML frontmatter from a markdown string. */
function stripFrontmatter(md: string): string {
  if (md.startsWith('---')) {
    const end = md.indexOf('\n---', 3);
    if (end !== -1) return md.slice(md.indexOf('\n', end + 1) + 1).trim();
  }
  return md.trim();
}

/**
 * The persona an agent should answer with — the body of its `.agent.md`
 * file if it exists, otherwise a sensible default built from the roster.
 */
export async function readAgentPersona(id: string): Promise<string> {
  const root = workspaceRoot();
  const agent = getAgent(id);
  if (root) {
    const file = vscode.Uri.joinPath(root, '.github/agents', `${id}.agent.md`);
    try {
      const bytes = await vscode.workspace.fs.readFile(file);
      const body = stripFrontmatter(Buffer.from(bytes).toString('utf8'));
      if (body) return body;
    } catch {
      /* fall through to default */
    }
  }
  if (!agent) return `You are a focused, helpful coding agent.`;
  return [
    `You are **${agent.name}** ${agent.emoji}, the army's ${agent.role}.`,
    ``,
    `Your specialty: ${agent.blurb}`,
    ``,
    `Stay strictly in your lane. Be concise, precise, and practical. When the`,
    `request belongs to a different specialist, say so and name the teammate.`,
  ].join('\n');
}
