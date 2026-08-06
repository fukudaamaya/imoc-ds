import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import './lib/doc-ui.css';
import { flatPrimitiveColors, flatSemanticColors } from './lib/tokens';
import { PrimitiveSwatch, SemanticSwatch } from './components/ColorSwatch';
import { FigmaBadge } from './components/FigmaBadge';

const PRIMITIVE_GROUP_ORDER = ['ocean', 'earth', 'flora', 'neutral', 'success', 'warning', 'error', 'info'];
const SEMANTIC_GROUP_ORDER = ['text', 'surface', 'border'];

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const item of items) {
    const k = keyFn(item);
    out[k] = out[k] || [];
    out[k].push(item);
  }
  return out;
}

function ColorsPrimitivesPage() {
  const primitives = groupBy(flatPrimitiveColors(), (c) => c.group);

  return (
    <div className="doc-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="doc-h1">Color Primitives</h1>
          <p className="doc-lede">
            Raw color values. Reach for these only when building a new semantic token or an illustration fill —
            product code should use a semantic token below instead.
          </p>
        </div>
        <FigmaBadge />
      </div>

      {PRIMITIVE_GROUP_ORDER.filter((g) => primitives[g]).map((group) => (
        <section key={group}>
          <h2 className="doc-section-title" style={{ textTransform: 'capitalize' }}>
            {group}
          </h2>
          <div className="doc-grid doc-color-grid">
            {primitives[group].map((c) => (
              <PrimitiveSwatch key={c.name} group={c.group} step={c.step} token={c.token} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ColorsSemanticPage() {
  const semantics = groupBy(flatSemanticColors(), (c) => c.group);

  return (
    <div className="doc-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="doc-h1">Semantic Colors</h1>
          <p className="doc-lede">
            text/surface/border tokens — what product code should actually use. Each one aliases back to a
            primitive step and carries the reasoning for that choice.
          </p>
        </div>
        <FigmaBadge />
      </div>

      <p className="doc-section-note" style={{ marginTop: -12 }}>
        Color does not vary between Mobile and Web — the Colour collection has a single "Clinic" mode. The
        Mobile/Web toolbar toggle above won't change anything on this page; it affects Typography and Spacing.
      </p>

      {SEMANTIC_GROUP_ORDER.filter((g) => semantics[g]).map((group) => (
        <section key={group}>
          <h2 className="doc-section-title" style={{ textTransform: 'capitalize' }}>
            {group}
          </h2>
          <div className="doc-grid doc-color-grid">
            {semantics[group].map((c) => (
              <SemanticSwatch key={c.name} group={c.group} tokenKey={c.key} token={c.token} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const meta: Meta = {
  title: 'Design System/Colors',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Raw color values and the semantic tokens built on top of them. Always reference semantic tokens — never a primitive — from product code.',
      },
    },
  },
};

export default meta;

export const Primitives: StoryObj = { render: () => <ColorsPrimitivesPage /> };
export const Semantic: StoryObj = { render: () => <ColorsSemanticPage /> };
