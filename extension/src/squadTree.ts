/**
 * The Activity Bar sidebar — the army, shown natively in VS Code.
 *
 * An "Army" tree of agents (each with a live status) and a "Skills" tree of
 * prompt files. Both read the workspace `.github/` folder. No webview — this
 * is the extension's own surface, themed by VS Code.
 */

import * as vscode from 'vscode';
import { SQUAD, findAgentFiles, findSkillFiles } from './squadData';

/* ── Army roster tree ─────────────────────────────────────── */

class AgentItem extends vscode.TreeItem {
  constructor(
    public readonly agentId: string,
    label: string,
    role: string,
    blurb: string,
    recruited: boolean,
    status: string | undefined,
    fileUri?: vscode.Uri,
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    const working = status === 'working';
    this.description = recruited
      ? working
        ? `${role}  ·  working…`
        : role
      : 'not recruited yet';
    this.tooltip = new vscode.MarkdownString(
      `**${label}** — ${role}\n\n${blurb}${working ? '\n\n_On a task…_' : ''}`,
    );
    this.contextValue = 'agent';
    this.iconPath = new vscode.ThemeIcon(
      working ? 'loading~spin' : recruited ? 'pass-filled' : 'circle-large-outline',
    );
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
    return SQUAD.map((agent) => {
      const uri = byId.get(agent.id);
      return new AgentItem(
        agent.id,
        `${agent.emoji}  ${agent.name}`,
        agent.role,
        agent.blurb,
        Boolean(uri),
        this.statuses.get(agent.id),
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
    if (files.length === 0) return [new EmptyItem('No skills yet — set up the army')];
    return files.map((uri) => {
      const name = uri.path.split('/').pop()!.replace('.prompt.md', '');
      return new SkillItem(name, uri);
    });
  }
}
