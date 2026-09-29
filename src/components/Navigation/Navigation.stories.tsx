import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { NavigationDesktop, NavigationMobile, NavLink, type NavigationItem } from './Navigation';
import { CONDITIONS, SERVICES } from '../DropdownMenu/menuContent';
import { componentDocsPage } from '../../../stories/components/ComponentDocsPage';

const ITEMS: NavigationItem[] = [
  { label: 'About', href: '#' },
  { label: 'Conditions', menu: { variant: 'simple', items: CONDITIONS } },
  { label: 'Services', menu: { variant: 'mega', items: SERVICES } },
  { label: 'Testimonials', href: '#' },
  { label: 'Web Store', href: '#' },
];

const meta = {
  title: 'Components/Navigation',
  component: NavigationDesktop,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { page: componentDocsPage('navigation', { setIds: ['9241:14764', '9241:15211', '9243:15552'] }) },
  },
  args: { items: ITEMS, activeLabel: 'About', ctaLabel: 'Schedule an appointment', ctaHref: '#', logoHref: '#' },
  argTypes: {
    items: {
      control: 'object',
      description: 'Links in order. An item with `menu` gets a chevron and opens a dropdown (`simple` or `mega`) on hover, click or Enter.',
      table: { type: { summary: "{ label; href?; menu?: { variant: 'simple' | 'mega'; items } }[]" } },
    },
    activeLabel: {
      control: 'select',
      options: [undefined, ...ITEMS.map((i) => i.label)],
      description: 'Label of the current page’s link — shown with the brand underline.',
      table: { type: { summary: 'string' } },
    },
    ctaLabel: { control: 'text', description: 'Booking CTA — the only button in the bar.', table: { defaultValue: { summary: 'Schedule an appointment' } } },
    ctaHref: { control: 'text' },
    logoHref: { control: 'text', description: 'The logo links home.' },
    className: { table: { disable: true } },
  },
  // Leave room under the bar for the dropdowns.
  decorators: [(Story) => <div style={{ minHeight: 420 }}><Story /></div>],
} satisfies Meta<typeof NavigationDesktop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Mobile: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      description: {
        story:
          'Collapsed bar with the menu trigger; tap it to open the drawer (Escape closes it). Rendered in the Mobile dimensions mode — 64px bar, 16px margins.',
      },
    },
  },
  render: (args) => (
    <div data-platform="mobile" style={{ width: 390, border: '1px solid var(--imoc-border-subtle)', margin: 16 }}>
      <NavigationMobile items={args.items} activeLabel={args.activeLabel} ctaLabel={args.ctaLabel} />
    </div>
  ),
};

export const MobileOpen: Story = {
  name: 'Mobile — open',
  tags: ['!dev'],
  render: (args) => (
    <div data-platform="mobile" style={{ width: 390, height: 844, border: '1px solid var(--imoc-border-subtle)', margin: 16, overflow: 'auto' }}>
      <NavigationMobile items={args.items} activeLabel={args.activeLabel} ctaLabel={args.ctaLabel} open />
    </div>
  ),
};

export const NavLinks: Story = {
  name: 'Nav link',
  tags: ['!dev'],
  parameters: {
    docs: {
      description: {
        story:
          'Links that navigate directly have no chevron; links that open a dropdown have one, and it flips up while open. Active adds a 2px brand underline. Hover and tab to see the other states.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: 16 }}>
      <NavLink label="About" />
      <NavLink label="About" active />
      <NavLink label="Conditions" hasMenu />
      <NavLink label="Conditions" hasMenu expanded />
      <NavLink label="Conditions" hasMenu active />
    </div>
  ),
};
