import React from 'react';
import { Icon, type IconName } from '../../icons/Icon';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'plain';

interface BaseProps {
  /** Button label. */
  children: React.ReactNode;
  /** Visual weight. Primary is the default — reach for secondary or plain only when an action needs less emphasis. */
  variant?: ButtonVariant;
  /** Icon before the label (Figma: Icon leading). */
  iconLeading?: IconName;
  /** Icon after the label (Figma: Icon trailing). */
  iconTrailing?: IconName;
  /** Shows the loader in place of the icons and blocks further clicks while an action is in progress. */
  loading?: boolean;
  /** Disables the button. Disabled links render without an href. */
  disabled?: boolean;
  className?: string;
}

type AsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & { href?: undefined };
type AsLink = BaseProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & { href: string };

export type ButtonProps = AsButton | AsLink;

/**
 * Primary action control. One size (48px), three variants. Hover and focus are
 * interaction states handled in CSS, matching the Figma State variants.
 */
export function Button(props: ButtonProps) {
  const {
    children,
    variant = 'primary',
    iconLeading,
    iconTrailing,
    loading = false,
    disabled = false,
    className,
    ...rest
  } = props;

  const classes = ['imoc-button', `imoc-button--${variant}`, className].filter(Boolean).join(' ');

  const content = (
    <>
      {loading ? (
        <Icon name="loader" className="imoc-button__loader" />
      ) : (
        iconLeading && <Icon name={iconLeading} />
      )}
      <span className="imoc-button__label">{children}</span>
      {!loading && iconTrailing && <Icon name={iconTrailing} />}
    </>
  );

  if ('href' in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest as AsLink;
    const inactive = disabled || loading;
    return (
      <a
        {...anchorRest}
        className={classes}
        href={inactive ? undefined : href}
        role={inactive ? 'link' : undefined}
        aria-disabled={inactive || undefined}
        aria-busy={loading || undefined}
        data-disabled={disabled || undefined}
        data-loading={loading || undefined}
      >
        {content}
      </a>
    );
  }

  const { type = 'button', ...buttonRest } = rest as AsButton;
  return (
    <button
      {...buttonRest}
      type={type}
      className={classes}
      disabled={disabled}
      // Loading keeps the button focusable (so focus isn't lost mid-action) but inert.
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      onClick={loading ? (e) => e.preventDefault() : buttonRest.onClick}
    >
      {content}
    </button>
  );
}
