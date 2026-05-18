/**
 * Squad HQ — the animated webview panel.
 *
 * A command-center view where the mascot agents roam, react to live editor
 * activity, and can be put to work with a click. The extension drives it with
 * `pulse()` / `cheer()`; the webview talks back via `postMessage`.
 */

import * as vscode from 'vscode';
import { SQUAD } from './squadData';

function nonce(): string {
  return Array.from({ length: 24 }, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[
      Math.floor(Math.random() * 62)
    ],
  ).join('');
}

export class SquadHQPanel {
  private static current: SquadHQPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly disposables: vscode.Disposable[] = [];

  static show(context: vscode.ExtensionContext): void {
    if (SquadHQPanel.current) {
      SquadHQPanel.current.panel.reveal();
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      'copilotSquad.hq',
      'Squad HQ',
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')],
      },
    );
    SquadHQPanel.current = new SquadHQPanel(panel, context.extensionUri);
  }

  /** Flash an agent into a "working" state with a live activity line. */
  static pulse(agentId: string, text: string): void {
    SquadHQPanel.current?.post({ type: 'pulse', agentId, text });
  }

  /** Make the whole squad celebrate (e.g. a new agent was recruited). */
  static cheer(text: string): void {
    SquadHQPanel.current?.post({ type: 'cheer', text });
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.panel.webview.html = this.render(panel.webview, extensionUri);

    this.panel.webview.onDidReceiveMessage(
      (msg) => {
        if (msg?.type === 'select' && typeof msg.agentId === 'string') {
          vscode.commands.executeCommand('copilotSquad.askSquad', msg.agentId);
        } else if (msg?.type === 'run' && typeof msg.command === 'string') {
          vscode.commands.executeCommand(msg.command);
        }
      },
      undefined,
      this.disposables,
    );

    this.panel.onDidDispose(() => this.dispose(), undefined, this.disposables);
  }

  private post(message: unknown): void {
    this.panel.webview.postMessage(message);
  }

  private dispose(): void {
    SquadHQPanel.current = undefined;
    this.panel.dispose();
    while (this.disposables.length) this.disposables.pop()?.dispose();
  }

  private render(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const asset = (file: string) =>
      webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', file));
    const n = nonce();
    const squadJson = JSON.stringify(SQUAD);
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${n}';" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="stylesheet" href="${asset('hq.css')}" />
<title>Squad HQ</title>
</head>
<body>
<div id="app"></div>
<script nonce="${n}">window.__SQUAD__ = ${squadJson};</script>
<script nonce="${n}" src="${asset('sprites.js')}"></script>
<script nonce="${n}" src="${asset('hq.js')}"></script>
</body>
</html>`;
  }
}
