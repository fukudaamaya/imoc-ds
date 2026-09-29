import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SectionHeader, PageHeader } from './Headers';
import { componentDocsPage } from '../../../stories/components/ComponentDocsPage';

// One docs page for both header components, like the Figma Headers page. The Playground
// drives Section Header; Page Header has its own example below.

const meta = {
  title: 'Components/Headers',
  component: SectionHeader,
  tags: ['autodocs'],
  parameters: { layout: 'padded', docs: { page: componentDocsPage('headers') } },
  // Figma frames are 640px wide; the headers themselves fill their container.
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
  args: {
    overline: 'Section Overline',
    title: 'Section headline goes here',
    subheader: 'A short supporting line that adds context under the headline.',
    align: 'left',
    as: 'h2',
  },
  argTypes: {
    title: { control: 'text', description: 'Headline (type/heading-2).', table: { type: { summary: 'ReactNode' } } },
    overline: { control: 'text', description: 'Eyebrow above the headline (type/overline, text/brand). Figma: Overline.', table: { type: { summary: 'ReactNode' } } },
    subheader: { control: 'text', description: 'Supporting line (type/body-large, text/secondary). Figma: Subheader.', table: { type: { summary: 'ReactNode' } } },
    align: { control: 'inline-radio', options: ['left', 'center'], description: 'Figma: Align.', table: { type: { summary: "'left' | 'center'" }, defaultValue: { summary: 'left' } } },
    as: { control: 'inline-radio', options: ['h1', 'h2', 'h3'], description: 'HTML heading level. Styling stays heading-2.', table: { type: { summary: "'h1' | 'h2' | 'h3'" }, defaultValue: { summary: 'h2' } } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const SectionHeaderOptions: Story = {
  name: 'Section header',
  tags: ['!dev'],
  parameters: {
    docs: { description: { story: 'Overline and subheader are both optional; align left (default) or centre.' } },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 48 }}>
      <SectionHeader overline="Section Overline" title="Section headline goes here" subheader="A short supporting line that adds context under the headline." />
      <SectionHeader title="Section headline goes here" />
      <SectionHeader align="center" title="Meet The Doctor" subheader="Improving the Quality of Patients’ Lives Since 1997" />
    </div>
  ),
};

export const PageHeaderExample: Story = {
  name: 'Page header',
  tags: ['!dev'],
  parameters: {
    docs: {
      description: {
        story: 'Always shows the brandmark and an H1. Include the breadcrumb on pages 3+ levels deep; omit it on flat top-level pages.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 64 }}>
      <PageHeader
        breadcrumb={[{ label: 'Home', href: '#' }, { label: 'Services', href: '#' }, { label: 'Ozone Therapy' }]}
        title="Ozone Therapy"
        description="A short description of what this page covers goes here."
      />
      <PageHeader title="About" />
    </div>
  ),
};
