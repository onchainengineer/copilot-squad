/**
 * The Activity Bar sidebar — the army, shown natively in VS Code.
 *
 * The "Army" tree is grouped into categories: "Squad" (the built-in agents)
 * and "Custom" (any `.agent.md` you create yourself). Each agent is one clean
 * row with a live status; hover for a rich card (blurb, tools, handoffs,
 * skills). The "Skills" tree lists every prompt-file skill.
 */

import * as vscode from 'vscode';
import { discoverArmy, readSkills, findSkillFiles, type ArmyAgent } from './squadData';

/* ── Army roster tree (categorised) ───────────────────────── */

class AgentItem extends vscode.TreeItem {
  readonly kind = 'agent' as const;
  constructor(
    public readonly agentId: string,
    public readonly builtin: boolean,
    agent: ArmyAgent,
    status: string | undefined,
    skills: string[],
  ) {
    super(`${agent.emoji}  ${agent.name}`, vscode.TreeItemCollapsibleState.None);
    const working = status === 'working';
    this.description = agent.recruited
      ? working
        ? `${agent.role}  ·  working…`
        : agent.role
      : 'not recruited yet';
    this.contextValue = agent.recruited ? 'agent' : 'agentMissing';
    this.iconPath = new vscode.ThemeIcon(
      working ? 'loading~spin' : agent.recruited ? 'pass-filled' : 'circle-large-outline',
    );

    const md = new vscode.MarkdownString();
    md.appendMarkdown(`**${agent.emoji} ${agent.name}** — ${agent.role}\n\n${agent.blurb}\n\n`);
    if (agent.recruited) {
      md.appendMarkdown(`**Tools** · ${agent.tools.length ? agent.tools.join(', ') : '—'}\n\n`);
      md.appendMarkdown(
        `**Handoffs** · ${agent.handoffs.length ? agent.handoffs.join(', ') : '—'}\n\n`,
      );
      md.appendMarkdown(`**Skills** · ${skills.length ? skills.join('  ') : '—'}`);
    } else {
      md.appendMarkdown(`_Not recruited — run **Set Up the Army** to deploy this agent._`);
    }
    this.tooltip = md;

    if (agent.recruited && agent.fileUri) {
      this.command = {
        command: 'vscode.open',
        title: 'Open agent file',
        arguments: [agent.fileUri],
      };
      this.resourceUri = agent.fileUri;
    } else {
      this.command = { command: 'commandCentre.setup', title: 'Set up the army' };
    }
  }
}

class CategoryNode extends vscode.TreeItem {
  readonly kind = 'category' as const;
  constructor(label: string, public readonly items: AgentItem[]) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);
    this.description = String(items.length);
    this.contextValue = 'category';
  }
}

type Node = CategoryNode | AgentItem;

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
    if (element) return element.kind === 'category' ? element.items : [];

    const army = await discoverArmy();
    const skills = await readSkills();
    const toItem = (a: ArmyAgent) =>
      new AgentItem(
        a.id,
        a.builtin,
        a,
        this.statuses.get(a.id),
        skills
          .filter((s) => s.agent.toLowerCase() === a.name.toLowerCase())
          .map((s) => `/${s.name}`),
      );

    const builtin = army.filter((a) => a.builtin).map(toItem);
    const custom = army.filter((a) => !a.builtin).map(toItem);
    const categories: Node[] = [new CategoryNode('Squad', builtin)];
    if (custom.length) categories.push(new CategoryNode('Custom', custom));
    return categories;
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
