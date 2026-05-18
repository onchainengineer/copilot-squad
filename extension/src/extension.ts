/**
 * Copilot Squad — extension entry point.
 *
 * Wires up the sidebar, the @squad chat participant, the HQ webview, the
 * status-bar mascot, the scaffold commands, and the live editor-event hooks.
 */

import * as vscode from 'vscode';
import { SquadTreeProvider, SkillTreeProvider } from './squadTree';
import { registerChatParticipant } from './chatParticipant';
import { SquadHQPanel } from './hqPanel';
import { SquadStatusBar } from './statusBar';
import { setupSquad, recruitAgent } from './scaffold';
import { workspaceRoot } from './squadData';

/** Which squad member "owns" a given file, by extension. */
function agentForFile(path: string): string {
  if (/\.(test|spec)\.[a-z]+$/i.test(path)) return 'hawk';
  if (/\.(md|mdx|txt|rst)$/i.test(path)) return 'quill';
  if (/\.(ts|tsx|js|jsx|mjs|cjs|py|go|rs|java|c|cc|cpp|cs|rb|php|swift|kt|vue|svelte)$/i.test(path)) {
    return 'hammer';
  }
  return 'scout';
}

export function activate(context: vscode.ExtensionContext): void {
  const roster = new SquadTreeProvider();
  const skills = new SkillTreeProvider();
  const statusBar = new SquadStatusBar(context);

  const refresh = () => {
    roster.refresh();
    skills.refresh();
  };

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('copilotSquad.roster', roster),
    vscode.window.registerTreeDataProvider('copilotSquad.skills', skills),
  );

  registerChatParticipant(context);

  /* ── Commands ───────────────────────────────────────────── */

  context.subscriptions.push(
    vscode.commands.registerCommand('copilotSquad.openHQ', () => SquadHQPanel.show(context)),

    vscode.commands.registerCommand('copilotSquad.refresh', refresh),

    vscode.commands.registerCommand('copilotSquad.setup', async () => {
      const count = await setupSquad(context.extensionUri);
      if (count < 0) return;
      refresh();
      SquadHQPanel.cheer('Squad deployed — six agents reporting for duty.');
      const action = await vscode.window.showInformationMessage(
        `🐾 Copilot Squad deployed — ${count} files written to .github/.`,
        'Open Squad HQ',
        'Ask @squad',
      );
      if (action === 'Open Squad HQ') vscode.commands.executeCommand('copilotSquad.openHQ');
      if (action === 'Ask @squad') vscode.commands.executeCommand('copilotSquad.askSquad');
    }),

    vscode.commands.registerCommand('copilotSquad.recruit', async () => {
      const recruit = await recruitAgent();
      if (!recruit) return;
      refresh();
      SquadHQPanel.cheer(`${recruit.emoji} ${recruit.name} joined the squad!`);
      vscode.window.showInformationMessage(
        `${recruit.emoji} ${recruit.name} recruited — agent file created in .github/agents/.`,
      );
    }),

    vscode.commands.registerCommand('copilotSquad.openAgent', async (agentId?: string) => {
      const root = workspaceRoot();
      if (!root || !agentId) return;
      const file = vscode.Uri.joinPath(root, '.github', 'agents', `${agentId}.agent.md`);
      try {
        await vscode.window.showTextDocument(file);
      } catch {
        const action = await vscode.window.showInformationMessage(
          `No agent file for "${agentId}" yet. Deploy the squad?`,
          'Set Up the Squad',
        );
        if (action) vscode.commands.executeCommand('copilotSquad.setup');
      }
    }),

    vscode.commands.registerCommand('copilotSquad.askSquad', (agentId?: string) => {
      if (typeof agentId === 'string') {
        vscode.commands.executeCommand('copilotSquad.openAgent', agentId);
        return;
      }
      vscode.commands.executeCommand('workbench.action.chat.open', { query: '@squad ' });
    }),

    vscode.commands.registerCommand('copilotSquad.runSkill', (uri?: vscode.Uri) => {
      if (uri) vscode.window.showTextDocument(uri);
    }),
  );

  /* ── Live editor hooks — the pets react to what you do ──── */

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (doc.uri.scheme !== 'file') return;
      const name = doc.uri.path.split('/').pop() ?? 'a file';
      const agentId = agentForFile(doc.uri.path);
      statusBar.flash(agentId);
      SquadHQPanel.pulse(agentId, `saw you save ${name}`);
    }),

    vscode.workspace.onDidCreateFiles((e) => {
      const newAgent = e.files.find((f) => f.path.endsWith('.agent.md'));
      if (newAgent) {
        refresh();
        SquadHQPanel.cheer('A new agent file appeared — welcome aboard!');
      }
    }),
  );

  const root = workspaceRoot();
  if (root) {
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(root, '.github/{agents,prompts}/**'),
    );
    watcher.onDidCreate(refresh);
    watcher.onDidDelete(refresh);
    watcher.onDidChange(refresh);
    context.subscriptions.push(watcher);
  }
}

export function deactivate(): void {
  /* nothing to clean up — disposables are tracked on context.subscriptions */
}
