/**
 * THE DECK — the animated navbar where the squad mascots live.
 *
 * Each mascot wanders, bobs, flips, idles, and mutters quips. Hover one to
 * hear its catchphrase; click one to jump to its card in HQ.
 */

import { squad, type SquadMember } from './squad';
import { mascotSvg } from './mascots';

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
  paused: boolean;
  idleUntil: number;
  bubbleTimer: number;
}

export function mountDeck(track: HTMLElement, onSelect: (id: string) => void): void {
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
      x: EDGE_PAD + i * (PET_SIZE + 26),
      dir: Math.random() < 0.5 ? -1 : 1,
      speed: 0.018 + Math.random() * 0.04,
      phase: Math.random() * Math.PI * 2,
      paused: false,
      idleUntil: 0,
      bubbleTimer: 0,
    };

    el.addEventListener('pointerenter', () => {
      pet.paused = true;
      say(pet, member.catchphrase, 5000);
    });
    el.addEventListener('pointerleave', () => {
      pet.paused = false;
    });
    el.addEventListener('click', () => onSelect(member.id));

    return pet;
  });

  function say(pet: Pet, text: string, ms: number): void {
    pet.bubble.textContent = text;
    pet.bubble.classList.add('show');
    clearTimeout(pet.bubbleTimer);
    pet.bubbleTimer = window.setTimeout(() => pet.bubble.classList.remove('show'), ms);
  }

  let last = performance.now();
  function frame(now: number): void {
    const dt = Math.min(now - last, 48);
    last = now;
    const max = track.clientWidth - PET_SIZE - EDGE_PAD;

    for (const pet of pets) {
      pet.phase += dt * 0.005;

      if (!pet.paused && now > pet.idleUntil) {
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

      const bob = Math.sin(pet.phase) * 5;
      pet.el.style.transform = `translate(${pet.x}px, ${bob}px)`;
      pet.sprite.style.transform = `scaleX(${pet.dir})`;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
