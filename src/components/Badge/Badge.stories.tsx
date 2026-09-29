import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Badge } from './Badge';
import { componentDocsPage } from '../../../stories/components/ComponentDocsPage';

const VARIANTS = ['neutral', 'brand', 'accent', 'success', 'warning', 'error', 'info'] as const;

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: { layout: 'padded', docs: { page: componentDocsPage('badge') } },
  args: { children: 'Badge', variant: 'neutral' },
  argTypes: {
    children: { control: 'text', description: 'Badge text.', table: { type: { summary: 'ReactNode' } } },
    variant: {
      control: 'select',
      options: VARIANTS,
      description: 'Colour family, named after the semantic token family it uses. Figma: Type.',
      table: { type: { summary: VARIANTS.map((v) => `'${v}'`).join(' | ') }, defaultValue: { summary: 'neutral' } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      description: {
        story: 'One variant per semantic colour family. Only neutral has a border — the colour types are fill-only.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {VARIANTS.map((v) => (
        <Badge key={v} variant={v}>
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </Badge>
      ))}
    </div>
  ),
};
