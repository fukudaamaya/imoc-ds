import type { Meta, StoryObj } from '@storybook/react';
import React, { useMemo, useState } from 'react';
import './lib/doc-ui.css';
import { allChangelogEntries } from './lib/changelog';

const STATUS_COLOR: Record<string, string> = {
  added: 'var(--imoc-text-success)',
  changed: 'var(--imoc-text-warning)',
  removed: 'var(--imoc-text-error)',
};

function ChangelogPage() {
  const entries = useMemo(() => allChangelogEntries(), []);
  const [status, setStatus] = useState<'all' | 'added' | 'changed' | 'removed'>('all');
  const [collection, setCollection] = useState<'all' | string>('all');
  const [search, setSearch] = useState('');

  const collections = useMemo(() => Array.from(new Set(entries.map((e) => e.collection))), [entries]);

  const filtered = entries.filter((e) => {
    if (status !== 'all' && e.status !== status) return false;
    if (collection !== 'all' && e.collection !== collection) return false;
    if (search && !e.tokenName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="doc-page">
      <h1 className="doc-h1">Changelog</h1>
      <p className="doc-lede">
        Every token sync from Figma lands here — before/after values, what collection changed, and when. Run{' '}
        <code>npm run sync-figma</code> to pull the latest from Figma and add a new entry.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Search token name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--imoc-radius-medium)',
            border: '1px solid var(--imoc-border-strong)',
            fontSize: 13,
            minWidth: 220,
          }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          style={{ padding: '8px 12px', borderRadius: 'var(--imoc-radius-medium)', border: '1px solid var(--imoc-border-strong)' }}
        >
          <option value="all">All statuses</option>
          <option value="added">Added</option>
          <option value="changed">Changed</option>
          <option value="removed">Removed</option>
        </select>
        <select
          value={collection}
          onChange={(e) => setCollection(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 'var(--imoc-radius-medium)', border: '1px solid var(--imoc-border-strong)' }}
        >
          <option value="all">All collections</option>
          {collections.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span style={{ fontSize: 12, color: 'var(--imoc-text-tertiary)' }}>
          {filtered.length} of {entries.length} entries
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="doc-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Collection</th>
              <th>Before</th>
              <th>After</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={i}>
                <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{e.tokenName}</td>
                <td style={{ fontSize: 12, color: 'var(--imoc-text-secondary)' }}>{e.collection}</td>
                <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: 'var(--imoc-text-tertiary)' }}>
                  {e.oldValue ?? '—'}
                </td>
                <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{e.newValue ?? '—'}</td>
                <td style={{ fontSize: 12, color: 'var(--imoc-text-secondary)' }}>{e.date}</td>
                <td>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: STATUS_COLOR[e.status],
                    }}
                  >
                    {e.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--imoc-text-tertiary)', padding: 40 }}>No matching entries.</p>
        )}
      </div>
    </div>
  );
}

const meta: Meta<typeof ChangelogPage> = {
  title: 'Changelog',
  component: ChangelogPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ChangelogPage>;

export const History: Story = {};
