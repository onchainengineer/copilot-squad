/**
 * Copilot Command Centre — the home page.
 *
 * A medium for interacting with your army of custom Copilot agents: pick the
 * active agent from the navbar dropdown (or a roster card), brief it a task in
 * the console, and watch it work. Light, clean, soft-shadowed.
 */

import './style.css';
import { squad, getMember, type SquadMember } from './squad';
import { roleIcon } from './icons';
import { mountNavbar } from './navbar';
import { mountConsole, type Task } from './console';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <nav class="nav" id="nav"></nav>

  <main class="page" id="top">
    <section class="hero">
      <span class="hero-badge">⌘</span>
      <h1>Your Copilot army, <span>on call.</span></h1>
      <p class="hero-sub">Six custom GitHub Copilot agents — each a specialist. Pick one, brief it a task, and watch it work.</p>
    </section>

    <section class="card console-panel" id="console"></section>

    <section class="block" id="roster">
      <div class="block-head">
        <div><h2>Your army</h2><p>Six agents on duty. Select one to make it active.</p></div>
        <span class="block-tag">${squad.length} agents</span>
      </div>
      <div class="roster-grid" id="roster-grid"></div>
    </section>

    <section class="stats" id="stats"></section>

    <section class="block" id="activity">
      <div class="block-head">
        <div><h2>Recent activity</h2><p>Tasks you've briefed across the army.</p></div>
        <span class="block-tag" id="activity-count">0 tasks</span>
      </div>
      <div class="recent" id="recent"></div>
    </section>
  </main>

  <footer class="foot">Copilot Command Centre · every agent is a real Copilot agent in <code>.github/agents/</code></footer>`;

/* ── selected-agent state ─────────────────────────────────── */
let current: SquadMember = getMember('captain') ?? squad[0];
const getAgent = () => current;

const navbar = mountNavbar(document.querySelector('#nav')!, getAgent, (id) => selectAgent(id));
const consolePanel = mountConsole(document.querySelector('#console')!, getAgent, onTask);

function selectAgent(id: string): void {
  const next = getMember(id);
  if (!next || next.id === current.id) return;
  current = next;
  navbar.refresh();
  consolePanel.refresh();
  renderRoster();
}

/* ── roster cards ─────────────────────────────────────────── */
const rosterGrid = document.querySelector<HTMLElement>('#roster-grid')!;
function renderRoster(): void {
  rosterGrid.innerHTML = squad
    .map(
      (m) => `
    <button class="agent-card${m.id === current.id ? ' cur' : ''}" data-id="${m.id}" style="--accent:${m.color}">
      <span class="agent-card-band"></span>
      <span class="agent-card-icon">${roleIcon(m.id, m.color)}</span>
      <span class="agent-card-body">
        <span class="agent-card-role">${m.role}</span>
        <h3>${m.name}</h3>
        <p>${m.specialty}</p>
      </span>
      <span class="agent-card-cta">${m.id === current.id ? 'Active agent' : `Brief ${m.name}`} →</span>
    </button>`,
    )
    .join('');
  rosterGrid.querySelectorAll<HTMLButtonElement>('.agent-card').forEach((el) =>
    el.addEventListener('click', () => {
      selectAgent(el.dataset.id ?? '');
      document.querySelector('#console')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }),
  );
}
renderRoster();

/* ── stats ────────────────────────────────────────────────── */
let taskCount = 0;
function renderStats(): void {
  const tiles = [
    { num: String(squad.length), label: 'Agents on duty' },
    { num: String(taskCount), label: 'Tasks briefed' },
    { num: '9', label: 'Skills available' },
  ];
  document.querySelector<HTMLElement>('#stats')!.innerHTML = tiles
    .map(
      (t) => `<div class="card stat"><span class="stat-num">${t.num}</span>
        <span class="stat-label">${t.label}</span></div>`,
    )
    .join('');
}
renderStats();

/* ── recent activity ──────────────────────────────────────── */
const recent = document.querySelector<HTMLElement>('#recent')!;
function onTask(task: Task): void {
  taskCount++;
  renderStats();
  document.querySelector<HTMLElement>('#activity-count')!.textContent =
    `${taskCount} task${taskCount === 1 ? '' : 's'}`;
  recent.querySelector('.recent-empty')?.remove();
  const row = document.createElement('div');
  row.className = 'recent-row';
  row.style.setProperty('--accent', task.agent.color);
  row.innerHTML = `
    <span class="recent-icon">${roleIcon(task.agent.id, task.agent.color)}</span>
    <span class="recent-meta"><b>${task.agent.name}</b><span>${task.text}</span></span>
    <span class="recent-time">${task.at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;
  recent.insertBefore(row, recent.firstChild);
  while (recent.children.length > 8) recent.lastChild?.remove();
}
recent.innerHTML = '<div class="recent-empty">No tasks yet — brief an agent above to get started.</div>';
