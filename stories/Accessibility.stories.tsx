import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import './lib/doc-ui.css';
import { semanticColor } from './lib/tokens';
import { contrastRatio, formatRatio, tierNormalText, tierLargeText, tierIconsUI, type Tier } from './lib/contrast';
import { FigmaBadge } from './components/FigmaBadge';

interface Pairing {
  fg: [string, string];
  bg: [string, string];
  context: string;
  kind: 'text' | 'non-text';
}

// Curated from the "used for" language in each token's own Figma description — not every
// mathematically possible fg/bg combination, just the ones the system actually pairs.
const PAIRINGS: Pairing[] = [
  { fg: ['text', 'primary'], bg: ['surface', 'background'], context: 'Body copy on the page', kind: 'text' },
  { fg: ['text', 'primary'], bg: ['surface', 'card'], context: 'Body copy inside cards', kind: 'text' },
  { fg: ['text', 'secondary'], bg: ['surface', 'background'], context: 'Metadata, breadcrumbs', kind: 'text' },
  { fg: ['text', 'secondary'], bg: ['surface', 'card'], context: 'Card subtitles', kind: 'text' },
  { fg: ['text', 'tertiary'], bg: ['surface', 'background'], context: 'Footnotes', kind: 'text' },
  { fg: ['text', 'tertiary'], bg: ['surface', 'card'], context: 'Supporting detail in cards', kind: 'text' },
  { fg: ['text', 'disabled'], bg: ['surface', 'disabled'], context: 'Disabled button label (intentional AA exemption)', kind: 'text' },
  { fg: ['text', 'inverse'], bg: ['surface', 'inverse'], context: 'Footer / longevity section copy', kind: 'text' },
  { fg: ['text', 'link'], bg: ['surface', 'background'], context: 'Inline links on the page', kind: 'text' },
  { fg: ['text', 'link'], bg: ['surface', 'card'], context: 'Inline links inside cards', kind: 'text' },
  { fg: ['text', 'link-hover'], bg: ['surface', 'background'], context: 'Link hover/focus state', kind: 'text' },
  { fg: ['text', 'link-inverse'], bg: ['surface', 'inverse'], context: 'Links in the footer', kind: 'text' },
  { fg: ['text', 'brand'], bg: ['surface', 'background'], context: 'Ocean headings, eyebrow labels', kind: 'text' },
  { fg: ['text', 'accent'], bg: ['surface', 'background'], context: 'Earth editorial headings, pull quotes', kind: 'text' },
  { fg: ['text', 'on-fill'], bg: ['surface', 'action'], context: 'Primary button label', kind: 'text' },
  { fg: ['text', 'on-fill'], bg: ['surface', 'action-hover'], context: 'Primary button label, hover', kind: 'text' },
  { fg: ['text', 'on-fill'], bg: ['surface', 'brand'], context: 'Headings on ocean feature panels', kind: 'text' },
  { fg: ['text', 'on-fill'], bg: ['surface', 'accent'], context: 'Copy on earth editorial blocks', kind: 'text' },
  { fg: ['text', 'success'], bg: ['surface', 'success'], context: 'Booking-confirmed copy', kind: 'text' },
  { fg: ['text', 'warning'], bg: ['surface', 'warning'], context: 'Advisory copy', kind: 'text' },
  { fg: ['text', 'error'], bg: ['surface', 'error'], context: 'Validation messages', kind: 'text' },
  { fg: ['text', 'info'], bg: ['surface', 'info'], context: 'Explanatory callouts', kind: 'text' },
  { fg: ['text', 'placeholder'], bg: ['surface', 'input'], context: 'Empty form-field placeholder', kind: 'text' },
  { fg: ['border', 'strong'], bg: ['surface', 'card'], context: 'Input / checkbox / radio outlines', kind: 'non-text' },
  { fg: ['border', 'focus'], bg: ['surface', 'background'], context: 'Keyboard focus ring', kind: 'non-text' },
  { fg: ['border', 'brand'], bg: ['surface', 'background'], context: 'Selected filter chip, active tab', kind: 'non-text' },
  { fg: ['border', 'success'], bg: ['surface', 'background'], context: 'Confirmation panel rule', kind: 'non-text' },
  { fg: ['border', 'warning'], bg: ['surface', 'background'], context: 'Advisory panel rule', kind: 'non-text' },
  { fg: ['border', 'error'], bg: ['surface', 'background'], context: 'Failed input outline', kind: 'non-text' },
  { fg: ['border', 'info'], bg: ['surface', 'background'], context: 'Informational callout rule', kind: 'non-text' },
];

function tokenName([group, key]: [string, string]) {
  return `${group}/${key}`;
}

function TierBadge({ tier }: { tier: Tier }) {
  const label = tier === 'FAIL' ? 'Fail' : tier;
  return <span className={`tier-badge tier-${tier.toLowerCase()}`}>{label}</span>;
}

function NotApplicable() {
  return <span style={{ color: 'var(--imoc-text-tertiary)', fontSize: 12, fontWeight: 500 }}>—</span>;
}

function AccessibilityPage() {
  const [filter, setFilter] = React.useState<'all' | 'text' | 'non-text' | 'fail'>('all');

  const rows = PAIRINGS.map((p) => {
    const fgToken = semanticColor[p.fg[0]][p.fg[1]];
    const bgToken = semanticColor[p.bg[0]][p.bg[1]];
    const ratio = contrastRatio(fgToken.value, bgToken.value);
    const normalText = p.kind === 'text' ? tierNormalText(ratio) : null;
    const largeText = p.kind === 'text' ? tierLargeText(ratio) : null;
    const iconsUI = p.kind === 'non-text' ? tierIconsUI(ratio) : null;
    const primaryTier = p.kind === 'text' ? normalText! : iconsUI!;
    return { ...p, fgToken, bgToken, ratio, normalText, largeText, iconsUI, primaryTier };
  });

  const filtered = rows.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'fail') return r.primaryTier === 'FAIL';
    return r.kind === filter;
  });

  return (
    <div className="doc-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="doc-h1">Accessibility</h1>
          <p className="doc-lede">
            WCAG 2.x contrast, computed from the actual resolved RGB values — not copied from the description
            text — for every foreground/background pairing the system actually uses.
          </p>
        </div>
        <FigmaBadge />
      </div>

      <p className="doc-section-note" style={{ marginTop: -12, maxWidth: 640 }}>
        <strong>Normal Text</strong> and <strong>Large Text</strong> (18px+, or 14px+ bold) come from WCAG 1.4.3 —
        AA/AAA are real conformance levels there. <strong>Icons / UI</strong> comes from WCAG 1.4.11, which
        defines only a single AA bar (3:1) and no stricter tier — the "AAA" shown there is an informal
        convention (≥4.5:1, borrowed from the Large Text AAA bar) meaning "extra headroom," not an official
        WCAG pass level. Purely decorative pairings (dividers, card outlines, the pull-quote rule) aren't
        listed at all — WCAG doesn't regulate them, so they're not part of this compliance checklist.
      </p>

      <div className="doc-tabs">
        {(['all', 'text', 'non-text', 'fail'] as const).map((f) => (
          <button key={f} className="doc-tab" data-active={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All pairings' : f === 'text' ? 'Text' : f === 'non-text' ? 'Non-text UI' : 'Failing only'}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="doc-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Foreground</th>
              <th>Background</th>
              <th>Ratio</th>
              <th>Normal Text</th>
              <th>Large Text (18px+)</th>
              <th>Icons / UI</th>
              <th>Context</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i}>
                <td>
                  <div
                    style={{
                      width: 56,
                      height: 32,
                      borderRadius: 6,
                      background: r.bgToken.value,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: r.fgToken.value,
                      border: r.kind === 'non-text' ? `2px solid ${r.fgToken.value}` : '1px solid var(--imoc-border-subtle)',
                    }}
                  >
                    {r.kind === 'text' ? 'Ag' : ''}
                  </div>
                </td>
                <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 500 }}>{tokenName(r.fg)}</td>
                <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 500 }}>{tokenName(r.bg)}</td>
                <td style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>{formatRatio(r.ratio)}</td>
                <td>{r.normalText ? <TierBadge tier={r.normalText} /> : <NotApplicable />}</td>
                <td>{r.largeText ? <TierBadge tier={r.largeText} /> : <NotApplicable />}</td>
                <td>{r.iconsUI ? <TierBadge tier={r.iconsUI} /> : <NotApplicable />}</td>
                <td style={{ color: 'var(--imoc-text-secondary)' }}>{r.context}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const meta: Meta<typeof AccessibilityPage> = {
  title: 'Design System/Accessibility',
  component: AccessibilityPage,
  // This page is already a full specimen page — the auto-generated Docs page would just
  // duplicate it (primary story inline, then again under a "Stories" section).
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'WCAG 2.x contrast, computed from resolved RGB, for every foreground/background pairing the system actually uses.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AccessibilityPage>;

export const ContrastRatios: Story = { name: 'Contrast Ratios' };
