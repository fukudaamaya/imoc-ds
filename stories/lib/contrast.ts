// WCAG 2.x relative luminance / contrast ratio — computed from resolved RGB, independent
// of whatever ratio a token's Figma description claims, so the Accessibility page is a
// check on the source data rather than a re-print of it.

function parseColor(value: string): { r: number; g: number; b: number; a: number } {
  if (value.startsWith('rgba')) {
    const [r, g, b, a] = value
      .replace(/rgba?\(|\)/g, '')
      .split(',')
      .map((n) => parseFloat(n));
    return { r, g, b, a };
  }
  const hex = value.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

function srgbToLinear(c: number): number {
  const cs = c / 255;
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

/** Flattens `fg` over `bg` first (alpha compositing) so translucent tokens (e.g. overlay) are still measurable. */
function compositeOver(fg: { r: number; g: number; b: number; a: number }, bg: { r: number; g: number; b: number }) {
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
  };
}

export function relativeLuminance(hexOrRgba: string, backdropHex = '#ffffff'): number {
  const raw = parseColor(hexOrRgba);
  const backdrop = parseColor(backdropHex);
  const { r, g, b } = raw.a < 1 ? compositeOver(raw, backdrop) : raw;
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b, a);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}

export function passAA(ratio: number, isLarge = false): boolean {
  return ratio >= (isLarge ? 3 : 4.5);
}

export function passAAA(ratio: number, isLarge = false): boolean {
  return ratio >= (isLarge ? 4.5 : 7);
}

// UI-component contrast (non-text, e.g. borders, focus rings) only needs 3:1 (WCAG 1.4.11).
export function passUiNonText(ratio: number): boolean {
  return ratio >= 3;
}
