/** WCAG 2.x contrast helpers, used by tests to guard the token palette. */

const HEX_COLOR = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance of a `#RRGGBB` color. Throws on any other format. */
export function relativeLuminance(hex: string): number {
  const match = HEX_COLOR.exec(hex);
  if (!match) {
    throw new Error(`Expected a #RRGGBB color, got "${hex}"`);
  }
  const [r, g, b] = match.slice(1, 4).map(part => channel(parseInt(part, 16)));
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

/** Contrast ratio between two colors, from 1 to 21. Order does not matter. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
