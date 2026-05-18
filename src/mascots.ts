/**
 * MASCOT ART — one cute SVG per animal.
 *
 * All mascots share a "blob pet" base so the squad looks like a set.
 * Each function takes the squad member's accent color and returns SVG markup.
 *
 * Adding a new animal? Add a case here + a builder function, and add the
 * animal to the union type in `squad.ts`. The `/recruit-squad-member` skill
 * knows how to do this for you.
 */

import type { SquadMember } from './squad';

const INK = '#141926';

/** shared eyes — `dx` spreads the pupils, `cy` sets the eye line */
function eyes(cy = 50, dx = 13): string {
  return `
    <circle cx="${50 - dx}" cy="${cy}" r="7" fill="#fff"/>
    <circle cx="${50 + dx}" cy="${cy}" r="7" fill="#fff"/>
    <circle cx="${50 - dx + 1}" cy="${cy + 1}" r="4" fill="${INK}"/>
    <circle cx="${50 + dx + 1}" cy="${cy + 1}" r="4" fill="${INK}"/>
    <circle cx="${50 - dx + 2.5}" cy="${cy - 0.5}" r="1.6" fill="#fff"/>
    <circle cx="${50 + dx + 2.5}" cy="${cy - 0.5}" r="1.6" fill="#fff"/>`;
}

function fox(c: string): string {
  return `
    <path d="M20 40 L30 6 L48 32 Z" fill="${c}"/>
    <path d="M80 40 L70 6 L52 32 Z" fill="${c}"/>
    <path d="M27 30 L31 15 L39 28 Z" fill="#fff" opacity=".55"/>
    <path d="M73 30 L69 15 L61 28 Z" fill="#fff" opacity=".55"/>
    <ellipse cx="50" cy="58" rx="35" ry="33" fill="${c}"/>
    <ellipse cx="50" cy="72" rx="22" ry="17" fill="#fff" opacity=".95"/>
    ${eyes(53, 14)}
    <ellipse cx="50" cy="66" rx="5.5" ry="4.2" fill="${INK}"/>`;
}

function beaver(c: string): string {
  return `
    <circle cx="26" cy="24" r="11" fill="${c}"/>
    <circle cx="74" cy="24" r="11" fill="${c}"/>
    <ellipse cx="50" cy="60" rx="36" ry="34" fill="${c}"/>
    <ellipse cx="50" cy="70" rx="20" ry="16" fill="#fff" opacity=".9"/>
    ${eyes(50, 13)}
    <ellipse cx="50" cy="64" rx="4.5" ry="3.5" fill="${INK}"/>
    <rect x="44" y="69" width="5.5" height="11" rx="1.5" fill="#fff"/>
    <rect x="50.5" y="69" width="5.5" height="11" rx="1.5" fill="#fff"/>`;
}

function hawk(c: string): string {
  return `
    <path d="M16 36 L34 14 L42 34 Z" fill="${c}"/>
    <path d="M84 36 L66 14 L58 34 Z" fill="${c}"/>
    <ellipse cx="50" cy="56" rx="35" ry="34" fill="${c}"/>
    ${eyes(50, 14)}
    <path d="M30 44 L46 50 L31 53 Z" fill="${INK}" opacity=".6"/>
    <path d="M70 44 L54 50 L69 53 Z" fill="${INK}" opacity=".6"/>
    <path d="M50 60 L60 66 L50 78 L40 66 Z" fill="#f9b234"/>`;
}

function octopus(c: string): string {
  return `
    <path d="M14 76 q6 14 12 0 q6 14 12 0 q6 14 12 0 q6 14 12 0 q6 14 12 0 q6 14 12 0"
      fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>
    <ellipse cx="50" cy="48" rx="36" ry="34" fill="${c}"/>
    ${eyes(46, 14)}
    <path d="M40 62 q10 9 20 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
}

function owl(c: string): string {
  return `
    <path d="M22 22 L32 6 L40 24 Z" fill="${c}"/>
    <path d="M78 22 L68 6 L60 24 Z" fill="${c}"/>
    <ellipse cx="50" cy="56" rx="36" ry="35" fill="${c}"/>
    <circle cx="37" cy="50" r="15" fill="#fff" opacity=".95"/>
    <circle cx="63" cy="50" r="15" fill="#fff" opacity=".95"/>
    <circle cx="38" cy="51" r="7" fill="${INK}"/>
    <circle cx="62" cy="51" r="7" fill="${INK}"/>
    <circle cx="40" cy="49" r="2.4" fill="#fff"/>
    <circle cx="64" cy="49" r="2.4" fill="#fff"/>
    <path d="M50 60 L57 67 L50 74 L43 67 Z" fill="#f9b234"/>`;
}

function corgi(c: string): string {
  return `
    <path d="M50 30 L84 50 L78 86 L22 86 L16 50 Z" fill="#f9b234" opacity=".9"/>
    <path d="M22 42 L30 8 L46 34 Z" fill="${c}"/>
    <path d="M78 42 L70 8 L54 34 Z" fill="${c}"/>
    <ellipse cx="50" cy="58" rx="35" ry="33" fill="${c}"/>
    <ellipse cx="50" cy="72" rx="23" ry="17" fill="#fff" opacity=".95"/>
    ${eyes(53, 14)}
    <ellipse cx="50" cy="66" rx="5" ry="4" fill="${INK}"/>
    <path d="M44 76 q6 8 12 0 Z" fill="#ff7a8a"/>`;
}

const BUILDERS: Record<SquadMember['animal'], (c: string) => string> = {
  fox,
  beaver,
  hawk,
  octopus,
  owl,
  corgi,
};

/** Returns a full <svg> string for a squad member's mascot. */
export function mascotSvg(member: SquadMember): string {
  const build = BUILDERS[member.animal];
  const inner = build
    ? build(member.color)
    : // graceful fallback for an animal we don't have art for yet
      `<ellipse cx="50" cy="56" rx="35" ry="34" fill="${member.color}"/>${eyes(50, 13)}`;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="${member.name} the ${member.animal}">${inner}</svg>`;
}
