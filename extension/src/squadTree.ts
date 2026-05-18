/**
 * The Activity Bar sidebar — the army, shown natively in VS Code.
 *
 * The "Army" tree is a clean flat list: one row per agent, with a live status.
 * Hover an agent for a rich card — its blurb, tools, handoffs, and skills.
 * Click opens its `.agent.md`. The "Skills" tree lists every prompt-file skill.
 */

import * as vscode from 'vscode';
import {
  SQUAD,
  type SquadAgent,
  findAgentFiles,
  findSkillFiles,
  readAgentMeta,
  readSkills,
  type AgentMeta,
} from './squadData';

/* ── Army roster tree (flat — detail lives in the tooltip) ── */

class AgentItem extends vscode.TreeItem {
  constructor(
    public readonly agentId: string,
    agent: SquadAgent,
    recruited: boolean,
    status: string | undefined,
    meta: AgentMeta,
    skills: string[],
    fileUri?: vscode.Uri,
  ) {
    super(`${agent.emoji}  ${agent.name}`, vscode.TreeItemCollapsibleState.None);
    const working = status === 'working';
    this.description = recruited
      ? working
        ? `${agent.role}  ·  working…`
        : agent.role
      : 'not recruited yet';
    this.contextValue = recruited ? 'agent' : 'agentMissing';
    this.iconPath = new vscode.ThemeIcon(
      working ? 'loading~spin' : recruited ? 'pass-filled' : 'circle-large-outline',
    );

    const md = new vscode.MarkdownString();
    md.appendMarkdown(`**${agent.emoji} ${agent.name}** — ${agent.role}\n\n${agent.blurb}\n\n`);
    if (recruited) {
      md.appendMarkdown(`**Tools** · ${meta.tools.length ? meta.tools.join(', ') : '—'}\n\n`);
      md.appendMarkdown(`**Handoffs** · ${meta.handoffs.length ? meta.handoffs.join(', ') : '—'}\n\n`);
      md.appendMarkdown(`**Skills** · ${skills.length ? skills.join('  ') : '—'}`);
    } else {
      md.appendMarkdown(`_Not recruited — run **Set Up the Army** to deploy this agent._`);
    }
    this.tooltip = md;

    if (recruited && fileUri) {
      this.command = { command: 'vscode.open', title: 'Open agent file', arguments: [fileUri] };
      this.resourceUri = fileUri;
    } else {
      this.command = { command: 'commandCentre.setup', title: 'Set up the army' };
    }
  }
}

export class SquadTreeProvider implements vscode.TreeDataProvider<AgentItem> {
  private readonly changed = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this.changed.event;
  private readonly statuses = new Map<string, string>();

  refresh(): void {
    this.changed.fire();
  }

  /** Set (or clear, with undefined) an agent's live status, then refresh. */
  setStatus(id: string, status: string | undefined): void {
    if (status) this.statuses.set(id, status);
    else this.statuses.delete(id);
    this.changed.fire();
  }

  getTreeItem(item: AgentItem): vscode.TreeItem {
    return item;
  }

  async getChildren(): Promise<AgentItem[]> {
    const files = await findAgentFiles();
    const byId = new Map(
      files.map((uri) => [uri.path.split('/').pop()!.replace('.agent.md', ''), uri]),
    );
    const skills = await readSkills();
    const items: AgentItem[] = [];
    for (const agent of SQUAD) {
      const uri = byId.get(agent.id);
      const recruited = Boolean(uri);
      const meta = recruited ? await readAgentMeta(agent.id) : { tools: [], handoffs: [] };
      const mySkills = skills
        .filter((s) => s.agent.toLowerCase() === agent.name.toLowerCase())
        .map((s) => `/${s.name}`);
      items.push(
        new AgentItem(agent.id, agent, recruited, this.statuses.get(agent.id), meta, mySkills, uri),
      );
    }
    return items;
  }
}

/* ── Skills tree (every skill, flat) ──────────────────────── */

class SkillItem extends vscode.TreeItem {
  constructor(name: string, fileUri: vscode.Uri) {
    super(`/${name}`, vscode.TreeItemCollapsibleState.None);
    this.description = 'skill';
    this.tooltip = `Run with /${name} in Copilot Chat`;
    this.contextValue = 'skill';
    this.iconPath = new vscode.ThemeIcon('zap');
    this.resourceUri = fileUri;
    this.command = { command: 'vscode.open', title: 'Open skill', arguments: [fileUri] };
  }
}

class EmptyItem extends vscode.TreeItem {
  constructor(text: string) {
    super(text, vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon('info');
  }
}

export class SkillTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private readonly changed = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this.changed.event;

  refresh(): void {
    this.changed.fire();
  }

  getTreeItem(item: vscode.TreeItem): vscode.TreeItem {
    return item;
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    const files = await findSkillFiles();
    if (files.length === 0) return [new EmptyItem('No skills yet — set up the army')];
    return files.map((uri) => {
      const name = uri.path.split('/').pop()!.replace('.prompt.md', '');
      return new SkillItem(name, uri);
    });
  }
}
