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

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    options: {
      storySort: {
        order: ['Overview', 'Colors', 'Typography', 'Spacing', 'Accessibility', 'Changelog'],
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
  decorators: [withPlatform],
};

export default preview;
