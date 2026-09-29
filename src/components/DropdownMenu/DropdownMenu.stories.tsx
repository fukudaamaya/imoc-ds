import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DropdownMenu, DropdownItem } from './DropdownMenu';
import { CONDITIONS, SERVICES } from './menuContent';
import { componentDocsPage } from '../../../stories/components/ComponentDocsPage';

const meta = {
  title: 'Components/Dropdown Menu',
  component: DropdownMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { page: componentDocsPage('dropdown-menu', { setIds: ['9209:2388', '9241:15329', '9241:15421'] }) },
  },
  args: { variant: 'simple', items: CONDITIONS, columns: 2 },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['simple', 'mega'],
      description: '`simple` is a single list (Conditions). `mega` splits items into columns, usually with descriptions (Services).',
      table: { type: { summary: "'simple' | 'mega'" }, defaultValue: { summary: 'simple' } },
    },
    items: {
      control: 'object',
      description: 'Menu rows. `description` adds the secondary line (Figma: Description=With).',
      table: { type: { summary: '{ title: string; description?: string; href?: string }[]' } },
    },
    columns: {
      control: { type: 'number', min: 1, max: 3 },
      description: 'Columns in the mega menu. Figma shows 2.',
      table: { defaultValue: { summary: '2' } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Simple: Story = {
  tags: ['!dev'],
  parameters: { docs: { description: { story: 'The Conditions menu — a single list of titles.' } } },
  args: { variant: 'simple', items: CONDITIONS },
};

export const Mega: Story = {
  tags: ['!dev'],
  parameters: { docs: { description: { story: 'The Services menu — two columns, each item with a description.' } } },
  args: { variant: 'mega', items: SERVICES, columns: 2 },
};

export const Item: Story = {
  name: 'Dropdown item',
  tags: ['!dev'],
  parameters: {
    docs: { description: { story: 'A single row, with and without a description. Hover or tab to it to see the hover and focus states.' } },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', maxWidth: 640 }}>
      <div style={{ width: 300 }}>
        <DropdownItem title="Autoimmune Disease" />
      </div>
      <div style={{ width: 300 }}>
        <DropdownItem title="IV & Infusion Therapies" description="IV nutrient, Glutathione, NAD+, iron" />
      </div>
    </div>
  ),
};
