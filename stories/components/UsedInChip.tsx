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
        }}
      >
        Your request is in — we'll call within one business day.
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
    label: 'Condition-match banner',
    render: () => (
      <div
        style={{
          background: 'var(--imoc-surface-brand-subtle)',
          borderRadius: 'var(--imoc-radius-medium)',
          padding: '10px 14px',
          fontSize: 13,
          color: 'var(--imoc-text-primary)',
        }}
      >
        Yes, we treat this condition
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
    label: 'Focus ring',
    render: () => (
      <input
        readOnly
        value="Focused input"
        style={{
          border: '1px solid var(--imoc-border-strong)',
          outline: '2px solid var(--imoc-border-focus)',
          outlineOffset: 2,
          borderRadius: 'var(--imoc-radius-medium)',
          padding: '8px 12px',
          fontSize: 14,
        }}
      />
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
        }}
      >
        Call to confirm availability
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
