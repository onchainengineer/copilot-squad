/**
 * THE ARMY · LIVE — the roaming-soldiers panel.
 *
 * Soldiers roam the panel; each carries a status bubble ("head cloud") that
 * reports what it is actually doing — idle chatter when off-duty, the live
 * step when a mission is running. Wired to the shared MissionEngine.
 */

import { squad, type SquadMember } from './squad';
import { mascotSvg } from './mascots';
import type { MissionEngine } from './missions';

const UNIT_W = 88;
const AMBIENT = ['on watch', 'idle', 'ready', 'standing by', 'holding position'];

interface Unit {
  member: SquadMember;
  el: HTMLElement;
  sprite: HTMLElement;
  bubble: HTMLElement;
  x: number;
  dir: 1 | -1;
  speed: number;
  phase: number;
  status: 'idle' | 'working' | 'done';
  ambient: number;
  ambientAt: number;
}

export function mountArmyLive(host: HTMLElement, engine: MissionEngine): void {
  const track = document.createElement('div');
  track.className = 'al-track';
  host.appendChild(track);

  const units: Unit[] = squad.map((member, i) => {
    const el = document.createElement('div');
    el.className = 'al-unit';
    el.style.setProperty('--accent', member.color);
    el.innerHTML = `
      <span class="al-bubble" data-status="idle">idle</span>
      <span class="al-sprite">${mascotSvg(member)}</span>
      <span class="al-name">${member.name}</span>`;
    track.appendChild(el);
    return {
      member,
      el,
      sprite: el.querySelector('.al-sprite') as HTMLElement,
      bubble: el.querySelector('.al-bubble') as HTMLElement,
      x: 12 + i * (UNIT_W + 6),
      dir: Math.random() < 0.5 ? -1 : 1,
      speed: 0.02 + Math.random() * 0.03,
      phase: Math.random() * 6.28,
      status: 'idle',
      ambient: i % AMBIENT.length,
      ambientAt: 0,
    };
  });
  const byId: Record<string, Unit> = {};
  units.forEach((u) => (byId[u.member.id] = u));

  const tag = document.getElementById('army-tag');

  const setStatus = (u: Unit, status: Unit['status'], text: string) => {
    u.status = status;
    u.bubble.dataset.status = status;
    u.bubble.textContent = text;
    u.el.classList.toggle('busy', status === 'working');
  };

  engine.subscribe((e) => {
    if (e.type === 'plan') {
      if (tag) tag.textContent = 'mission active';
    } else if (e.type === 'step-start') {
      const u = byId[e.step.agentId];
      if (u) setStatus(u, 'working', `⚙ ${e.step.action.toLowerCase()}`);
    } else if (e.type === 'step-done') {
      const u = byId[e.step.agentId];
      if (u) setStatus(u, 'idle', 'idle');
    } else if (e.type === 'complete') {
      if (tag) tag.textContent = 'standing by';
      units.forEach((u) => setStatus(u, 'done', '✓ done'));
      setTimeout(() => {
        units.forEach((u) => {
          if (u.status === 'done') setStatus(u, 'idle', 'idle');
        });
      }, 1900);
    }
  });

  let last = performance.now();
  function frame(now: number): void {
    const dt = Math.min(now - last, 48);
    last = now;
    // each soldier patrols its own lane — bubbles never overlap
    const lane = track.clientWidth / units.length;
    units.forEach((u, i) => {
      u.phase += dt * 0.005;
      const lo = i * lane + 6;
      const hi = Math.max(lo, (i + 1) * lane - UNIT_W - 6);
      if (u.x < lo) u.x = lo;
      if (u.status !== 'working') {
        u.x += u.dir * u.speed * dt;
        if (u.x <= lo) {
          u.x = lo;
          u.dir = 1;
        } else if (u.x >= hi) {
          u.x = hi;
          u.dir = -1;
        }
        if (u.status === 'idle' && now > u.ambientAt) {
          u.ambientAt = now + 4000 + Math.random() * 4500;
          u.ambient = (u.ambient + 1) % AMBIENT.length;
          u.bubble.textContent = AMBIENT[u.ambient];
        }
      }
      const bob = Math.sin(u.phase) * (u.status === 'working' ? 6 : 4);
      u.el.style.transform = `translate(${u.x.toFixed(1)}px, ${bob.toFixed(1)}px)`;
      u.sprite.style.transform = `scaleX(${u.dir})`;
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
