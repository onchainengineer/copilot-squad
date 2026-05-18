/**
 * The top navigation bar — its centrepiece is the agent selector dropdown:
 * a searchable popover that picks the "active agent" you brief from anywhere.
 */

import { squad, type SquadMember } from './squad';
import { roleIcon } from './icons';

type GetAgent = () => SquadMember;

export function mountNavbar(
  host: HTMLElement,
  getAgent: GetAgent,
  onSelect: (id: string) => void,
): { refresh: () => void } {
  function render(): void {
    const a = getAgent();
    host.innerHTML = `
      <div class="nav-inner">
        <a class="nav-brand" href="#top">
          <span class="nav-mark">⌘</span>
          <span class="nav-name">Copilot <b>Command Centre</b></span>
        </a>
        <div class="nav-right">
          <a class="nav-link" href="#roster">Roster</a>
          <a class="nav-link" href="#activity">Activity</a>
          <span class="nav-div"></span>
          <div class="agent-select" id="agent-select">
            <button class="agent-trigger" id="agent-trigger" aria-haspopup="listbox">
              <span class="agent-trigger-icon" style="--accent:${a.color}">${roleIcon(a.id, a.color)}</span>
              <span class="agent-trigger-text"><em>Active agent</em><b>${a.name}</b></span>
              <span class="agent-caret">⌄</span>
            </button>
            <div class="agent-pop" id="agent-pop" hidden>
              <div class="agent-pop-head">
                <input class="agent-search" id="agent-search" placeholder="Search agents…" />
              </div>
              <div class="agent-list" id="agent-list" role="listbox"></div>
            </div>
          </div>
        </div>
      </div>`;
    wire();
  }

  function wire(): void {
    const wrap = host.querySelector('#agent-select') as HTMLElement;
    const trigger = host.querySelector('#agent-trigger') as HTMLButtonElement;
    const pop = host.querySelector('#agent-pop') as HTMLElement;
    const search = host.querySelector('#agent-search') as HTMLInputElement;
    const list = host.querySelector('#agent-list') as HTMLElement;

    const renderList = (q = '') => {
      const query = q.trim().toLowerCase();
      const matches = squad.filter((m) =>
        `${m.name} ${m.role} ${m.specialty}`.toLowerCase().includes(query),
      );
      list.innerHTML = matches.length
        ? matches
            .map(
              (m) => `
        <button class="agent-item${m.id === getAgent().id ? ' sel' : ''}" data-id="${m.id}" role="option">
          <span class="agent-item-icon" style="--accent:${m.color}">${roleIcon(m.id, m.color)}</span>
          <span class="agent-item-meta">
            <b>${m.name}</b><em>${m.role}</em>
            <span class="agent-item-spec">${m.specialty}</span>
          </span>
          <span class="agent-check">✓</span>
        </button>`,
            )
            .join('')
        : '<div class="agent-empty">No agents match.</div>';
      list.querySelectorAll<HTMLButtonElement>('.agent-item').forEach((el) =>
        el.addEventListener('click', () => {
          onSelect(el.dataset.id ?? '');
          close();
        }),
      );
    };

    const onOutside = (e: PointerEvent) => {
      if (!wrap.contains(e.target as Node)) close();
    };
    const open = () => {
      pop.hidden = false;
      trigger.classList.add('open');
      search.value = '';
      renderList();
      search.focus();
      document.addEventListener('pointerdown', onOutside);
    };
    function close(): void {
      pop.hidden = true;
      trigger.classList.remove('open');
      document.removeEventListener('pointerdown', onOutside);
    }

    trigger.addEventListener('click', () => (pop.hidden ? open() : close()));
    search.addEventListener('input', () => renderList(search.value));
    search.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  render();
  return { refresh: render };
}
