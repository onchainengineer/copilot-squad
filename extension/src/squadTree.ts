/**
 * The Activity Bar sidebar — the army, shown natively in VS Code.
 *
 * The "Army" tree is hierarchical: each agent expands to reveal its tools, its
 * handoffs, and the skills it can run. Each agent carries a live status. The
 * "Skills" tree lists every prompt-file skill. No webview — VS Code's own UI.
 */

import * as vscode from 'vscode';
import {
  SQUAD,
  findAgentFiles,
  findSkillFiles,
  readAgentMeta,
  readSkills,
  type SkillRef,
} from './squadData';

/* ── Army roster tree (hierarchical) ──────────────────────── */

class AgentNode extends vscode.TreeItem {
  readonly kind = 'agent' as const;
  constructor(
    public readonly agentId: string,
    public readonly agentName: string,
    label: string,
    role: string,
    blurb: string,
    public readonly recruited: boolean,
    status: string | undefined,
    fileUri?: vscode.Uri,
  ) {
    super(
      label,
      recruited
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None,
    );
    const working = status === 'working';
    this.description = recruited ? (working ? `${role}  ·  working…` : role) : 'not recruited yet';
    this.tooltip = new vscode.MarkdownString(
      `**${label}** — ${role}\n\n${blurb}${working ? '\n\n_On a task…_' : ''}`,
    );
    this.contextValue = recruited ? 'agent' : 'agentMissing';
    this.iconPath = new vscode.ThemeIcon(
      working ? 'loading~spin' : recruited ? 'pass-filled' : 'circle-large-outline',
    );
    if (recruited && fileUri) {
      this.resourceUri = fileUri;
    } else if (!recruited) {
      this.command = { command: 'commandCentre.setup', title: 'Set up the army' };
    }
  }
}

class InfoNode extends vscode.TreeItem {
  readonly kind = 'info' as const;
  constructor(label: string, value: string, icon: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = value;
    this.iconPath = new vscode.ThemeIcon(icon);
  }
}

class SkillsGroupNode extends vscode.TreeItem {
  readonly kind = 'skills' as const;
  constructor(public readonly skills: SkillRef[]) {
    super(
      'Skills',
      skills.length
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None,
    );
    this.description = skills.length ? String(skills.length) : 'none';
    this.iconPath = new vscode.ThemeIcon('zap');
  }
}

class SkillNode extends vscode.TreeItem {
  readonly kind = 'skillitem' as const;
  constructor(skill: SkillRef) {
    super(`/${skill.name}`, vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon('zap');
    this.tooltip = `Run with /${skill.name} in Copilot Chat`;
    this.command = { command: 'vscode.open', title: 'Open skill', arguments: [skill.uri] };
  }
}

type Node = AgentNode | InfoNode | SkillsGroupNode | SkillNode;

export class SquadTreeProvider implements vscode.TreeDataProvider<Node> {
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

  getTreeItem(node: Node): vscode.TreeItem {
    return node;
  }

  async getChildren(element?: Node): Promise<Node[]> {
    if (!element) return this.agents();
    if (element.kind === 'agent') return this.agentChildren(element);
    if (element.kind === 'skills') return element.skills.map((s) => new SkillNode(s));
    return [];
  }

  private async agents(): Promise<AgentNode[]> {
    const files = await findAgentFiles();
    const byId = new Map(
      files.map((uri) => [uri.path.split('/').pop()!.replace('.agent.md', ''), uri]),
    );
    return SQUAD.map(
      (a) =>
        new AgentNode(
          a.id,
          a.name,
          `${a.emoji}  ${a.name}`,
          a.role,
          a.blurb,
          byId.has(a.id),
          this.statuses.get(a.id),
          byId.get(a.id),
        ),
    );
  }

  private async agentChildren(agent: AgentNode): Promise<Node[]> {
    const meta = await readAgentMeta(agent.agentId);
    const skills = (await readSkills()).filter(
      (s) => s.agent.toLowerCase() === agent.agentName.toLowerCase(),
    );
    return [
      new InfoNode('Tools', meta.tools.length ? meta.tools.join(' · ') : 'none', 'tools'),
      new InfoNode(
        'Handoffs',
        meta.handoffs.length ? `→ ${meta.handoffs.join(', ')}` : 'none',
        'arrow-right',
      ),
      new SkillsGroupNode(skills),
    ];
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
