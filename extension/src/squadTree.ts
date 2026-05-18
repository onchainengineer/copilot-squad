/**
 * The Activity Bar sidebar: a "Squad" tree of agents and a "Skills" tree of
 * prompt files. Both read the workspace `.github/` folder and refresh on demand.
 */

import * as vscode from 'vscode';
import { SQUAD, findAgentFiles, findSkillFiles } from './squadData';

/* ── Squad roster tree ────────────────────────────────────── */

class AgentItem extends vscode.TreeItem {
  constructor(
    public readonly agentId: string,
    label: string,
    role: string,
    blurb: string,
    recruited: boolean,
    fileUri?: vscode.Uri,
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = recruited ? role : 'not recruited yet';
    this.tooltip = new vscode.MarkdownString(`**${label}** — ${role}\n\n${blurb}`);
    this.contextValue = 'agent';
    this.iconPath = new vscode.ThemeIcon(recruited ? 'pass-filled' : 'circle-large-outline');
    if (recruited && fileUri) {
      this.command = {
        command: 'vscode.open',
        title: 'Open agent file',
        arguments: [fileUri],
      };
      this.resourceUri = fileUri;
    } else {
      this.command = { command: 'copilotSquad.setup', title: 'Set up the squad' };
    }
  }
}

export class SquadTreeProvider implements vscode.TreeDataProvider<AgentItem> {
  private readonly changed = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this.changed.event;

  refresh(): void {
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
    return SQUAD.map((agent) => {
      const uri = byId.get(agent.id);
      return new AgentItem(
        agent.id,
        `${agent.emoji}  ${agent.name}`,
        agent.role,
        agent.blurb,
        Boolean(uri),
        uri,
      );
    });
  }
}

/* ── Skills tree ──────────────────────────────────────────── */

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
    if (files.length === 0) return [new EmptyItem('No skills yet — set up the squad')];
    return files.map((uri) => {
      const name = uri.path.split('/').pop()!.replace('.prompt.md', '');
      return new SkillItem(name, uri);
    });
  }
}
