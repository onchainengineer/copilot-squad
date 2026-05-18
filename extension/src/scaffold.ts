/**
 * Scaffold commands — give a workspace its own Copilot Command Centre.
 *
 *  setupSquad   → copies the full army (agents, skills, instructions) into `.github/`
 *  recruitAgent → interactively scaffolds one new `.github/agents/<id>.agent.md`
 */

import * as vscode from 'vscode';
import { workspaceRoot } from './squadData';

const ANIMALS: Record<string, string> = {
  fox: '🦊',
  beaver: '🦫',
  hawk: '🦅',
  octopus: '🐙',
  owl: '🦉',
  corgi: '🐕',
  cat: '🐈',
  wolf: '🐺',
};

async function exists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}

async function copyDir(from: vscode.Uri, to: vscode.Uri): Promise<number> {
  let count = 0;
  let entries: [string, vscode.FileType][] = [];
  try {
    entries = await vscode.workspace.fs.readDirectory(from);
  } catch {
    return 0;
  }
  await vscode.workspace.fs.createDirectory(to);
  for (const [name, type] of entries) {
    if (type !== vscode.FileType.File) continue;
    const bytes = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(from, name));
    await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(to, name), bytes);
    count++;
  }
  return count;
}

/** Copy the full army template set into the workspace `.github/` folder. */
export async function setupSquad(extensionUri: vscode.Uri): Promise<number> {
  const root = workspaceRoot();
  if (!root) {
    vscode.window.showErrorMessage('Open a folder first — the army needs a workspace to deploy into.');
    return -1;
  }

  const agentsDir = vscode.Uri.joinPath(root, '.github', 'agents');
  if (await exists(agentsDir)) {
    const choice = await vscode.window.showWarningMessage(
      'This workspace already has an army in `.github/agents`. Redeploy and overwrite?',
      { modal: true },
      'Redeploy',
    );
    if (choice !== 'Redeploy') return -1;
  }

  const templates = vscode.Uri.joinPath(extensionUri, 'templates');
  let total = 0;

  const instructions = vscode.Uri.joinPath(templates, 'copilot-instructions.md');
  if (await exists(instructions)) {
    const bytes = await vscode.workspace.fs.readFile(instructions);
    const dest = vscode.Uri.joinPath(root, '.github', 'copilot-instructions.md');
    await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(root, '.github'));
    await vscode.workspace.fs.writeFile(dest, bytes);
    total++;
  }

  total += await copyDir(
    vscode.Uri.joinPath(templates, 'agents'),
    vscode.Uri.joinPath(root, '.github', 'agents'),
  );
  total += await copyDir(
    vscode.Uri.joinPath(templates, 'prompts'),
    vscode.Uri.joinPath(root, '.github', 'prompts'),
  );

  return total;
}

function slug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function agentTemplate(o: {
  name: string;
  emoji: string;
  role: string;
  specialty: string;
}): string {
  return `---
name: ${o.name}
description: ${o.role} — ${o.specialty}
tools: ['codebase', 'search', 'usages', 'editFiles']
---

# ${o.name} ${o.emoji} — ${o.role}

You are **${o.name}**, a soldier in the Copilot Command Centre army. ${o.specialty}

## Your one job

Stay strictly in your lane. Do your one job well, and when a request belongs to a
teammate, say so and name them.

## Operating procedure

1. Restate the task in one line so the user knows what you understood.
2. Do the work — be concise, precise, and practical.
3. Summarize what you did and what you deliberately left untouched.

## Rules

- Follow the conventions in \`.github/copilot-instructions.md\`.
- Scope discipline: do exactly what was asked — no speculative extras.
- Never break the build.

## Output format

Open with a one-line **${o.emoji} status**, then deliver the work.
`;
}

/** Interactively scaffold one new agent. Returns the new agent's id + emoji. */
export async function recruitAgent(): Promise<
  { id: string; name: string; emoji: string } | undefined
> {
  const root = workspaceRoot();
  if (!root) {
    vscode.window.showErrorMessage('Open a folder first — recruits need a workspace.');
    return undefined;
  }

  const name = await vscode.window.showInputBox({
    title: 'Recruit a New Agent (1/4)',
    prompt: 'Agent name',
    placeHolder: 'e.g. Sentry',
    validateInput: (v) => (v.trim() ? undefined : 'A recruit needs a name.'),
  });
  if (!name) return undefined;

  const animal = await vscode.window.showQuickPick(
    Object.keys(ANIMALS).map((a) => ({ label: `${ANIMALS[a]}  ${a}`, animal: a })),
    { title: 'Recruit a New Agent (2/4)', placeHolder: 'Pick an animal' },
  );
  if (!animal) return undefined;

  const role = await vscode.window.showInputBox({
    title: 'Recruit a New Agent (3/4)',
    prompt: 'One-line role / job title',
    placeHolder: 'e.g. Security Agent',
    validateInput: (v) => (v.trim() ? undefined : 'Give the recruit a role.'),
  });
  if (!role) return undefined;

  const specialty = await vscode.window.showInputBox({
    title: 'Recruit a New Agent (4/4)',
    prompt: 'What is this agent brilliant at? (one sentence)',
    placeHolder: 'e.g. Audits code for security vulnerabilities and unsafe patterns.',
    validateInput: (v) => (v.trim() ? undefined : 'Describe the specialty.'),
  });
  if (!specialty) return undefined;

  const emoji = ANIMALS[animal.animal];
  const id = slug(name);
  const content = agentTemplate({ name: name.trim(), emoji, role: role.trim(), specialty: specialty.trim() });
  const file = vscode.Uri.joinPath(root, '.github', 'agents', `${id}.agent.md`);

  if (await exists(file)) {
    const choice = await vscode.window.showWarningMessage(
      `An agent file for "${id}" already exists. Overwrite?`,
      { modal: true },
      'Overwrite',
    );
    if (choice !== 'Overwrite') return undefined;
  }

  await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(root, '.github', 'agents'));
  await vscode.workspace.fs.writeFile(file, Buffer.from(content, 'utf8'));
  await vscode.window.showTextDocument(file);

  return { id, name: name.trim(), emoji };
}
