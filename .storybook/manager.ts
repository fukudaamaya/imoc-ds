import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'IMOC Design System',
    brandUrl: 'https://www.figma.com/design/83u6tgRpNEq3yYZetZBpQ9/IMOC-DS',
    brandTarget: '_blank',
    colorPrimary: '#0a6b6d',
    colorSecondary: '#0a6b6d',
  }),
});
