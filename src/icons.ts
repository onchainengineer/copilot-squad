/**
 * Role icons — one crisp line glyph per soldier, by function.
 * Replaces the mascot art with an enterprise, monochrome-friendly icon set.
 */

const GLYPH: Record<string, string> = {
  // Recon — magnifier
  scout: '<circle cx="11" cy="11" r="7"/><line x1="16.2" y1="16.2" x2="21" y2="21"/>',
  // Build — package / cube
  hammer:
    '<path d="M12 2.6 20.4 7.5V16.5L12 21.4 3.6 16.5V7.5Z"/>' +
    '<path d="M3.6 7.5 12 12.4 20.4 7.5"/><path d="M12 12.4V21.4"/>',
  // Review — eye
  hawk:
    '<path d="M2 12C5 7 8.4 4.6 12 4.6 15.6 4.6 19 7 22 12 19 17 15.6 19.4 12 19.4 8.4 19.4 5 17 2 12Z"/>' +
    '<circle cx="12" cy="12" r="3.2"/>',
  // Fix — patch / plaster
  patch:
    '<rect x="3.6" y="9" width="16.8" height="6" rx="3" transform="rotate(45 12 12)"/>' +
    '<circle cx="10.3" cy="10.3" r="0.9" data-fill="1"/><circle cx="13.7" cy="13.7" r="0.9" data-fill="1"/>' +
    '<circle cx="13.7" cy="10.3" r="0.9" data-fill="1"/><circle cx="10.3" cy="13.7" r="0.9" data-fill="1"/>',
  // Command — rank chevrons
  captain: '<path d="M5 7.5 12 11.5 19 7.5"/><path d="M5 12.5 12 16.5 19 12.5"/>',
  // Scribe — pen
  quill:
    '<path d="M4.5 19.5H8.5L19 9A2.1 2.1 0 0 0 16 6L5.5 16.5Z"/>' +
    '<line x1="13.6" y1="8.6" x2="16.6" y2="11.6"/>',
};

/** Returns an SVG string of the role icon for a soldier, stroked in `color`. */
export function roleIcon(id: string, color: string): string {
  const glyph = (GLYPH[id] ?? '<circle cx="12" cy="12" r="7"/>').replace(
    /data-fill="1"/g,
    `fill="${color}" stroke="none"`,
  );
  return (
    `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.9" ` +
    `stroke-linecap="round" stroke-linejoin="round" role="img">${glyph}</svg>`
  );
}
