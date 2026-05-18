/**
 * The `@army` GitHub Copilot chat participant.
 *
 * Type `@army <task>` in Copilot Chat and the Captain routes the request to
 * the right specialist, then answers *as that agent* — using the agent's
 * persona from `.github/agents/<id>.agent.md` when it exists.
 *
 *   @army fix the navbar crash    → Captain routes to Patch 🐙
 *   @army /roster                 → lists the whole army
 *   @army /recruit                → scaffolds a new agent
 */

import * as vscode from 'vscode';
import { SQUAD, routeAgent, readAgentPersona } from './squadData';

export function registerChatParticipant(context: vscode.ExtensionContext): void {
  const handler: vscode.ChatRequestHandler = async (request, _ctx, stream, token) => {
    if (request.command === 'roster') {
      return showRoster(stream);
    }
    if (request.command === 'recruit') {
      return showRecruit(stream);
    }
    return runMission(request.prompt, stream, token);
  };

  const participant = vscode.chat.createChatParticipant('copilot-command-centre.army', handler);
  participant.iconPath = new vscode.ThemeIcon('organization');
  context.subscriptions.push(participant);
}

function showRoster(stream: vscode.ChatResponseStream): void {
  stream.markdown('### 🐾 The Copilot Command Centre\n\n');
  for (const a of SQUAD) {
    stream.markdown(`**${a.emoji} ${a.name}** — *${a.role}*\n${a.blurb}\n\n`);
  }
  stream.markdown('Hand me a task with `@army <your task>` and I’ll route it.\n');
  stream.button({
    command: 'workbench.view.extension.commandCentre',
    title: '🐾 Open the Army sidebar',
  });
}

function showRecruit(stream: vscode.ChatResponseStream): void {
  stream.markdown(
    '### ➕ Recruit a new agent\n\n' +
      'A new soldier needs a name, an animal, a role, and a clear job. ' +
      'The recruiter will scaffold the `.agent.md` file for you.\n\n',
  );
  stream.button({ command: 'commandCentre.recruit', title: '➕ Recruit a New Agent' });
}

async function runMission(
  prompt: string,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
): Promise<void> {
  const task = prompt.trim();
  if (!task) {
    stream.markdown('Hand me a mission — e.g. `@army add a settings page` or `@army fix the crash on load`.');
    return;
  }

  const { agent, reason } = routeAgent(task);
  stream.progress(`Captain is routing the mission…`);
  stream.markdown(`🐕 **Captain** → routing to **${agent.emoji} ${agent.name}**\n\n> ${reason}\n\n---\n\n`);

  const [model] = await vscode.lm.selectChatModels({ vendor: 'copilot' });
  if (!model) {
    stream.markdown(
      '⚠️ No GitHub Copilot language model is available. Make sure the ' +
        'GitHub Copilot extension is installed and signed in, then try again.',
    );
    return;
  }

  const persona = await readAgentPersona(agent.id);
  const messages = [
    vscode.LanguageModelChatMessage.User(
      `You are acting as a soldier. Adopt this persona and answer in it:\n\n` +
        `${persona}\n\n` +
        `Stay in character as ${agent.name}. Be concise and practical. ` +
        `Open with a one-line ${agent.emoji} status, then do the work.`,
    ),
    vscode.LanguageModelChatMessage.User(`Mission: ${task}`),
  ];

  try {
    const response = await model.sendRequest(messages, {}, token);
    for await (const chunk of response.text) {
      stream.markdown(chunk);
    }
  } catch (err) {
    stream.markdown(`\n\n⚠️ ${agent.name} hit an error: ${(err as Error).message}`);
  }

  stream.markdown('\n\n---\n');
  stream.button({
    command: 'commandCentre.openAgent',
    title: `Open the ${agent.name} agent file`,
    arguments: [agent.id],
  });
}
