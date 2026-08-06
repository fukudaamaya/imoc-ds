import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import './lib/doc-ui.css';
import { dimensions, dartDimensionRef } from './lib/tokens';
import { usePlatform } from './lib/usePlatform';
import { CopyButton } from './components/CopyButton';
import { FigmaBadge } from './components/FigmaBadge';

const MAX_BAR_REF = 100; // slightly above the largest semantic spacing value (96px), for headroom

// Fixed order (by Web-mode value, ascending) so rows don't reshuffle when the Mobile/Web
// toolbar toggle changes which values are displayed — only the bar width and px label move.
const SPACING_ORDER = Object.keys(dimensions.spacing).sort(
  (a, b) => (dimensions.spacing[a].web as number) - (dimensions.spacing[b].web as number),
);

function RulerRow({
  name,
  value,
  description,
  cssVar,
  dartRef,
}: {
  name: string;
  value: number;
  description: string;
  cssVar: string;
  dartRef: string;
}) {
  const pct = Math.min(100, (value / MAX_BAR_REF) * 100);
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="ruler-row">
        <span className="ruler-label">{name}</span>
        <div style={{ flex: 1, background: 'var(--imoc-surface-page)', borderRadius: 2 }}>
          <div className="ruler-bar" style={{ width: `${pct}%` }} />
        </div>
        <span className="ruler-value">{value}px</span>
      </div>
      <p className="swatch-desc" style={{ marginLeft: 236 }}>
        {description}
      </p>
      <div className="action-row" style={{ marginLeft: 236 }}>
        <CopyButton kind="css" label={cssVar} value={`var(${cssVar})`} />
        <CopyButton kind="dart" label="Dart" value={dartRef} />
      </div>
    </div>
  );
}

function SpacingPage() {
  const platform = usePlatform();

  return (
    <div className="doc-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="doc-h1">Spacing, Radius &amp; Layout</h1>
          <p className="doc-lede">
            Semantic spacing, radius, and layout tokens — reach for these directly. The raw{' '}
            <code>space/*</code> scale underneath is implementation detail; it isn't shown here. Toggle
            Mobile/Web above to see values shift.
          </p>
        </div>
        <FigmaBadge />
      </div>

      <h2 className="doc-section-title">Spacing — {platform} mode</h2>
      {SPACING_ORDER.map((key) => {
        const t = dimensions.spacing[key];
        return (
          <RulerRow
            key={key}
            name={`spacing/${key}`}
            value={t[platform] as number}
            description={t.description}
            cssVar={t.figma.codeSyntax}
            dartRef={dartDimensionRef('spacing', 'semantic', key)}
          />
        );
      })}

      <h2 className="doc-section-title">Corner radius</h2>
      <p className="doc-section-note">Identical on Mobile and Web.</p>
      <div className="radius-demo-grid">
        {Object.entries(dimensions.radius).map(([key, t]) => (
          <div className="radius-demo" key={key}>
            <div className="radius-box" style={{ borderRadius: `${t.web}px` }} />
            <div style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace' }}>radius/{key}</div>
            <div style={{ fontSize: 11, color: 'var(--imoc-text-tertiary)' }}>{t.web}px</div>
            <div className="action-row">
              <CopyButton kind="css" label={t.figma.codeSyntax} value={`var(${t.figma.codeSyntax})`} />
              <CopyButton kind="dart" label="Dart" value={dartDimensionRef('radius', 'semantic', key)} />
            </div>
          </div>
        ))}
      </div>

      <h2 className="doc-section-title">Layout — {platform} mode</h2>
      <p className="doc-section-note">
        Nested boxes show how max-width-container, max-width-text, and max-width-narrow relate on a real page.
        "Uncapped" means the viewport itself is the constraint (typical on mobile).
      </p>
      <LayoutDiagram platform={platform} />

      <div className="doc-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', marginTop: 16 }}>
        {Object.entries(dimensions.layout).map(([key, t]) => (
          <div className="doc-card" key={key}>
            <div style={{ fontSize: 13, fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>layout/{key}</div>
            <div style={{ fontSize: 18, fontWeight: 700, margin: '4px 0' }}>
              {t[platform] === 9999 ? 'Uncapped' : `${t[platform]}px`}
            </div>
            <p className="swatch-desc">{t.description}</p>
            <div className="action-row">
              <CopyButton kind="css" label={t.figma.codeSyntax} value={`var(${t.figma.codeSyntax})`} />
              <CopyButton kind="dart" label="Dart" value={dartDimensionRef('layout', null, key)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LayoutDiagram({ platform }: { platform: 'web' | 'mobile' }) {
  const scale = 0.28; // px -> diagram px, keeps a 1440 container inside the doc column
  const container = dimensions.layout['max-width-container'][platform] as number;
  const text = dimensions.layout['max-width-text'][platform] as number;
  const narrow = dimensions.layout['max-width-narrow'][platform] as number;
  const header = dimensions.layout['header-height'][platform] as number;

  const cap = (v: number) => (v === 9999 ? 420 : Math.max(60, v * scale));

  return (
    <div style={{ background: 'var(--imoc-surface-page)', borderRadius: 'var(--imoc-radius-medium)', padding: 20 }}>
      <div
        style={{
          height: header * 0.6,
          background: 'var(--imoc-surface-inverse)',
          color: 'var(--imoc-text-inverse)',
          fontSize: 11,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 12,
          marginBottom: 8,
          borderRadius: 4,
          width: cap(container),
        }}
      >
        header {header}px
      </div>
      <div
        style={{
          width: cap(container),
          border: '1px dashed var(--imoc-border-brand)',
          borderRadius: 4,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 10, color: 'var(--imoc-text-brand)' }}>
          max-width-container {container === 9999 ? '(uncapped)' : `${container}px`}
        </span>
        <div
          style={{
            width: cap(text),
            border: '1px dashed var(--imoc-border-accent)',
            borderRadius: 4,
            padding: 10,
          }}
        >
          <span style={{ fontSize: 10, color: 'var(--imoc-text-accent)' }}>
            max-width-text {text === 9999 ? '(uncapped)' : `${text}px`}
          </span>
          <div
            style={{
              width: cap(narrow),
              marginTop: 8,
              border: '1px dashed var(--imoc-border-success)',
              borderRadius: 4,
              padding: 8,
              fontSize: 10,
              color: 'var(--imoc-text-success)',
            }}
          >
            max-width-narrow {narrow === 9999 ? '(uncapped)' : `${narrow}px`}
          </div>
        </div>
      </div>
    </div>
  );
}

const meta: Meta<typeof SpacingPage> = {
  title: 'Design System/Spacing',
  component: SpacingPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Semantic spacing, radius, and layout tokens — the raw scale underneath is implementation detail.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SpacingPage>;

export const All: Story = {};
