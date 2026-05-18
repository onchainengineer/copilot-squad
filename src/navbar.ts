/**
 * THE DECK — the animated navbar where the army's soldiers live.
 *
 * Idle: soldiers wander, bob, flip, and mutter quips.
 * On a mission: the active agent strides to a spotlight, the rest dim and
 * pause, a glowing handoff token flies between soldiers, and on completion the
 * whole army hops in celebration.
 */

import { squad, type SquadMember } from './squad';
import { mascotSvg } from './mascots';
import type { MissionEngine, MissionEvent } from './missions';

const PET_SIZE = 66;
const EDGE_PAD = 10;

interface Pet {
  member: SquadMember;
  el: HTMLElement;
  sprite: HTMLElement;
  bubble: HTMLElement;
  x: number;
  dir: 1 | -1;
  speed: number;
  phase: number;
  hovered: boolean;
  idleUntil: number;
  bubbleTimer: number;
  /** mission state */
  active: boolean;
  stageX: number | null;
  cheerUntil: number;
}

export function mountDeck(
  track: HTMLElement,
  engine: MissionEngine,
  onSelect: (id: string) => void,
): void {
  const token = document.createElement('div');
  token.className = 'deck-token';
  track.appendChild(token);

  const pets: Pet[] = squad.map((member, i) => {
    const el = document.createElement('button');
    el.className = 'pet';
    el.style.setProperty('--accent', member.color);
    el.setAttribute('aria-label', `${member.name} — ${member.role}`);
    el.innerHTML = `
      <span class="pet-bubble" role="status"></span>
      <span class="pet-sprite">${mascotSvg(member)}</span>
      <span class="pet-tag">${member.name}</span>`;
    track.appendChild(el);

    const pet: Pet = {
      member,
      el,
      sprite: el.querySelector('.pet-sprite') as HTMLElement,
      bubble: el.querySelector('.pet-bubble') as HTMLElement,
      x: EDGE_PAD + i * (PET_SIZE + 24),
      dir: Math.random() < 0.5 ? -1 : 1,
      speed: 0.02 + Math.random() * 0.04,
      phase: Math.random() * Math.PI * 2,
      hovered: false,
      idleUntil: 0,
      bubbleTimer: 0,
      active: false,
      stageX: null,
      cheerUntil: 0,
    };

    el.addEventListener('pointerenter', () => {
      pet.hovered = true;
      if (!pet.active) say(pet, member.catchphrase, 5000);
    });
    el.addEventListener('pointerleave', () => {
      pet.hovered = false;
    });
    el.addEventListener('click', () => onSelect(member.id));

    return pet;
  });

  const byId = (id: string) => pets.find((p) => p.member.id === id);
  let missionActive = false;

  function say(pet: Pet, text: string, ms: number): void {
    pet.bubble.textContent = text;
    pet.bubble.classList.add('show');
    clearTimeout(pet.bubbleTimer);
    if (ms > 0) {
      pet.bubbleTimer = window.setTimeout(() => pet.bubble.classList.remove('show'), ms);
    }
  }

  engine.subscribe((e: MissionEvent) => {
    if (e.type === 'plan') {
      missionActive = true;
      for (const p of pets) {
        p.el.classList.add('dim');
        p.bubble.classList.remove('show');
      }
    } else if (e.type === 'step-start') {
      const pet = byId(e.step.agentId);
      if (!pet) return;
      pet.active = true;
      pet.el.classList.remove('dim');
      pet.el.classList.add('active');
      pet.stageX = track.clientWidth / 2 - PET_SIZE / 2;
      say(pet, `⚙ ${e.step.action}…`, 0);
    } else if (e.type === 'handoff') {
      flyToken(e.from, e.to);
    } else if (e.type === 'step-done') {
      const pet = byId(e.step.agentId);
      if (!pet) return;
      pet.active = false;
      pet.stageX = null;
      pet.el.classList.remove('active');
      pet.el.classList.add('dim');
      pet.bubble.classList.remove('show');
    } else if (e.type === 'complete') {
      missionActive = false;
      const now = performance.now();
      for (const p of pets) {
        p.el.classList.remove('dim', 'active');
        p.active = false;
        p.stageX = null;
        p.cheerUntil = now + 1700;
        say(p, '✨', 1500);
      }
    }
  });

  function flyToken(fromId: string, toId: string): void {
    const from = byId(fromId);
    const to = byId(toId);
    if (!from || !to) return;
    token.style.transition = 'none';
    token.style.left = `${from.x + PET_SIZE / 2}px`;
    token.classList.add('show');
    requestAnimationFrame(() => {
      token.style.transition = 'left 0.85s cubic-bezier(.5,-0.2,.3,1.3)';
      token.style.left = `${to.x + PET_SIZE / 2}px`;
    });
    window.setTimeout(() => token.classList.remove('show'), 1000);
  }

  let last = performance.now();
  function frame(now: number): void {
    const dt = Math.min(now - last, 48);
    last = now;
    const max = track.clientWidth - PET_SIZE - EDGE_PAD;

    for (const pet of pets) {
      pet.phase += dt * 0.005;
      const cheering = now < pet.cheerUntil;

      if (pet.active && pet.stageX !== null) {
        pet.x += (pet.stageX - pet.x) * 0.09;
      } else if (!pet.hovered && !missionActive && now > pet.idleUntil) {
        pet.x += pet.dir * pet.speed * dt;
        if (pet.x <= EDGE_PAD) {
          pet.x = EDGE_PAD;
          pet.dir = 1;
        } else if (pet.x >= max) {
          pet.x = Math.max(EDGE_PAD, max);
          pet.dir = -1;
        }
        if (Math.random() < 0.0016) pet.idleUntil = now + 700 + Math.random() * 1600;
        if (Math.random() < 0.0009) pet.dir = (-pet.dir) as 1 | -1;
        if (Math.random() < 0.0012) {
          const quip = pet.member.quips[Math.floor(Math.random() * pet.member.quips.length)];
          say(pet, quip, 2800);
        }
      }

      const bob = cheering
        ? -Math.abs(Math.sin(pet.phase * 3)) * 15
        : Math.sin(pet.phase) * (pet.active ? 7 : 5) - (pet.active ? 6 : 0);
      pet.el.style.transform = `translate(${pet.x}px, ${bob}px)`;
      pet.sprite.style.transform = `scaleX(${pet.dir})`;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
