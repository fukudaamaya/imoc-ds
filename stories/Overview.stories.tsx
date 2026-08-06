import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import './lib/doc-ui.css';
import { primitives, semanticColor, dimensions, FIGMA_FILE_URL } from './lib/tokens';
import { FigmaBadge } from './components/FigmaBadge';

function count(obj: Record<string, Record<string, unknown>>): number {
  return Object.values(obj).reduce((sum, group) => sum + Object.keys(group).length, 0);
}

function OverviewPage() {
  const primitiveColorCount = count(primitives.color);
  const semanticColorCount = count(semanticColor);
  const typeStyleCount = Object.keys(dimensions.typography).length;
  const spacingCount = Object.keys(dimensions.spacing).length + Object.keys(primitives.spacing).length;
  const radiusCount = Object.keys(dimensions.radius).length;
  const layoutCount = Object.keys(dimensions.layout).length;

  const stat = (label: string, value: number | string) => (
    <div className="doc-card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--imoc-text-brand)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--imoc-text-secondary)', marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <div className="doc-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="doc-h1">IMOC Design System</h1>
          <p className="doc-lede">
            Every token in this file, synced from Figma variables and generated into CSS custom properties and
            Flutter Dart code by Style Dictionary. Use the toolbar above to switch between Mobile and Web
            dimension values.
          </p>
        </div>
        <FigmaBadge href={FIGMA_FILE_URL} />
      </div>

      <div className="doc-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', marginBottom: 32 }}>
        {stat('Primitive colors', primitiveColorCount)}
        {stat('Semantic colors', semanticColorCount)}
        {stat('Type styles', typeStyleCount)}
        {stat('Spacing tokens', spacingCount)}
        {stat('Radius tokens', radiusCount)}
        {stat('Layout tokens', layoutCount)}
      </div>

      <h2 className="doc-section-title">Collections</h2>
      <div className="doc-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <div className="doc-card">
          <h3 style={{ margin: '0 0 6px' }}>Primitives</h3>
          <p className="swatch-desc">
            Raw scales — color ramps, spacing steps, radius steps, type families. One mode ("Value"). Not for
            direct use in product code.
          </p>
        </div>
        <div className="doc-card">
          <h3 style={{ margin: '0 0 6px' }}>Colour</h3>
          <p className="swatch-desc">
            Semantic text/surface/border tokens, aliased to Primitives. One mode ("Clinic") — color doesn't vary
            by platform in this system.
          </p>
        </div>
        <div className="doc-card">
          <h3 style={{ margin: '0 0 6px' }}>Dimensions</h3>
          <p className="swatch-desc">
            Type scale, semantic spacing, semantic radius, layout. Two modes — Mobile and Web — which is what
            the toolbar toggle switches.
          </p>
        </div>
      </div>

      <h2 className="doc-section-title">Where to go next</h2>
      <ul style={{ fontSize: 14, lineHeight: 2, color: 'var(--imoc-text-primary)' }}>
        <li>
          <strong>Colors</strong> — primitive ramps and semantic text/surface/border, with alias chains and
          usage guidance
        </li>
        <li>
          <strong>Typography</strong> — all 9 text styles as live specimens
        </li>
        <li>
          <strong>Spacing</strong> — the spacing/radius/layout scale, visualized
        </li>
        <li>
          <strong>Accessibility</strong> — WCAG contrast for every real foreground/background pairing
        </li>
        <li>
          <strong>Changelog</strong> — what changed, last time tokens were synced from Figma
        </li>
      </ul>
    </div>
  );
}

const meta: Meta<typeof OverviewPage> = {
  title: 'Design System/Overview',
  component: OverviewPage,
  // Overview *is* a landing page already — an auto-generated Docs wrapper around it would
  // just duplicate itself, so it opts out of the global `tags: ['autodocs']` in preview.tsx.
  // Note: an empty array does NOT unset an inherited tag (tags merge as a union across
  // preview/meta/story) — the '!' prefix is what actually excludes it.
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof OverviewPage>;

export const Welcome: Story = {};
