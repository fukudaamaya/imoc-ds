import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
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

function ColorsPage() {
  const [tab, setTab] = useState<'primitives' | 'semantic'>('primitives');
  const primitives = groupBy(flatPrimitiveColors(), (c) => c.group);
  const semantics = groupBy(flatSemanticColors(), (c) => c.group);

  return (
    <div className="doc-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="doc-h1">Colors</h1>
          <p className="doc-lede">
            Primitives are the raw scales — reach for them only when building a new semantic token or an
            illustration fill. Semantic tokens (text/surface/border) are what product code should actually use;
            each one aliases back to a primitive step and carries the reasoning for that choice.
          </p>
        </div>
        <FigmaBadge />
      </div>

      <p className="doc-section-note" style={{ marginTop: -12 }}>
        Color does not vary between Mobile and Web — the Colour collection has a single "Clinic" mode. The
        Mobile/Web toolbar toggle above won't change anything on this page; it affects Typography and Spacing.
      </p>

      <div className="doc-tabs">
        <button className="doc-tab" data-active={tab === 'primitives'} onClick={() => setTab('primitives')}>
          Primitives
        </button>
        <button className="doc-tab" data-active={tab === 'semantic'} onClick={() => setTab('semantic')}>
          Semantic
        </button>
      </div>

      {tab === 'primitives' &&
        PRIMITIVE_GROUP_ORDER.filter((g) => primitives[g]).map((group) => (
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

      {tab === 'semantic' &&
        SEMANTIC_GROUP_ORDER.filter((g) => semantics[g]).map((group) => (
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

const meta: Meta<typeof ColorsPage> = {
  title: 'Colors',
  component: ColorsPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ColorsPage>;

export const AllColors: Story = {};
