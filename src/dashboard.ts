/**
 * SQUAD HQ — the dashboard below the Deck.
 *
 *  - HUD:            live mission / handoff / squad counters.
 *  - Mission Control: assign a task; watch the squad run it as a live relay.
 *  - Roster:         one card per agent, with live status and a mission count.
 *
 * Every panel subscribes to the shared MissionEngine and animates on its events.
 */

import { squad, getMember, type SquadMember } from './squad';
import { mascotSvg } from './mascots';
import { MissionEngine, SAMPLE_MISSIONS } from './missions';

/* ── HUD ──────────────────────────────────────────────────── */

export function renderHud(host: HTMLElement, engine: MissionEngine): void {
  host.innerHTML = `
    <div class="hud-stat"><span class="hud-num" id="hud-missions">0</span><span class="hud-label">Missions run</span></div>
    <div class="hud-stat"><span class="hud-num" id="hud-handoffs">0</span><span class="hud-label">Handoffs</span></div>
    <div class="hud-stat"><span class="hud-num">${squad.length}</span><span class="hud-label">Agents ready</span></div>`;

  const missionsEl = host.querySelector('#hud-missions') as HTMLElement;
  const handoffsEl = host.querySelector('#hud-handoffs') as HTMLElement;

  const bump = (el: HTMLElement, value: number) => {
    el.textContent = String(value);
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  };

  engine.subscribe((e) => {
    if (e.type === 'handoff') bump(handoffsEl, engine.stats.handoffs);
    if (e.type === 'complete') bump(missionsEl, engine.stats.missions);
  });
}

/* ── Mission Control ──────────────────────────────────────── */

function mini(id: string): string {
  const m = getMember(id);
  return m ? `<span class="mini-mascot">${mascotSvg(m)}</span>` : '';
}

export function renderMissionControl(host: HTMLElement, engine: MissionEngine): void {
  host.innerHTML = `
    <form class="mc-form" autocomplete="off">
      <input class="mc-input" name="mission" placeholder="Assign a mission to the squad…  e.g. “build a settings page”" />
      <button class="mc-go" type="submit">Deploy squad →</button>
    </form>
    <div class="mc-chips">
      ${SAMPLE_MISSIONS.map(
        (m) => `<button class="chip" type="button" data-mission="${m.text}">${m.icon} ${m.text}</button>`,
      ).join('')}
    </div>
    <div class="run" hidden>
      <div class="run-stepper" id="run-stepper"></div>
      <div class="run-log" id="run-log"></div>
      <div class="run-banner" id="run-banner" hidden>✓ Mission complete — squad stood down</div>
    </div>`;

  const form = host.querySelector('.mc-form') as HTMLFormElement;
  const input = host.querySelector('.mc-input') as HTMLInputElement;
  const go = host.querySelector('.mc-go') as HTMLButtonElement;
  const run = host.querySelector('.run') as HTMLElement;
  const stepper = host.querySelector('#run-stepper') as HTMLElement;
  const log = host.querySelector('#run-log') as HTMLElement;
  const banner = host.querySelector('#run-banner') as HTMLElement;
  const chips = [...host.querySelectorAll<HTMLButtonElement>('.chip')];

  const setLocked = (locked: boolean) => {
    input.disabled = locked;
    go.disabled = locked;
    go.textContent = locked ? 'Squad deployed…' : 'Deploy squad →';
    chips.forEach((c) => (c.disabled = locked));
  };

  const launch = (text: string) => {
    if (engine.running || !text.trim()) return;
    input.value = text;
    engine.run(text);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    launch(input.value);
  });
  chips.forEach((chip) =>
    chip.addEventListener('click', () => launch(chip.dataset.mission ?? '')),
  );

  engine.subscribe((e) => {
    if (e.type === 'plan') {
      setLocked(true);
      run.hidden = false;
      banner.hidden = true;
      run.classList.remove('done');
      log.innerHTML = '';
      stepper.innerHTML = e.steps
        .map((step, i) => {
          const m = getMember(step.agentId);
          return `
            ${i > 0 ? '<span class="step-link"></span>' : ''}
            <div class="step pending" data-i="${i}" style="--accent:${m?.color ?? '#888'}">
              ${mini(step.agentId)}
              <span class="step-info"><b>${m?.name ?? step.agentId}</b><em>${step.action}</em></span>
            </div>`;
        })
        .join('');
    }

    if (e.type === 'step-start') {
      const node = stepper.querySelector(`.step[data-i="${e.index}"]`);
      node?.classList.replace('pending', 'running');
    }

    if (e.type === 'log') {
      const m = getMember(e.agentId);
      log.querySelector('.log-line.live')?.classList.remove('live');
      const line = document.createElement('div');
      line.className = 'log-line live';
      line.style.setProperty('--accent', m?.color ?? '#888');
      line.innerHTML = `
        ${mini(e.agentId)}
        <span class="log-agent">${m?.name ?? e.agentId}</span>
        <span class="log-text">${e.text}</span>`;
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
    }

    if (e.type === 'step-done') {
      const node = stepper.querySelector(`.step[data-i="${e.index}"]`);
      node?.classList.remove('running');
      node?.classList.add('done');
      const link = node?.previousElementSibling;
      if (link?.classList.contains('step-link')) link.classList.add('done');
    }

    if (e.type === 'complete') {
      setLocked(false);
      log.querySelector('.log-line.live')?.classList.remove('live');
      banner.hidden = false;
      run.classList.add('done');
    }
  });
}

/* ── Roster ───────────────────────────────────────────────── */

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
      <div class="agent-side">
        <span class="agent-pill" data-status="idle">Idle</span>
        <span class="agent-runs"><b id="runs-${member.id}">0</b> missions</span>
      </div>
    </article>`;
}

export function renderRoster(host: HTMLElement, engine: MissionEngine): void {
  host.innerHTML = squad.map(card).join('');
  const runs: Record<string, number> = {};

  const setStatus = (id: string, status: 'idle' | 'working' | 'done') => {
    const pill = host.querySelector(`#card-${id} .agent-pill`) as HTMLElement | null;
    if (!pill) return;
    pill.dataset.status = status;
    pill.textContent = status === 'idle' ? 'Idle' : status === 'working' ? 'Working' : 'Done ✓';
  };

  engine.subscribe((e) => {
    if (e.type === 'step-start') setStatus(e.step.agentId, 'working');
    if (e.type === 'step-done') {
      setStatus(e.step.agentId, 'done');
      runs[e.step.agentId] = (runs[e.step.agentId] ?? 0) + 1;
      const counter = host.querySelector(`#runs-${e.step.agentId}`);
      if (counter) counter.textContent = String(runs[e.step.agentId]);
    }
    if (e.type === 'complete') squad.forEach((m) => setStatus(m.id, 'idle'));
  });
}
