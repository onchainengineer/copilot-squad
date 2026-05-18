/**
 * Command Centre dashboard panels — Grafana-style.
 *
 *  renderStats         · the stat-tile row
 *  renderMissionControl· assign a mission, watch the relay
 *  renderSoldierStatus · live status table of the army
 *  renderThroughput    · missions handled, per soldier
 *  renderOpsLog        · operations timeline
 *
 * Every panel subscribes to the shared MissionEngine.
 */

import { squad, getMember } from './squad';
import { mascotSvg } from './mascots';
import { MissionEngine, SAMPLE_MISSIONS } from './missions';

/* ── Stat tiles ───────────────────────────────────────────── */

export function renderStats(host: HTMLElement, engine: MissionEngine): void {
  const tiles = [
    { id: 'missions', label: 'Missions run', value: () => engine.stats.missions },
    { id: 'handoffs', label: 'Handoffs', value: () => engine.stats.handoffs },
    { id: 'steps', label: 'Steps executed', value: () => engine.stats.steps },
    { id: 'onduty', label: 'Soldiers on duty', value: () => squad.length },
  ];
  host.innerHTML = tiles
    .map(
      (t) => `
      <div class="gf-stat">
        <span class="gf-stat-num" id="stat-${t.id}">${t.value()}</span>
        <span class="gf-stat-label">${t.label}</span>
      </div>`,
    )
    .join('');

  const bump = (id: string, v: number) => {
    const el = host.querySelector(`#stat-${id}`);
    if (!el) return;
    el.textContent = String(v);
    el.classList.remove('bump');
    void (el as HTMLElement).offsetWidth;
    el.classList.add('bump');
  };

  engine.subscribe((e) => {
    if (e.type === 'handoff') bump('handoffs', engine.stats.handoffs);
    if (e.type === 'step-done') bump('steps', engine.stats.steps);
    if (e.type === 'complete') bump('missions', engine.stats.missions);
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
      <input class="mc-input" name="mission" placeholder="Assign a mission to the army…  e.g. “build a settings page”" />
      <button class="mc-go" type="submit">Deploy the army →</button>
    </form>
    <div class="mc-chips">
      ${SAMPLE_MISSIONS.map(
        (m) => `<button class="chip" type="button" data-mission="${m.text}">${m.icon} ${m.text}</button>`,
      ).join('')}
    </div>
    <div class="run" hidden>
      <div class="run-stepper" id="run-stepper"></div>
      <div class="run-log" id="run-log"></div>
      <div class="run-banner" id="run-banner" hidden>✓ Mission complete — army stood down</div>
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
    go.textContent = locked ? 'Army deployed…' : 'Deploy the army →';
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
  chips.forEach((chip) => chip.addEventListener('click', () => launch(chip.dataset.mission ?? '')));

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
      stepper.querySelector(`.step[data-i="${e.index}"]`)?.classList.replace('pending', 'running');
    }
    if (e.type === 'log') {
      const m = getMember(e.agentId);
      log.querySelector('.log-line.live')?.classList.remove('live');
      const line = document.createElement('div');
      line.className = 'log-line live';
      line.style.setProperty('--accent', m?.color ?? '#888');
      line.innerHTML = `${mini(e.agentId)}<span class="log-agent">${m?.name ?? e.agentId}</span><span class="log-text">${e.text}</span>`;
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

/* ── Soldier Status table ─────────────────────────────────── */

export function renderSoldierStatus(host: HTMLElement, engine: MissionEngine): void {
  host.innerHTML = `
    <div class="ss-table">
      <div class="ss-head"><span>Soldier</span><span>Status</span><span>Missions</span></div>
      ${squad
        .map(
          (m) => `
        <div class="ss-row" id="ss-${m.id}" style="--accent:${m.color}">
          <span class="ss-soldier">${mascotSvg(m)}<span class="ss-meta"><b>${m.name}</b><em>${m.role}</em></span></span>
          <span class="ss-status" data-status="idle"><i></i>Idle</span>
          <span class="ss-missions"><b id="ssm-${m.id}">0</b></span>
        </div>`,
        )
        .join('')}
    </div>`;

  const runs: Record<string, number> = {};
  const set = (id: string, status: 'idle' | 'working' | 'done', label: string) => {
    const cell = host.querySelector(`#ss-${id} .ss-status`) as HTMLElement | null;
    if (!cell) return;
    cell.dataset.status = status;
    cell.innerHTML = `<i></i>${label}`;
  };

  engine.subscribe((e) => {
    if (e.type === 'step-start') set(e.step.agentId, 'working', e.step.action);
    if (e.type === 'step-done') {
      set(e.step.agentId, 'done', 'Done');
      runs[e.step.agentId] = (runs[e.step.agentId] ?? 0) + 1;
      const c = host.querySelector(`#ssm-${e.step.agentId}`);
      if (c) c.textContent = String(runs[e.step.agentId]);
    }
    if (e.type === 'complete') squad.forEach((m) => set(m.id, 'idle', 'Idle'));
  });
}

/* ── Throughput bars ──────────────────────────────────────── */

export function renderThroughput(host: HTMLElement, engine: MissionEngine): void {
  host.innerHTML = `<div class="tp">${squad
    .map(
      (m) => `
      <div class="tp-row" style="--accent:${m.color}">
        <span class="tp-name">${m.name}</span>
        <span class="tp-track"><span class="tp-bar" id="tp-${m.id}"></span></span>
        <span class="tp-val" id="tpv-${m.id}">0</span>
      </div>`,
    )
    .join('')}</div>`;

  const runs: Record<string, number> = {};
  engine.subscribe((e) => {
    if (e.type !== 'step-done') return;
    runs[e.step.agentId] = (runs[e.step.agentId] ?? 0) + 1;
    const max = Math.max(1, ...Object.values(runs));
    for (const id of Object.keys(runs)) {
      const bar = host.querySelector(`#tp-${id}`) as HTMLElement | null;
      const val = host.querySelector(`#tpv-${id}`);
      if (bar) bar.style.width = `${(runs[id] / max) * 100}%`;
      if (val) val.textContent = String(runs[id]);
    }
  });
}

/* ── Operations log ───────────────────────────────────────── */

export function renderOpsLog(host: HTMLElement, engine: MissionEngine): void {
  const countEl = document.getElementById('ops-count');
  let total = 0;

  const push = (accent: string, tag: string, text: string) => {
    total++;
    if (countEl) countEl.textContent = `${total} event${total === 1 ? '' : 's'}`;
    const row = document.createElement('div');
    row.className = 'ops-line';
    row.style.setProperty('--accent', accent);
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    row.innerHTML = `<span class="ops-time">${time}</span><span class="ops-tag">${tag}</span><span class="ops-text">${text}</span>`;
    host.insertBefore(row, host.firstChild);
    while (host.children.length > 14) host.lastChild?.remove();
  };

  engine.subscribe((e) => {
    if (e.type === 'plan') push('#58a6ff', 'MISSION', `Assigned — “${e.mission}”`);
    else if (e.type === 'step-start') {
      const m = getMember(e.step.agentId);
      push(m?.color ?? '#888', 'DISPATCH', `${m?.name ?? e.step.agentId} → ${e.step.action}`);
    } else if (e.type === 'handoff') {
      const from = getMember(e.from);
      const to = getMember(e.to);
      push('#bc8cff', 'HANDOFF', `${from?.name ?? e.from} → ${to?.name ?? e.to}`);
    } else if (e.type === 'complete') {
      push('#3fb950', 'COMPLETE', 'Mission complete — army stood down');
    }
  });
}
