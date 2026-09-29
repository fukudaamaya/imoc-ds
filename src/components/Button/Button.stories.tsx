import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from './Button';
import { ICON_NAMES } from '../../icons/Icon';
import { componentDocsPage } from '../../../stories/components/ComponentDocsPage';

// 'none' stands in for "no icon" — Storybook selects can't hold undefined as an option.
const iconControl = (description: string) => ({
  control: 'select' as const,
  options: ['none', ...ICON_NAMES],
  mapping: { none: undefined },
  description,
  table: { type: { summary: 'IconName' } },
});

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { page: componentDocsPage('button') },
  },
  args: {
    children: 'Book an appointment',
    variant: 'primary',
    iconTrailing: 'arrow-right',
    loading: false,
    disabled: false,
  },
  argTypes: {
    children: { control: 'text', description: 'Button label.', table: { type: { summary: 'ReactNode' } } },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'plain'],
      description: 'Visual weight. Figma: Variant.',
      table: { type: { summary: "'primary' | 'secondary' | 'plain'" }, defaultValue: { summary: 'primary' } },
    },
    iconLeading: iconControl('Icon before the label. Figma: Icon leading.'),
    iconTrailing: iconControl('Icon after the label. Figma: Icon trailing.'),
    loading: {
      description: 'Swaps the icons for the loader and blocks clicks while an action is in progress. Figma: State=Loading.',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      description: 'Disables the button. Figma: State=Disabled.',
      table: { defaultValue: { summary: 'false' } },
    },
    href: {
      control: 'text',
      description: 'Renders the button as a link (`<a>`) when set.',
      table: { type: { summary: 'string' } },
    },
    onClick: { action: 'clicked', table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sidebar shows Docs + Playground only; the example stories below are tagged '!dev' so
// they render on the Docs page without cluttering the sidebar (same as Nord Health).

export const Playground: Story = {};

const row: React.CSSProperties = { display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' };

export const Variants: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      description: {
        story:
          'Primary is the default for most actions. Secondary and plain carry less visual weight — plain reads like a link and suits less important or less common actions.',
      },
    },
  },
  render: () => (
    <div style={row}>
      <Button variant="primary" iconTrailing="arrow-right">Book an appointment</Button>
      <Button variant="secondary" iconTrailing="arrow-right">Meet the doctor</Button>
      <Button variant="plain" iconTrailing="arrow-right">View all treatments</Button>
    </div>
  ),
};

export const States: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      description: {
        story: 'Hover and focus are interaction states — hover a button or tab to it to see them. Loading swaps the icons for the loader and keeps the label.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(['primary', 'secondary', 'plain'] as const).map((variant) => (
        <div style={row} key={variant}>
          <Button variant={variant} iconTrailing="arrow-right">Default</Button>
          <Button variant={variant} iconTrailing="arrow-right" disabled>Disabled</Button>
          <Button variant={variant} loading>Loading</Button>
        </div>
      ))}
    </div>
  ),
};

export const WithIcons: Story = {
  name: 'With icons',
  tags: ['!dev'],
  render: () => (
    <div style={row}>
      <Button iconTrailing="arrow-right">Start intake</Button>
      <Button variant="secondary" iconLeading="arrow-left">Back</Button>
      <Button variant="plain" iconTrailing="arrow-right">Explore</Button>
      <Button>No icon</Button>
    </div>
  ),
};

export const AsLink: Story = {
  name: 'As link',
  tags: ['!dev'],
  parameters: {
    docs: {
      description: {
        story: 'Pass `href` for navigation — it renders an `<a>` with identical styling. Use a link when the action takes the patient to another page; use a button when it does something on this one.',
      },
    },
  },
  render: () => (
    <div style={row}>
      <Button href="#" iconTrailing="arrow-right">Book an appointment</Button>
      <Button href="#" variant="secondary">Meet the doctor</Button>
      <Button href="#" variant="plain" disabled>Unavailable</Button>
    </div>
  ),
};
