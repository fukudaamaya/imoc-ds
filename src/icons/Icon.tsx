import React from 'react';
import { ICONS, type IconName } from './icons';

export type { IconName };
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** Rendered size in px. Figma icons are drawn on a 24px grid. */
  size?: number;
  /** Accessible name. Omit for decorative icons next to a text label. */
  label?: string;
}

/** Icon from the Figma Icons page. Inherits colour from the surrounding text colour. */
export function Icon({ name, size = 24, label, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
      {...rest}
    />
  );
}
