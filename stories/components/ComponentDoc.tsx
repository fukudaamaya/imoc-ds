import React, { useState } from 'react';
import { CopyButton } from './CopyButton';
import {
  components,
  figmaNodeUrl,
  renderUrl,
  tokenCode,
  tokenRows,
  variantAxes,
  type ComponentSetSnapshot,
  type ComponentVariant,
  type TokenRow,
} from '../lib/components';
import '../lib/component-doc.css';

// Variants wider than this read better stacked full-width than squeezed into a grid cell.
const WIDE_VARIANT = 480;

function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function variantCaption(v: ComponentVariant, omit: string[] = []): string {
  const entries = Object.entries(v.props).filter(([k]) => !omit.includes(k));
  // One axis left (e.g. State under a Variant tab): the column already implies the name.
  if (entries.length === 1) return entries[0][1];
  return entries.map(([k, val]) => `${k}: ${val}`).join(' · ') || v.name;
}

// ---------- Token code, shared by both tables ----------

function TokenChip({ token }: { token: string | undefined }) {
  if (!token) {
    return (
      <span className="cd-empty" title="No variable bound on this variant">
        —
      </span>
    );
  }
  const code = tokenCode(token);
  if (!code) {
    return (
      <span className="cd-token cd-token--figma-only" title="Figma style — not exported by the token pipeline yet">
        {token}
      </span>
    );
  }
  return <CopyButton kind="css" label={token} value={code} />;
}

// ---------- Variant renders ----------

function Render({ componentKey, variant }: { componentKey: string; variant: ComponentVariant }) {
  const src = renderUrl(componentKey, variant.id);
  if (variant.hidden) return <div className="cd-missing">Hidden on the Figma canvas — no render</div>;
  if (!src) return <div className="cd-missing">Render not exported</div>;
  return (
    <img
      className="cd-render"
      src={src}
      width={variant.width}
      height={variant.height}
      alt={`${variant.name} — exported from Figma`}
    />
  );
}

function VariantMatrix({ componentKey, set }: { componentKey: string; set: ComponentSetSnapshot }) {
  const axes = variantAxes(set);
  const wide = set.variants.some((v) => v.width > WIDE_VARIANT);

  // Two axes on small components: a true matrix, the shorter axis across the top.
  if (axes.length === 2 && !wide) {
    const [cols, rows] = [...axes].sort((a, b) => a.options.length - b.options.length);
    const find = (r: string, c: string) =>
      set.variants.find((v) => v.props[rows.name] === r && v.props[cols.name] === c);
    return (
      <div className="cd-matrix-scroll">
        <table className="cd-matrix">
          <thead>
            <tr>
              <th scope="col">
                <span className="cd-axis">{rows.name}</span> / <span className="cd-axis">{cols.name}</span>
              </th>
              {cols.options.map((c) => (
                <th scope="col" key={c}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.options.map((r) => (
              <tr key={r}>
                <th scope="row">{r}</th>
                {cols.options.map((c) => {
                  const v = find(r, c);
                  return <td key={c}>{v ? <Render componentKey={componentKey} variant={v} /> : <span className="cd-empty">—</span>}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={wide ? 'cd-stack' : 'cd-grid'}>
      {set.variants.map((v) => (
        <figure className="cd-cell" key={v.id}>
          <div className="cd-cell-canvas">
            <Render componentKey={componentKey} variant={v} />
          </div>
          {axes.length > 0 && <figcaption>{variantCaption(v)}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

// ---------- Tokens ----------

function SharedTokens({ rows }: { rows: TokenRow[] }) {
  return (
    <table className="doc-table cd-table">
      <thead>
        <tr>
          <th>Layer</th>
          <th>Property</th>
          <th>Token</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={`${r.layer}|${r.property}`}>
            <td className="cd-layer">{r.layer}</td>
            <td className="cd-mono">{r.property}</td>
            <td>
              <TokenChip token={Object.values(r.byVariant)[0]} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const MAX_COLUMNS = 6;

function VaryingTokens({ set, rows }: { set: ComponentSetSnapshot; rows: TokenRow[] }) {
  const axes = variantAxes(set);
  // Too many variants for one table: tab by the shortest axis, columns are the rest.
  const tabAxis =
    set.variants.length > MAX_COLUMNS && axes.length > 1
      ? [...axes].sort((a, b) => a.options.length - b.options.length)[0]
      : null;
  const [tab, setTab] = useState(tabAxis?.options[0] ?? '');

  const variants = tabAxis ? set.variants.filter((v) => v.props[tabAxis.name] === tab) : set.variants;
  const visibleRows = rows.filter((r) => {
    const vals = variants.map((v) => r.byVariant[v.id]);
    return vals.some(Boolean);
  });

  return (
    <>
      {tabAxis && (
        <div className="doc-tabs" role="tablist" aria-label={tabAxis.name}>
          {tabAxis.options.map((o) => (
            <button
              key={o}
              className="doc-tab"
              role="tab"
              aria-selected={o === tab}
              data-active={o === tab}
              onClick={() => setTab(o)}
            >
              {/^(true|false)$/.test(o) ? `${tabAxis.name}: ${o === 'true' ? 'with' : 'without'}` : o}
            </button>
          ))}
        </div>
      )}
      <div className="cd-matrix-scroll">
        <table className="doc-table cd-table cd-table--varying">
          <thead>
            <tr>
              <th>Layer · property</th>
              {variants.map((v) => (
                <th key={v.id}>{variantCaption(v, tabAxis ? [tabAxis.name] : [])}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((r) => (
              <tr key={`${r.layer}|${r.property}`}>
                <td>
                  <div className="cd-layer">{r.layer}</div>
                  <div className="cd-mono cd-muted">{r.property}</div>
                </td>
                {variants.map((v) => (
                  <td key={v.id}>
                    <TokenChip token={r.byVariant[v.id]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ---------- Guidelines appended below the live examples on each Docs page ----------

/**
 * The Figma-sourced half of a component's Docs page: usage notes (the component's Figma
 * description), the tokens bound in the file, and the full variant set as exported from
 * Figma — including hover and focus, which live examples only show on interaction.
 *
 * `setIds` limits it to some of a page's component sets (e.g. just the Breadcrumb Item set);
 * omit to render all of them.
 */
export function ComponentGuidelines({ componentKey, setIds }: { componentKey: string; setIds?: string[] }) {
  const snapshot = components[componentKey];
  if (!snapshot) throw new Error(`No component snapshot for "${componentKey}" in components/components.json`);
  const sets = setIds ? snapshot.sets.filter((s) => setIds.includes(s.id)) : snapshot.sets;
  const multi = sets.length > 1;

  return (
    <div className="cd-guidelines">
      {sets.map((set) => {
        const paras = paragraphs(set.description);
        const { shared, varying } = tokenRows(set);
        // Single-set pages already show the first paragraph as the page description.
        const usage = multi ? paras : paras.slice(1);
        return (
          <section className="cd-set" key={set.id} aria-label={set.name}>
            {multi && (
              <div className="cd-set-header">
                <h2 className="doc-section-title">{set.name}</h2>
                <a className="cd-node-link" href={figmaNodeUrl(set.id)} target="_blank" rel="noreferrer">
                  View in Figma ↗
                </a>
              </div>
            )}

            {usage.length > 0 && (
              <>
                <h3 className={multi ? 'cd-subsection-title' : 'doc-section-title'}>Usage</h3>
                {usage.map((p, i) => (
                  <p className="cd-prose" key={i}>
                    {p}
                  </p>
                ))}
              </>
            )}

            <h3 className={multi ? 'cd-subsection-title' : 'doc-section-title'}>Design tokens</h3>
            <p className="doc-section-note">
              Variables and text styles bound in the Figma file. A dash means nothing is bound on that variant. Click a
              token to copy its CSS.
            </p>
            {shared.length > 0 && (
              <>
                <h4 className="cd-table-title">Same on every variant</h4>
                <SharedTokens rows={shared} />
              </>
            )}
            {varying.length > 0 && (
              <>
                <h4 className="cd-table-title">Changes by variant</h4>
                <VaryingTokens set={set} rows={varying} />
              </>
            )}

            <div className="cd-set-header">
              <h3 className={multi ? 'cd-subsection-title' : 'doc-section-title'}>Figma reference</h3>
              {!multi && (
                <a className="cd-node-link" href={figmaNodeUrl(set.id)} target="_blank" rel="noreferrer">
                  View in Figma ↗
                </a>
              )}
            </div>
            <p className="doc-section-note">
              Every variant as designed, exported from Figma ({set.variants.length}). Use it to check the live
              component against the source.
            </p>
            <VariantMatrix componentKey={componentKey} set={set} />
          </section>
        );
      })}
    </div>
  );
}

/**
 * First paragraph of a component's Figma description — the page subtitle. Uses the given
 * set, or the first of the component's sets that has a description.
 */
export function componentSummary(componentKey: string, setIds?: string[]): string {
  const snapshot = components[componentKey];
  if (!snapshot) return '';
  const sets = setIds ? setIds.map((id) => snapshot.sets.find((s) => s.id === id)).filter(Boolean) : snapshot.sets;
  const set = (sets as ComponentSetSnapshot[]).find((s) => s.description.trim());
  return set ? paragraphs(set.description)[0] ?? '' : '';
}
