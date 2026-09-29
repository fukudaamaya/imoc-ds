import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { TextField } from './TextField';
import { componentDocsPage } from '../../../stories/components/ComponentDocsPage';

const meta = {
  title: 'Components/Text Field',
  component: TextField,
  tags: ['autodocs'],
  parameters: { layout: 'padded', docs: { page: componentDocsPage('text-field') } },
  // The field fills its container; 340px matches the Figma frame so the preview reads like a form column.
  decorators: [(Story) => <div style={{ maxWidth: 340 }}><Story /></div>],
  args: {
    label: 'Email',
    placeholder: 'jane.smith@gmail.com',
    helperText: 'We’ll use this address to contact you.',
    error: '',
    disabled: false,
    type: 'email',
  },
  argTypes: {
    label: { control: 'text', description: 'Visible label, fixed top-left inside the field.', table: { type: { summary: 'string' } } },
    placeholder: { control: 'text', description: 'Example value shown while the field is empty (text/placeholder).', table: { type: { summary: 'string' } } },
    helperText: { control: 'text', description: 'Supporting text under the field. Figma: Helper text.', table: { type: { summary: 'string' } } },
    error: {
      control: 'text',
      description: 'Validation message. Sets the error state and replaces the helper text. Figma: State=Error + Validation error.',
      table: { type: { summary: 'string' } },
    },
    disabled: { control: 'boolean', description: 'Figma: State=Disabled.', table: { defaultValue: { summary: 'false' } } },
    type: { control: 'select', options: ['text', 'email', 'tel', 'password'], table: { type: { summary: 'string' }, defaultValue: { summary: 'text' } } },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, alignItems: 'start' };

export const States: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      description: {
        story: 'Hover and focus are interaction states — hover a field or click into it to see them.',
      },
    },
  },
  render: () => (
    <div style={grid}>
      <TextField label="Email" type="email" placeholder="jane.smith@gmail.com" />
      <TextField label="First name" defaultValue="Jane" />
      <TextField label="First name" defaultValue="Jane" disabled helperText="Locked after intake submission" />
      <TextField label="First name" defaultValue="J" error="First name must be at least 2 characters" />
    </div>
  ),
};

export const WithHelperText: Story = {
  name: 'With helper text',
  tags: ['!dev'],
  render: () => (
    <div style={grid}>
      <TextField label="Email" type="email" placeholder="jane.smith@gmail.com" helperText="We’ll use this address to contact you." />
      <TextField label="First name" helperText="As it appears on your identification card" />
    </div>
  ),
};
