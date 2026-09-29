import React from 'react';
import { Breadcrumb, type BreadcrumbItem } from '../Breadcrumb/Breadcrumb';
import brandmarkUrl from '../../brand/brand.svg';
import './Headers.css';

type HeadingLevel = 'h1' | 'h2' | 'h3';

export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Headline (type/heading-2). */
  title: React.ReactNode;
  /** Eyebrow label above the headline (type/overline, text/brand). Figma: Overline. */
  overline?: React.ReactNode;
  /** Supporting line under the headline (type/body-large, text/secondary). Figma: Subheader. */
  subheader?: React.ReactNode;
  /** Figma: Align. */
  align?: 'left' | 'center';
  /** HTML heading level for the headline. Styling stays heading-2 whatever the level. */
  as?: HeadingLevel;
}

/** Headline block that introduces a page section. */
export function SectionHeader({ title, overline, subheader, align = 'left', as: Heading = 'h2', className, ...rest }: SectionHeaderProps) {
  return (
    <header {...rest} className={['imoc-section-header', `imoc-section-header--${align}`, className].filter(Boolean).join(' ')}>
      {overline && <p className="imoc-section-header__overline">{overline}</p>}
      <Heading className="imoc-section-header__title">{title}</Heading>
      {subheader && <p className="imoc-section-header__subheader">{subheader}</p>}
    </header>
  );
}

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Page H1 (type/heading-1). */
  title: React.ReactNode;
  /** Short line under the title (type/body-large, text/secondary). Figma: Description. */
  description?: React.ReactNode;
  /** Trail for pages 3+ levels deep; omit on flat top-level pages. Figma: Breadcrumb. */
  breadcrumb?: BreadcrumbItem[];
}

/** Top-of-page header. Always shows the brandmark and an H1. */
export function PageHeader({ title, description, breadcrumb, className, ...rest }: PageHeaderProps) {
  return (
    <header {...rest} className={['imoc-page-header', className].filter(Boolean).join(' ')}>
      <div className="imoc-page-header__top">
        <img className="imoc-page-header__brandmark" src={brandmarkUrl} alt="" width={64} height={76} />
        {breadcrumb && breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}
      </div>
      <div className="imoc-page-header__text">
        <h1 className="imoc-page-header__title">{title}</h1>
        {description && <p className="imoc-page-header__description">{description}</p>}
      </div>
    </header>
  );
}
