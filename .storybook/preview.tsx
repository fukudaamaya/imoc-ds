import type { Preview } from '@storybook/react';
import React, { useEffect } from 'react';
import '../build/css/tokens.css';
import './preview.css';

const withPlatform = (Story: any, context: any) => {
  const platform = context.globals.platform ?? 'web';
  useEffect(() => {
    document.documentElement.setAttribute('data-platform', platform);
  }, [platform]);
  return <Story />;
};

// Colour mode. Clinic is the :root default, so it removes the attribute rather than setting
// data-theme="clinic"; Supplement applies the [data-theme="supplement"] overrides.
const withTheme = (Story: any, context: any) => {
  const theme = context.globals.theme ?? 'clinic';
  useEffect(() => {
    if (theme === 'clinic') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return <Story />;
};

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    options: {
      storySort: {
        order: [
          'Design System',
          ['Overview', 'Colors', 'Typography', 'Spacing', 'Accessibility', 'Changelog'],
          'Components',
          ['Badge', 'Button', 'Breadcrumb', 'Text Field', 'Dropdown Menu', 'Headers', 'Navigation'],
        ],
      },
    },
    backgrounds: {
      default: 'page',
      values: [
        { name: 'page', value: '#FAFAF8' },
        { name: 'card', value: '#FFFFFF' },
        { name: 'inverse', value: '#141210' },
      ],
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'IMOC DS Colour mode — Clinic or Supplement',
      defaultValue: 'clinic',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'clinic', title: 'Clinic' },
          { value: 'supplement', title: 'Supplement' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
    platform: {
      name: 'Platform',
      description: 'IMOC DS Dimensions mode — Web or Mobile',
      defaultValue: 'web',
      toolbar: {
        icon: 'browser',
        items: [
          { value: 'web', title: 'Web', icon: 'browser' },
          { value: 'mobile', title: 'Mobile', icon: 'mobile' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  decorators: [withPlatform, withTheme],
};

export default preview;
