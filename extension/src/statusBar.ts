/**
 * The status-bar soldier — a small live presence for the command centre.
 * Idle: cycles through the agents. On activity: flashes the working agent.
 */

import * as vscode from 'vscode';
import { SQUAD, getAgent } from './squadData';

export class SquadStatusBar {
  private readonly item: vscode.StatusBarItem;
  private cycle = 0;
  private idleTimer: ReturnType<typeof setInterval>;
  private flashTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(context: vscode.ExtensionContext) {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.item.command = 'workbench.view.extension.commandCentre';
    this.item.tooltip = 'Copilot Command Centre — open the Army sidebar';
    this.renderIdle();
    this.item.show();
    this.idleTimer = setInterval(() => this.renderIdle(), 4000);
    context.subscriptions.push(this.item, {
      dispose: () => {
        clearInterval(this.idleTimer);
        if (this.flashTimer) clearTimeout(this.flashTimer);
      },
    });
  }

  private renderIdle(): void {
    const agent = SQUAD[this.cycle++ % SQUAD.length];
    this.item.text = `${agent.emoji} Army`;
  }

  /** Briefly show a specific agent as working. */
  flash(agentId: string): void {
    const agent = getAgent(agentId);
    if (!agent) return;
    this.item.text = `${agent.emoji} ${agent.name} working…`;
    if (this.flashTimer) clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => this.renderIdle(), 4200);
  }
}
