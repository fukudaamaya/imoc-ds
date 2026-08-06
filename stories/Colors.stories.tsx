import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import './lib/doc-ui.css';
import { flatPrimitiveColors, flatSemanticColors } from './lib/tokens';
import { PrimitiveSwatch, SemanticSwatch } from './components/ColorSwatch';
import { FigmaBadge } from './components/FigmaBadge';

// neutrals, ocean, earth, flora, then the status ramps in their common color-name order
// (success=green, warning=yellow, error=red, info=blue).
const PRIMITIVE_GROUP_ORDER = ['neutral', 'ocean', 'earth', 'flora', 'success', 'warning', 'error', 'info'];
const SEMANTIC_GROUP_ORDER = ['text', 'surface', 'border'];

// Not sourced from Figma — there's no collection-level description per group there, only
// per-step. Written from what each ramp's own step descriptions actually say (e.g. ocean/600
// literally calls itself "THE BRAND VALUE"; every flora/* step says "unaliased in Clinic").
const PRIMITIVE_GROUP_DESCRIPTIONS: Record<string, string> = {
  neutral: 'Backgrounds, surfaces, text, and structural elements — the minimum-hue, minimum-saturation base every other color sits on top of.',
  ocean: 'The primary brand colour — used for primary actions, links, focus states, and brand headings.',
  earth: 'The secondary brand colour — used for editorial accents, pull quotes, and decorative illustration fills.',
  flora: 'Reserved for a future Supplement product line — not currently aliased to any semantic token in the live Clinic theme.',
  success: 'Confirmation and success states — completed bookings, saved changes, positive feedback.',
  warning: "Advisory and caution states — logistics notices, limited availability, anything that needs attention without being an error.",
  error: 'Errors and validation failures — rejected form fields, failed submissions.',
  info: 'Explanatory, informational callouts — policy notes, eligibility, what-to-bring guidance. Deliberately not ocean, so system status never reads as brand.',
};

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
          {PRIMITIVE_GROUP_DESCRIPTIONS[group] && (
            <p className="doc-section-note" style={{ marginTop: -4 }}>
              {PRIMITIVE_GROUP_DESCRIPTIONS[group]}
            </p>
          )}
          <div className="swatch-list">
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
