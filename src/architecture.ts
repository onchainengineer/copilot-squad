/**
 * THE ARMY — system-architecture view.
 *
 * The army's command structure drawn as an enterprise architecture diagram:
 * each soldier is a node inside a labelled, dashed zone, wired to the Captain
 * (the orchestration hub) by dotted connectors. During a mission the active
 * soldier's node and its connector light up.
 */

import { squad } from './squad';
import { mascotSvg } from './mascots';
import type { MissionEngine } from './missions';

const CW = 920;
const CH = 600;

interface Zone {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Coordinate layout — Command in the centre, specialists ranked around it. */
const ZONES: Record<string, Zone> = {
  scout: { label: 'Recon', x: 16, y: 16, w: 282, h: 170 },
  hammer: { label: 'Build', x: 319, y: 16, w: 282, h: 170 },
  hawk: { label: 'Review', x: 622, y: 16, w: 282, h: 170 },
  captain: { label: 'Command', x: 168, y: 215, w: 584, h: 170 },
  patch: { label: 'Fix', x: 168, y: 414, w: 282, h: 170 },
  quill: { label: 'Scribe', x: 470, y: 414, w: 282, h: 170 },
};

export function mountArchitecture(host: HTMLElement, engine: MissionEngine): void {
  const frame = document.createElement('div');
  frame.className = 'arch-frame';
  const canvas = document.createElement('div');
  canvas.className = 'arch-canvas';
  canvas.style.width = `${CW}px`;
  canvas.style.height = `${CH}px`;
  frame.appendChild(canvas);
  host.appendChild(frame);

  // ── dotted connectors, fanning from the Command hub ──────────
  const topY = 186;
  const botY = 414;
  const hubTop = { x: 460, y: 215 };
  const hubBot = { x: 460, y: 385 };
  const wires = squad
    .filter((s) => ZONES[s.id] && s.id !== 'captain')
    .map((s) => {
      const z = ZONES[s.id];
      const cx = z.x + z.w / 2;
      const top = z.y < 200;
      const from = top ? hubTop : hubBot;
      const to = { x: cx, y: top ? topY : botY };
      return `<path id="wire-${s.id}" class="arch-wire" d="M${from.x} ${from.y} L${to.x} ${to.y}"/>`;
    })
    .join('');
  canvas.insertAdjacentHTML(
    'beforeend',
    `<svg class="arch-wires" viewBox="0 0 ${CW} ${CH}" preserveAspectRatio="none">${wires}</svg>`,
  );

  // ── zones + soldier nodes ────────────────────────────────────
  for (const member of squad) {
    const z = ZONES[member.id];
    if (!z) continue;
    const hub = member.id === 'captain';
    const zone = document.createElement('div');
    zone.className = `arch-zone${hub ? ' hub' : ''}`;
    zone.style.cssText = `left:${z.x}px;top:${z.y}px;width:${z.w}px;height:${z.h}px`;
    zone.style.setProperty('--accent', member.color);
    zone.innerHTML = `
      <span class="arch-zone-label">${hub ? '◆ ' : ''}${z.label}</span>
      <button class="arch-node" id="node-${member.id}" type="button">
        <span class="arch-node-mascot">${mascotSvg(member)}</span>
        <span class="arch-node-meta">
          <span class="arch-node-name">${member.name}</span>
          <span class="arch-node-role">${member.role}</span>
          <span class="arch-node-spec">${member.specialty}</span>
          <code class="arch-node-file">.github/agents/${member.id}.agent.md</code>
        </span>
        <span class="arch-node-status" aria-hidden="true"></span>
      </button>`;
    const node = zone.querySelector('.arch-node') as HTMLElement;
    node.addEventListener('click', () => {
      node.classList.remove('ping');
      void node.offsetWidth;
      node.classList.add('ping');
    });
    canvas.appendChild(zone);
  }

  // ── scale the fixed canvas to fit the host width ─────────────
  const fit = () => {
    const scale = Math.min(1, host.clientWidth / CW);
    canvas.style.transform = `scale(${scale})`;
    frame.style.height = `${CH * scale}px`;
  };
  fit();
  new ResizeObserver(fit).observe(host);

  // ── mission relay → light up the diagram ─────────────────────
  const node = (id: string) => document.getElementById(`node-${id}`);
  const wire = (id: string) => document.getElementById(`wire-${id}`);

  engine.subscribe((e) => {
    if (e.type === 'plan') {
      canvas.querySelectorAll('.arch-node').forEach((n) => n.classList.remove('active', 'done'));
      canvas.querySelectorAll('.arch-wire').forEach((w) => w.classList.remove('live'));
    } else if (e.type === 'step-start') {
      node(e.step.agentId)?.classList.add('active');
      wire(e.step.agentId)?.classList.add('live');
    } else if (e.type === 'step-done') {
      node(e.step.agentId)?.classList.remove('active');
      wire(e.step.agentId)?.classList.remove('live');
    } else if (e.type === 'complete') {
      canvas.querySelectorAll('.arch-node').forEach((n) => {
        n.classList.remove('active');
        n.classList.add('done');
      });
      canvas.querySelectorAll('.arch-wire').forEach((w) => w.classList.remove('live'));
    }
  });
}
