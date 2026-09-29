import React from 'react';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  label: string;
  /** Link target. The last item is the current page and is never a link. */
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** Trail from the top level to the current page. The last item renders as the current page. */
  items: BreadcrumbItem[];
}

/**
 * Trail of links back up the site hierarchy. Use on pages 3+ levels deep (see Page Header).
 * Crumbs after the first get a leading "/" divider; the last crumb is the current page.
 */
export function Breadcrumb({ items, className, ...rest }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" {...rest} className={['imoc-breadcrumb', className].filter(Boolean).join(' ')}>
      <ol className="imoc-breadcrumb__list">
        {items.map((item, i) => {
          const current = i === items.length - 1;
          return (
            <li className="imoc-breadcrumb__item" key={`${item.label}-${i}`}>
              {i > 0 && (
                <span className="imoc-breadcrumb__divider" aria-hidden="true">
                  /
                </span>
              )}
              {current ? (
                <span className="imoc-breadcrumb__current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <a className="imoc-breadcrumb__link" href={item.href ?? '#'}>
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
