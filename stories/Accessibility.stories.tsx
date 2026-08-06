import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import './lib/doc-ui.css';
import { semanticColor } from './lib/tokens';
import { contrastRatio, formatRatio, passAA, passAAA, passUiNonText } from './lib/contrast';
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
  { fg: ['border', 'subtle'], bg: ['surface', 'background'], context: 'Dividers, table rules (decorative, exempt)', kind: 'non-text' },
  { fg: ['border', 'default'], bg: ['surface', 'card'], context: 'Card outlines', kind: 'non-text' },
  { fg: ['border', 'strong'], bg: ['surface', 'card'], context: 'Input / checkbox / radio outlines', kind: 'non-text' },
  { fg: ['border', 'focus'], bg: ['surface', 'background'], context: 'Keyboard focus ring', kind: 'non-text' },
  { fg: ['border', 'brand'], bg: ['surface', 'background'], context: 'Selected filter chip, active tab', kind: 'non-text' },
  { fg: ['border', 'accent'], bg: ['surface', 'card'], context: 'Pull-quote rule, card dividers', kind: 'non-text' },
  { fg: ['border', 'success'], bg: ['surface', 'background'], context: 'Confirmation panel rule', kind: 'non-text' },
  { fg: ['border', 'warning'], bg: ['surface', 'background'], context: 'Advisory panel rule', kind: 'non-text' },
  { fg: ['border', 'error'], bg: ['surface', 'background'], context: 'Failed input outline', kind: 'non-text' },
  { fg: ['border', 'info'], bg: ['surface', 'background'], context: 'Informational callout rule', kind: 'non-text' },
];

function tokenName([group, key]: [string, string]) {
  return `${group}/${key}`;
}

function AccessibilityPage() {
  const [filter, setFilter] = React.useState<'all' | 'text' | 'non-text' | 'fail'>('all');

  const rows = PAIRINGS.map((p) => {
    const fgToken = semanticColor[p.fg[0]][p.fg[1]];
    const bgToken = semanticColor[p.bg[0]][p.bg[1]];
    const ratio = contrastRatio(fgToken.value, bgToken.value);
    const aa = p.kind === 'text' ? passAA(ratio) : passUiNonText(ratio);
    const aaa = p.kind === 'text' ? passAAA(ratio) : null;
    return { ...p, fgToken, bgToken, ratio, aa, aaa };
  });

  const filtered = rows.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'fail') return !r.aa;
    return r.kind === filter;
  });

  return (
    <div className="doc-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="doc-h1">Accessibility</h1>
          <p className="doc-lede">
            WCAG 2.x contrast, computed from the actual resolved RGB values — not copied from the description
            text — for every foreground/background pairing the system actually uses. Text pairs are checked
            against 4.5:1 (AA) / 7:1 (AAA); borders and other non-text UI against the 3:1 non-text threshold
            (WCAG 1.4.11).
          </p>
        </div>
        <FigmaBadge />
      </div>

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
              <th>AA</th>
              <th>AAA</th>
              <th>Intended for</th>
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
                      fontSize: 11,
                      fontWeight: 700,
                      color: r.fgToken.value,
                      border: r.kind === 'non-text' ? `2px solid ${r.fgToken.value}` : '1px solid var(--imoc-border-subtle)',
                    }}
                  >
                    {r.kind === 'text' ? 'Ag' : ''}
                  </div>
                </td>
                <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{tokenName(r.fg)}</td>
                <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{tokenName(r.bg)}</td>
                <td style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>{formatRatio(r.ratio)}</td>
                <td>
                  <span className={`pass-badge ${r.aa ? 'pass' : 'fail'}`}>{r.aa ? 'PASS' : 'FAIL'}</span>
                </td>
                <td>
                  {r.aaa === null ? (
                    <span style={{ color: 'var(--imoc-text-tertiary)', fontSize: 12 }}>n/a</span>
                  ) : (
                    <span className={`pass-badge ${r.aaa ? 'pass' : 'fail'}`}>{r.aaa ? 'PASS' : 'FAIL'}</span>
                  )}
                </td>
                <td style={{ fontSize: 13, color: 'var(--imoc-text-secondary)' }}>{r.context}</td>
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
