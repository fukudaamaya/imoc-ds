import React, { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '../../icons/Icon';
import { Button } from '../Button/Button';
import { DropdownMenu, type DropdownMenuItem } from '../DropdownMenu/DropdownMenu';
import logoUrl from '../../brand/logo.svg';
import './Navigation.css';

// ---------------- Nav Link ----------------

export interface NavLinkProps {
  label: string;
  href?: string;
  /** Current page: brand label + 2px brand underline. Figma: State=Active. */
  active?: boolean;
  /** Shows the chevron — for links that reveal a dropdown (Conditions, Services). Figma: Chevron=With. */
  hasMenu?: boolean;
  /** Whether that dropdown is open. Flips the chevron up. */
  expanded?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
  className?: string;
}

/**
 * Top-level header navigation link. Without a menu it's an `<a>`; with one it's a
 * `<button aria-expanded>` that toggles the dropdown. Hover and focus are CSS states.
 */
export const NavLink = React.forwardRef<HTMLElement, NavLinkProps & { controls?: string }>(function NavLink(
  { label, href = '#', active, hasMenu, expanded, onClick, className, controls },
  ref,
) {
  const cls = ['imoc-nav-link', hasMenu && 'imoc-nav-link--menu', className].filter(Boolean).join(' ');
  const inner = (
    <span className="imoc-nav-link__row">
      <span className="imoc-nav-link__label">{label}</span>
      {hasMenu && <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={16} />}
    </span>
  );

  if (hasMenu) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={cls}
        aria-expanded={expanded ?? false}
        aria-controls={controls}
        data-active={active || undefined}
        onClick={onClick}
      >
        {inner}
      </button>
    );
  }
  return (
    <a
      ref={ref as React.Ref<HTMLAnchorElement>}
      className={cls}
      href={href}
      aria-current={active ? 'page' : undefined}
      data-active={active || undefined}
      onClick={onClick}
    >
      {inner}
    </a>
  );
});

// ---------------- shared types ----------------

export interface NavigationItem {
  label: string;
  href?: string;
  /** Dropdown revealed by this link (desktop only). */
  menu?: { variant: 'simple' | 'mega'; items: DropdownMenuItem[] };
}

interface NavigationBaseProps {
  items: NavigationItem[];
  /** Label of the current page's link. */
  activeLabel?: string;
  /** Booking CTA label. */
  ctaLabel?: string;
  ctaHref?: string;
  logoHref?: string;
}

function Logo({ href, height }: { href: string; height: number }) {
  return (
    <a className="imoc-nav__logo" href={href} aria-label="Integrative Medicine Orange County — home">
      <img src={logoUrl} alt="" height={height} />
    </a>
  );
}

// ---------------- Desktop ----------------

export type NavigationDesktopProps = NavigationBaseProps & React.HTMLAttributes<HTMLElement>;

/**
 * Site header for wide screens: logo left, links centre, the booking CTA right — the only
 * button in the bar. No phone number, by design: the brief is to move volume off the phone.
 */
export function NavigationDesktop({
  items,
  activeLabel,
  ctaLabel = 'Schedule an appointment',
  ctaHref = '#',
  logoHref = '#',
  className,
  ...rest
}: NavigationDesktopProps) {
  const [open, setOpen] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const baseId = useId();

  // Close on Escape (returning focus to the trigger) and on a click outside the bar.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const trigger = rootRef.current?.querySelector<HTMLElement>(`[aria-controls="${baseId}-${open}"]`);
        setOpen(null);
        trigger?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, baseId]);

  return (
    <header ref={rootRef} {...rest} className={['imoc-nav', 'imoc-nav--desktop', className].filter(Boolean).join(' ')}>
      <Logo href={logoHref} height={44} />
      <nav aria-label="Main">
        <ul className="imoc-nav__links">
          {items.map((item, i) => {
            const key = String(i);
            const menuId = `${baseId}-${key}`;
            const isOpen = open === key;
            return (
              <li
                key={item.label}
                className="imoc-nav__item"
                // Hover opens too (Figma: "reveal a dropdown on hover"); click and keyboard work without it.
                onMouseEnter={item.menu ? () => setOpen(key) : undefined}
                onMouseLeave={item.menu ? () => setOpen((cur) => (cur === key ? null : cur)) : undefined}
              >
                <NavLink
                  label={item.label}
                  href={item.href}
                  active={item.label === activeLabel}
                  hasMenu={!!item.menu}
                  expanded={isOpen}
                  controls={item.menu ? menuId : undefined}
                  onClick={item.menu ? () => setOpen(isOpen ? null : key) : undefined}
                />
                {item.menu && (
                  <div className="imoc-nav__dropdown" id={menuId} hidden={!isOpen}>
                    <DropdownMenu variant={item.menu.variant} items={item.menu.items} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      <Button href={ctaHref}>{ctaLabel}</Button>
    </header>
  );
}

// ---------------- Mobile ----------------

export interface NavigationMobileProps extends NavigationBaseProps, React.HTMLAttributes<HTMLElement> {
  /** Phone fallback shown under the CTA in the open drawer. */
  phone?: string;
  /** Controlled open state. Omit to let the component manage it. Figma: State. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Mobile header: logo + menu trigger. Open, it becomes a full-height drawer with the links,
 * the booking CTA and a phone fallback.
 */
export function NavigationMobile({
  items,
  activeLabel,
  ctaLabel = 'Schedule an appointment',
  ctaHref = '#',
  logoHref = '#',
  phone = '(949) 860-7088',
  open: openProp,
  onOpenChange,
  className,
  ...rest
}: NavigationMobileProps) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const drawerId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <header
      {...rest}
      className={['imoc-nav', 'imoc-nav--mobile', className].filter(Boolean).join(' ')}
      data-open={open || undefined}
    >
      <div className="imoc-nav__bar">
        <Logo href={logoHref} height={32} />
        <button
          type="button"
          className="imoc-nav__trigger"
          aria-expanded={open}
          aria-controls={drawerId}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </div>
      <div className="imoc-nav__drawer" id={drawerId} hidden={!open}>
        <nav aria-label="Main">
          <ul className="imoc-nav__list">
            {items.map((item) => (
              <li key={item.label}>
                <NavLink label={item.label} href={item.href} active={item.label === activeLabel} />
              </li>
            ))}
          </ul>
        </nav>
        <div className="imoc-nav__footer">
          <Button href={ctaHref} className="imoc-nav__footer-cta">
            {ctaLabel}
          </Button>
          <p className="imoc-nav__phone">
            Prefer to call? <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>
          </p>
        </div>
      </div>
    </header>
  );
}
