import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Breadcrumb } from './Breadcrumb';
import { componentDocsPage } from '../../../stories/components/ComponentDocsPage';

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  parameters: { layout: 'padded', docs: { page: componentDocsPage('breadcrumb', { setIds: ['9241:14215', '9241:3759'] }) } },
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Services', href: '#' },
      { label: 'Ozone Therapy' },
    ],
  },
  argTypes: {
    items: {
      control: 'object',
      description: 'Trail from the top level to the current page. The last item is the current page (`aria-current="page"`) and is not a link.',
      table: { type: { summary: '{ label: string; href?: string }[]' } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Lengths: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      description: {
        story: 'The Figma set covers 2, 3 and 4 items. Hover a link to see text/link-hover; the current page stays in text/primary.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Breadcrumb items={[{ label: 'Home', href: '#' }, { label: 'Services' }]} />
      <Breadcrumb items={[{ label: 'Home', href: '#' }, { label: 'Services', href: '#' }, { label: 'Ozone Therapy' }]} />
      <Breadcrumb
        items={[
          { label: 'Home', href: '#' },
          { label: 'Services', href: '#' },
          { label: 'Ozone & Blood Therapies', href: '#' },
          { label: 'Ozone Therapy' },
        ]}
      />
    </div>
  ),
};
