/**
 * Copilot Command Centre — extension entry point.
 *
 * Wires up the native sidebar (the Army + Skills tree views), the @army chat
 * participant, the status-bar soldier, the scaffold commands, and the live
 * editor-event hooks. No webview — the army lives in VS Code's own surfaces.
 */

import * as vscode from 'vscode';
import { SquadTreeProvider, SkillTreeProvider } from './squadTree';
import { registerChatParticipant } from './chatParticipant';
import { SquadStatusBar } from './statusBar';
import { setupSquad, recruitAgent } from './scaffold';
import { workspaceRoot } from './squadData';

/** Which agent "owns" a given file, by extension. */
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
    vscode.window.registerTreeDataProvider('commandCentre.roster', roster),
    vscode.window.registerTreeDataProvider('commandCentre.skills', skills),
  );

  registerChatParticipant(context);

  /* ── Commands ───────────────────────────────────────────── */

  context.subscriptions.push(
    vscode.commands.registerCommand('commandCentre.refresh', refresh),

    vscode.commands.registerCommand('commandCentre.setup', async () => {
      const count = await setupSquad(context.extensionUri);
      if (count < 0) return;
      refresh();
      const action = await vscode.window.showInformationMessage(
        `🐾 Copilot Command Centre deployed — ${count} files written to .github/.`,
        'Ask @army',
      );
      if (action === 'Ask @army') vscode.commands.executeCommand('commandCentre.askSquad');
    }),

    vscode.commands.registerCommand('commandCentre.recruit', async () => {
      const recruit = await recruitAgent();
      if (!recruit) return;
      refresh();
      vscode.window.showInformationMessage(
        `${recruit.emoji} ${recruit.name} recruited — agent file created in .github/agents/.`,
      );
    }),

    vscode.commands.registerCommand(
      'commandCentre.openAgent',
      async (arg?: { agentId?: string } | string) => {
        const agentId = typeof arg === 'string' ? arg : arg?.agentId;
        const root = workspaceRoot();
        if (!root || !agentId) return;
        const file = vscode.Uri.joinPath(root, '.github', 'agents', `${agentId}.agent.md`);
        try {
          await vscode.window.showTextDocument(file);
        } catch {
          const action = await vscode.window.showInformationMessage(
            `No agent file for "${agentId}" yet. Deploy the army?`,
            'Set Up the Army',
          );
          if (action) vscode.commands.executeCommand('commandCentre.setup');
        }
      },
    ),

    vscode.commands.registerCommand('commandCentre.briefAgent', () => {
      vscode.commands.executeCommand('workbench.action.chat.open', { query: '@army ' });
    }),

    vscode.commands.registerCommand('commandCentre.askSquad', (agentId?: string) => {
      if (typeof agentId === 'string') {
        vscode.commands.executeCommand('commandCentre.openAgent', agentId);
        return;
      }
      vscode.commands.executeCommand('workbench.action.chat.open', { query: '@army ' });
    }),

    vscode.commands.registerCommand('commandCentre.runSkill', (uri?: vscode.Uri) => {
      if (uri) vscode.window.showTextDocument(uri);
    }),
  );

  /* ── Live editor hooks — agent status reflects what you do ── */

  const clearTimers = new Map<string, ReturnType<typeof setTimeout>>();

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (doc.uri.scheme !== 'file') return;
      const agentId = agentForFile(doc.uri.path);
      statusBar.flash(agentId);
      roster.setStatus(agentId, 'working');
      clearTimeout(clearTimers.get(agentId));
      clearTimers.set(
        agentId,
        setTimeout(() => roster.setStatus(agentId, undefined), 4200),
      );
    }),

    vscode.workspace.onDidCreateFiles((e) => {
      if (e.files.some((f) => f.path.endsWith('.agent.md'))) refresh();
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
