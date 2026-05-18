/**
 * SQUAD HQ — the dashboard below the deck.
 *
 * Three panels:
 *  - Roster:   one card per squad member (= one Copilot agent).
 *  - Mission Control: type a task, "Captain" routes it to the right agent.
 *  - Comms:    a live feed of squad chatter.
 */

import { squad, getMember, type SquadMember } from './squad';
import { mascotSvg } from './mascots';

const KEYWORDS: Record<string, string[]> = {
  scout: ['find', 'where', 'locate', 'search', 'explore', 'research', 'understand', 'how does', 'look up', 'map'],
  hammer: ['build', 'add', 'create', 'implement', 'feature', 'scaffold', 'make', 'new ', 'ship'],
  hawk: ['review', 'audit', 'check', 'quality', 'risky', 'smell', 'pr ', 'diff', 'inspect'],
  patch: ['bug', 'fix', 'broken', 'error', 'crash', 'fail', 'debug', 'repro', 'issue', 'wrong'],
  quill: ['doc', 'document', 'readme', 'comment', 'explain', 'write up', 'guide', 'changelog'],
};

interface Routing {
  member: SquadMember;
  reason: string;
}

/** Captain's brain — heuristic mission routing. Mirrors the Captain agent. */
export function routeMission(text: string): Routing {
  const q = text.toLowerCase();
  let bestId = '';
  let bestScore = 0;
  for (const [id, words] of Object.entries(KEYWORDS)) {
    const score = words.reduce((n, w) => (q.includes(w) ? n + 1 : n), 0);
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }
  if (!bestId || bestScore === 0) {
    return {
      member: getMember('captain')!,
      reason: "No clear specialty match — I'll take point, break it down, and hand off the pieces.",
    };
  }
  const member = getMember(bestId)!;
  return {
    member,
    reason: `This is ${member.name}'s wheelhouse: ${member.specialty.toLowerCase()}`,
  };
}

function card(member: SquadMember): string {
  return `
    <article class="agent-card" id="card-${member.id}" style="--accent:${member.color}">
      <div class="agent-card-glow"></div>
      <div class="agent-mascot">${mascotSvg(member)}</div>
      <div class="agent-meta">
        <h3>${member.name}</h3>
        <p class="agent-role">${member.role}</p>
        <p class="agent-specialty">${member.specialty}</p>
        <code class="agent-file">.github/agents/${member.id}.agent.md</code>
      </div>
      <span class="agent-status" title="ready">●</span>
    </article>`;
}

export function renderRoster(host: HTMLElement): void {
  host.innerHTML = squad.map(card).join('');
}

export function renderMissionControl(host: HTMLElement): void {
  host.innerHTML = `
    <form class="mc-form" autocomplete="off">
      <input class="mc-input" name="mission" placeholder="Assign a mission…  e.g. “find where the navbar bobs” or “fix the crash on load”" />
      <button class="mc-go" type="submit">Route it →</button>
    </form>
    <div class="mc-result" hidden></div>`;

  const form = host.querySelector('.mc-form') as HTMLFormElement;
  const input = host.querySelector('.mc-input') as HTMLInputElement;
  const result = host.querySelector('.mc-result') as HTMLElement;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const { member, reason } = routeMission(text);
    result.hidden = false;
    result.style.setProperty('--accent', member.color);
    result.innerHTML = `
      <div class="mc-mascot">${mascotSvg(member)}</div>
      <div>
        <p class="mc-verdict"><strong>Captain</strong> routes this to <strong style="color:${member.color}">${member.name}</strong></p>
        <p class="mc-reason">${reason}</p>
        <p class="mc-hint">In VS Code: open Copilot Chat → pick the <code>${member.id}</code> agent → paste the mission.</p>
      </div>`;
  });
}

export function startComms(host: HTMLElement): void {
  const post = () => {
    const member = squad[Math.floor(Math.random() * squad.length)];
    const quip = member.quips[Math.floor(Math.random() * member.quips.length)];
    const line = document.createElement('div');
    line.className = 'comms-line';
    line.style.setProperty('--accent', member.color);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    line.innerHTML = `<span class="comms-time">${time}</span><span class="comms-name">${member.name}</span><span class="comms-msg">${quip}</span>`;
    host.prepend(line);
    while (host.children.length > 8) host.lastChild?.remove();
  };
  post();
  post();
  setInterval(post, 3800);
}
