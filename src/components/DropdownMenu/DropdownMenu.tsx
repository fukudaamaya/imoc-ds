import React from 'react';
import './DropdownMenu.css';

export interface DropdownMenuItem {
  title: string;
  /** Secondary line under the title. Figma: Description=With. */
  description?: string;
  href?: string;
}

export interface DropdownItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  title: string;
  description?: string;
}

/** A single row inside a dropdown menu. Hover and focus are interaction states. */
export function DropdownItem({ title, description, className, href = '#', ...rest }: DropdownItemProps) {
  return (
    <a {...rest} href={href} className={['imoc-dropdown-item', className].filter(Boolean).join(' ')}>
      <span className="imoc-dropdown-item__title">{title}</span>
      {description && <span className="imoc-dropdown-item__description">{description}</span>}
    </a>
  );
}

export interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * `simple` — a single list (the Conditions menu).
   * `mega` — items split into columns, usually with descriptions (the Services menu).
   */
  variant?: 'simple' | 'mega';
  /** Menu rows. In `mega`, they're split evenly across `columns`. */
  items: DropdownMenuItem[];
  /** Number of columns in the mega menu. Figma shows 2. */
  columns?: number;
}

/**
 * The panel a navigation link reveals: a card with elevation/medium. It only draws the
 * panel — opening, closing and positioning belong to whatever triggers it (see Navigation).
 */
export function DropdownMenu({ variant = 'simple', items, columns = 2, className, ...rest }: DropdownMenuProps) {
  const cls = ['imoc-dropdown', `imoc-dropdown--${variant}`, className].filter(Boolean).join(' ');

  if (variant === 'mega') {
    const perColumn = Math.ceil(items.length / columns);
    const cols = Array.from({ length: columns }, (_, i) => items.slice(i * perColumn, (i + 1) * perColumn));
    return (
      <div {...rest} className={cls}>
        {cols.map((col, i) => (
          <ul className="imoc-dropdown__column" key={i}>
            {col.map((item) => (
              <li key={item.title}>
                <DropdownItem title={item.title} description={item.description} href={item.href} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    );
  }

  return (
    <div {...rest} className={cls}>
      <ul className="imoc-dropdown__column">
        {items.map((item) => (
          <li key={item.title}>
            <DropdownItem title={item.title} description={item.description} href={item.href} />
          </li>
        ))}
      </ul>
    </div>
  );
}
