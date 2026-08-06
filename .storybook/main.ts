import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions', '@storybook/addon-links'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  docs: {
    defaultName: 'Docs',
  },
  staticDirs: ['../build'],
  // Escape hatch for deploying under a subpath (e.g. a project site served from /repo-name/
  // rather than /). Vercel serves from root, so this is unused today — set STORYBOOK_BASE_PATH
  // at build time if that ever changes.
  async viteFinal(config) {
    if (process.env.STORYBOOK_BASE_PATH) {
      config.base = process.env.STORYBOOK_BASE_PATH;
    }
    return config;
  },
};

export default config;
