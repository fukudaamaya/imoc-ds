import React, { useState } from 'react';

interface UsageDemo {
  label: string;
  render: () => React.ReactNode;
}

// Curated, not exhaustive — the tokens where seeing the real usage in miniature makes the
// intent obvious at a glance. Add more here as new components adopt a semantic token.
const USAGE_REGISTRY: Record<string, UsageDemo> = {
  'surface/action': {
    label: 'Primary button',
    render: () => (
      <button
        style={{
          background: 'var(--imoc-surface-action)',
          color: 'var(--imoc-text-on-fill)',
          border: 'none',
          borderRadius: 'var(--imoc-radius-medium)',
          padding: '10px 20px',
          fontSize: 16,
          fontWeight: 500,
          fontFamily: 'Satoshi, sans-serif',
        }}
      >
        Book an appointment
      </button>
    ),
  },
  'text/error': {
    label: 'Inline error message',
    render: () => (
      <span style={{ color: 'var(--imoc-text-error)', fontSize: 14, display: 'flex', gap: 6, alignItems: 'center' }}>
        ⚠ This field is required
      </span>
    ),
  },
  'surface/success': {
    label: 'Booking confirmed panel',
    render: () => (
      <div
        style={{
          background: 'var(--imoc-surface-success)',
          color: 'var(--imoc-text-success)',
          borderRadius: 'var(--imoc-radius-medium)',
          padding: '10px 14px',
          fontSize: 13,
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}
      >
        <span aria-hidden="true">✓</span>
        <span>Booking confirmed — we'll call within one business day.</span>
      </div>
    ),
  },
  'text/link': {
    label: 'Inline link',
    render: () => (
      <span style={{ fontSize: 14, color: 'var(--imoc-text-primary)' }}>
        See{' '}
        <a href="#" style={{ color: 'var(--imoc-text-link)', textDecoration: 'underline' }}>
          related treatments
        </a>
      </span>
    ),
  },
  'surface/brand-subtle': {
    label: 'Icon frame',
    render: () => (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 'var(--imoc-radius-medium)',
          background: 'var(--imoc-surface-brand-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--imoc-text-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2 4 5v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V5l-8-3Z" />
          <line x1="12" y1="8" x2="12" y2="14" />
          <line x1="9" y1="11" x2="15" y2="11" />
        </svg>
      </div>
    ),
  },
  'surface/disabled': {
    label: 'Disabled button',
    render: () => (
      <button
        disabled
        style={{
          background: 'var(--imoc-surface-disabled)',
          color: 'var(--imoc-text-disabled)',
          border: 'none',
          borderRadius: 'var(--imoc-radius-medium)',
          padding: '10px 20px',
          fontSize: 16,
        }}
      >
        Unavailable
      </button>
    ),
  },
  'border/focus': {
    label: 'Focused button',
    render: () => (
      <button
        style={{
          background: 'var(--imoc-surface-action)',
          color: 'var(--imoc-text-on-fill)',
          border: 'none',
          borderRadius: 'var(--imoc-radius-medium)',
          padding: '10px 20px',
          fontSize: 16,
          fontWeight: 500,
          fontFamily: 'Satoshi, sans-serif',
          outline: '2px solid var(--imoc-border-focus)',
          outlineOffset: 2,
        }}
      >
        Book an appointment
      </button>
    ),
  },
  'surface/warning': {
    label: 'Advisory notice',
    render: () => (
      <div
        style={{
          background: 'var(--imoc-surface-warning)',
          color: 'var(--imoc-text-warning)',
          borderRadius: 'var(--imoc-radius-medium)',
          padding: '10px 14px',
          fontSize: 13,
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}
      >
        <span aria-hidden="true">⚠</span>
        <span>Call to confirm availability</span>
      </div>
    ),
  },
  'surface/error': {
    label: 'Failed submission banner',
    render: () => (
      <div
        style={{
          background: 'var(--imoc-surface-error)',
          color: 'var(--imoc-text-error)',
          borderRadius: 'var(--imoc-radius-medium)',
          padding: '10px 14px',
          fontSize: 13,
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}
      >
        <span aria-hidden="true">✕</span>
        <span>Failed to submit — please try again.</span>
      </div>
    ),
  },
  'surface/info': {
    label: 'Telehealth explainer',
    render: () => (
      <div
        style={{
          background: 'var(--imoc-surface-info)',
          color: 'var(--imoc-text-info)',
          borderRadius: 'var(--imoc-radius-medium)',
          padding: '10px 14px',
          fontSize: 13,
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}
      >
        <span aria-hidden="true">ⓘ</span>
        <span>Telehealth is available in most states.</span>
      </div>
    ),
  },
  'text/brand': {
    label: 'Section eyebrow + heading',
    render: () => (
      <div>
        <div
          style={{
            fontFamily: 'var(--imoc-type-overline-family), sans-serif',
            fontSize: 'var(--imoc-type-overline-size)',
            fontWeight: 'var(--imoc-type-overline-weight)' as React.CSSProperties['fontWeight'],
            lineHeight: 'var(--imoc-type-overline-line-height)',
            letterSpacing: 'var(--imoc-type-overline-letter-spacing)',
            textTransform: 'uppercase',
            color: 'var(--imoc-text-brand)',
          }}
        >
          Our approach
        </div>
        <div
          style={{
            fontFamily: 'var(--imoc-type-heading-2-family), serif',
            fontSize: 'var(--imoc-type-heading-2-size)',
            fontWeight: 'var(--imoc-type-heading-2-weight)' as React.CSSProperties['fontWeight'],
            lineHeight: 'var(--imoc-type-heading-2-line-height)',
            letterSpacing: 'var(--imoc-type-heading-2-letter-spacing)',
            color: 'var(--imoc-text-primary)',
          }}
        >
          Physician-led, from day one
        </div>
      </div>
    ),
  },
  'text/on-fill': {
    label: 'Primary button label',
    render: () => (
      <button
        style={{
          background: 'var(--imoc-surface-action)',
          color: 'var(--imoc-text-on-fill)',
          border: 'none',
          borderRadius: 'var(--imoc-radius-medium)',
          padding: '10px 20px',
          fontSize: 16,
          fontWeight: 500,
          fontFamily: 'Satoshi, sans-serif',
        }}
      >
        Book an appointment
      </button>
    ),
  },
  'text/success': {
    label: 'Inline success message',
    render: () => (
      <span style={{ color: 'var(--imoc-text-success)', fontSize: 14, display: 'flex', gap: 6, alignItems: 'center' }}>
        ✓ Appointment confirmed
      </span>
    ),
  },
  'text/placeholder': {
    label: 'Empty form field',
    render: () => (
      <div
        style={{
          border: '1px solid var(--imoc-border-strong)',
          background: 'var(--imoc-surface-input)',
          borderRadius: 'var(--imoc-radius-medium)',
          padding: '8px 12px',
          fontSize: 14,
          color: 'var(--imoc-text-placeholder)',
          width: 200,
        }}
      >
        you@example.com
      </div>
    ),
  },
  'text/warning': {
    label: 'Advisory copy',
    render: () => (
      <span style={{ color: 'var(--imoc-text-warning)', fontSize: 14, display: 'flex', gap: 6, alignItems: 'center' }}>
        ⚠ Limited availability in your area
      </span>
    ),
  },
  'text/info': {
    label: 'Explanatory callout copy',
    render: () => (
      <span style={{ color: 'var(--imoc-text-info)', fontSize: 14, display: 'flex', gap: 6, alignItems: 'center' }}>
        ⓘ Telehealth available in most states
      </span>
    ),
  },
  'surface/hover': {
    label: 'Dropdown menu item (hover)',
    render: () => (
      <div
        style={{
          width: 220,
          border: '1px solid var(--imoc-border-default)',
          background: 'var(--imoc-surface-card)',
          borderRadius: 'var(--imoc-radius-medium)',
          padding: 4,
          fontSize: 14,
          color: 'var(--imoc-text-primary)',
        }}
      >
        <div style={{ padding: '8px 10px', borderRadius: 'var(--imoc-radius-small)' }}>Reschedule appointment</div>
        <div style={{ padding: '8px 10px', borderRadius: 'var(--imoc-radius-small)', background: 'var(--imoc-surface-hover)' }}>
          Cancel appointment
        </div>
        <div style={{ padding: '8px 10px', borderRadius: 'var(--imoc-radius-small)' }}>Contact clinic</div>
      </div>
    ),
  },
};

export function UsedInChip({ tokenName }: { tokenName: string }) {
  const demo = USAGE_REGISTRY[tokenName];
  const [open, setOpen] = useState(false);
  if (!demo) return null;

  return (
    <div>
      <button
        className="chip used-in"
        onClick={() => setOpen((v) => !v)}
        style={{ border: 'none', cursor: 'pointer' }}
      >
        Used in: {demo.label} {open ? '▲' : '▼'}
      </button>
      {open && <div className="used-in-demo">{demo.render()}</div>}
    </div>
  );
}
