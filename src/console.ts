/**
 * The interaction console — the medium for briefing a Copilot agent.
 *
 * You pick an agent (from the navbar dropdown or a roster card), give it a task,
 * and the console shows the agent picking it up and working it. A simulated
 * interaction stand-in for a real Copilot Chat session.
 */

import type { SquadMember } from './squad';
import { roleIcon } from './icons';

export interface Task {
  agent: SquadMember;
  text: string;
  at: Date;
}

/** Themed response lines per agent role. */
function respond(agent: SquadMember, task: string): string[] {
  const t = task.length > 60 ? task.slice(0, 58) + '…' : task;
  const lines: Record<string, string[]> = {
    scout: [
      `Picking up: “${t}”.`,
      `Searching the codebase and tracing where this lives…`,
      `Mapped the area. Recon notes ready — handing off to whoever builds it.`,
    ],
    hammer: [
      `On it: “${t}”.`,
      `Confirmed the target. Writing the implementation, strict types, no new deps.`,
      `Build is green. Change is ready for review.`,
    ],
    hawk: [
      `Reviewing: “${t}”.`,
      `Checking correctness, types, scope, and conventions…`,
      `Verdict: approved with 1 nit, 0 blockers.`,
    ],
    patch: [
      `Diagnosing: “${t}”.`,
      `Reproduced it. Tracing the root cause, not the symptom…`,
      `Root cause found and fixed. Re-ran the build — green.`,
    ],
    captain: [
      `Mission received: “${t}”.`,
      `Classifying and routing to the right specialist…`,
      `Dispatched. The squad has it from here.`,
    ],
    quill: [
      `Documenting: “${t}”.`,
      `Reading the code so the docs are accurate…`,
      `Draft written — clear, minimal, verified against the source.`,
    ],
  };
  return lines[agent.id] ?? [`On it: “${t}”.`, `Working…`, `Done.`];
}

type GetAgent = () => SquadMember;

export function mountConsole(
  host: HTMLElement,
  getAgent: GetAgent,
  onTask: (task: Task) => void,
): { refresh: () => void } {
  let busy = false;

  function render(): void {
    const a = getAgent();
    host.innerHTML = `
      <div class="console-agent">
        <span class="console-icon" style="--accent:${a.color}">${roleIcon(a.id, a.color)}</span>
        <div class="console-id">
          <span class="console-role" style="color:${a.color}">${a.role}</span>
          <h3>Brief ${a.name}</h3>
          <p>${a.specialty}</p>
        </div>
      </div>
      <form class="console-form" autocomplete="off">
        <input class="console-input" name="task"
          placeholder="Assign a task to ${a.name}…  e.g. “add a settings route”" />
        <button class="btn btn-primary console-go" type="submit">Assign task</button>
      </form>
      <div class="console-thread" id="console-thread"></div>`;

    const form = host.querySelector('.console-form') as HTMLFormElement;
    const input = host.querySelector('.console-input') as HTMLInputElement;
    const go = host.querySelector('.console-go') as HTMLButtonElement;
    const thread = host.querySelector('#console-thread') as HTMLElement;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || busy) return;
      run(a, text, input, go, thread);
    });
  }

  async function run(
    agent: SquadMember,
    text: string,
    input: HTMLInputElement,
    go: HTMLButtonElement,
    thread: HTMLElement,
  ): Promise<void> {
    busy = true;
    input.disabled = true;
    go.disabled = true;
    go.textContent = 'Working…';

    const card = document.createElement('div');
    card.className = 'thread-item';
    card.style.setProperty('--accent', agent.color);
    card.innerHTML = `
      <div class="thread-task"><span class="thread-you">You</span> briefed
        <b style="color:${agent.color}">${agent.name}</b><span class="thread-when"></span>
        <p>${text}</p></div>
      <div class="thread-reply">
        <span class="thread-icon">${roleIcon(agent.id, agent.color)}</span>
        <div class="thread-lines"></div>
      </div>`;
    (card.querySelector('.thread-when') as HTMLElement).textContent =
      ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    thread.insertBefore(card, thread.firstChild);
    const lines = card.querySelector('.thread-lines') as HTMLElement;

    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    await wait(420);
    for (const line of respond(agent, text)) {
      const el = document.createElement('div');
      el.className = 'thread-line';
      el.textContent = line;
      lines.appendChild(el);
      await wait(680);
    }
    const done = document.createElement('div');
    done.className = 'thread-done';
    done.textContent = '✓ Task complete';
    lines.appendChild(done);

    onTask({ agent, text, at: new Date() });
    busy = false;
    input.disabled = false;
    go.disabled = false;
    go.textContent = 'Assign task';
    input.value = '';
    input.focus();
  }

  render();
  return { refresh: render };
}
