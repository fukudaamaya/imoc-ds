import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import './lib/doc-ui.css';
import { flatTypeStyles, dartTypeStyleRef } from './lib/tokens';
import { usePlatform } from './lib/usePlatform';
import { CopyButton } from './components/CopyButton';
import { FigmaBadge } from './components/FigmaBadge';

const SAMPLE: Record<string, string> = {
  display: 'Feel like yourself again',
  'heading-1': 'Hormone Replacement Therapy',
  'heading-2': 'What to expect',
  'heading-3': 'Is this covered by insurance?',
  'body-large': 'Physician-led care for the symptoms your last doctor called normal.',
  'body-medium':
    'Our clinicians review your intake within one business day and reach out to schedule a full consultation.',
  label: 'Book an appointment',
  'body-small': 'Reviewed by Dr. Kinaly · Updated March 2026',
  overline: 'TREATMENT',
};

function css(name: string): string {
  return `font-family: var(--imoc-type-${name}-family);
font-size: var(--imoc-type-${name}-size);
font-weight: var(--imoc-type-${name}-weight);
line-height: var(--imoc-type-${name}-line-height);
letter-spacing: var(--imoc-type-${name}-letter-spacing);`;
}

function TypographyPage() {
  const platform = usePlatform();
  const styles = flatTypeStyles();

  return (
    <div className="doc-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="doc-h1">Typography</h1>
          <p className="doc-lede">
            Nine styles cover the whole system, from hero display type down to overline kickers. Sizes, line
            heights, and tracking shift between Mobile and Web — use the toolbar toggle above to compare. Weight
            and family are constant across platforms.
          </p>
        </div>
        <FigmaBadge />
      </div>

      {styles.map((s) => {
        const size = s.size[platform];
        const weight = s.weight[platform];
        const lineHeight = s.lineHeight[platform];
        const letterSpacing = s.letterSpacing[platform];
        const family = s.family[platform];

        return (
          <div className="type-specimen" key={s.name}>
            <div
              className="font-display"
              style={{
                fontFamily: `${family}, ${s.name.startsWith('overline') || s.name.includes('body') || s.name === 'label' ? "'Satoshi', sans-serif" : "'Fraunces', serif"}`,
                fontSize: size,
                fontWeight: weight,
                lineHeight: `${lineHeight}px`,
                letterSpacing: `${letterSpacing}px`,
                textTransform: s.name === 'overline' ? 'uppercase' : 'none',
                color: 'var(--imoc-text-primary)',
                marginBottom: 16,
                wordBreak: 'break-word',
              }}
            >
              {SAMPLE[s.name]}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontFamily: 'ui-monospace, monospace', color: 'var(--imoc-text-brand)' }}>
                type/{s.name}
              </h3>
              <span style={{ fontSize: 11, color: 'var(--imoc-text-tertiary)', textTransform: 'uppercase' }}>
                {platform} mode
              </span>
            </div>

            <div className="type-meta-grid">
              <div className="type-meta-item">
                <span className="label">Size</span>
                <span className="value">
                  {size}px{' '}
                  <span style={{ color: 'var(--imoc-text-tertiary)', fontWeight: 400 }}>
                    ({platform === 'web' ? s.size.mobile : s.size.web}px {platform === 'web' ? 'mobile' : 'web'})
                  </span>
                </span>
              </div>
              <div className="type-meta-item">
                <span className="label">Weight</span>
                <span className="value">{weight}</span>
              </div>
              <div className="type-meta-item">
                <span className="label">Line height</span>
                <span className="value">{lineHeight}px</span>
              </div>
              <div className="type-meta-item">
                <span className="label">Letter spacing</span>
                <span className="value">{letterSpacing}px</span>
              </div>
              <div className="type-meta-item">
                <span className="label">Family</span>
                <span className="value">{family}</span>
              </div>
            </div>

            <p className="swatch-desc">{s.size.description}</p>

            <div className="action-row">
              <CopyButton label="CSS" value={css(s.name)} />
              <CopyButton label="Dart" value={dartTypeStyleRef(s.name)} />
              <FigmaBadge />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const meta: Meta<typeof TypographyPage> = {
  title: 'Design System/Typography',
  component: TypographyPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Nine styles cover the whole system. Sizes, line heights, and tracking shift between Mobile and Web.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TypographyPage>;

export const AllStyles: Story = { name: 'All Styles' };
