import React from 'react';
import './Badge.css';

export type BadgeVariant = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Badge text. */
  children: React.ReactNode;
  /** Colour family — maps 1:1 to the semantic token family of the same name. Figma: Type. */
  variant?: BadgeVariant;
}

/**
 * Static, non-interactive status or category label. Not for filters or tabs — those need
 * hover, selected and focus states this component deliberately doesn't have.
 */
export function Badge({ children, variant = 'neutral', className, ...rest }: BadgeProps) {
  return (
    <span {...rest} className={['imoc-badge', `imoc-badge--${variant}`, className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}
