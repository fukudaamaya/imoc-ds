import React from 'react';
import { CopyButton } from './CopyButton';
import { UsedInChip } from './UsedInChip';
import type { PrimitiveColorToken, SemanticColorToken } from '../lib/tokens';
import { cleanPrimitiveDescription, cleanSemanticDescription, themedColor } from '../lib/tokens';
import { useTheme } from '../lib/useTheme';

export function PrimitiveSwatch({ group, step, token }: { group: string; step: string; token: PrimitiveColorToken }) {
  return (
    <div className="swatch-row">
      <div className="swatch-row-preview" style={{ background: token.value }} />
      <div className="swatch-row-body">
        <div className="swatch-row-title">
          <span className="swatch-row-name">
            {group}/{step}
          </span>
          <span className="swatch-row-hex">{token.value}</span>
        </div>
        <p className="swatch-row-desc">{cleanPrimitiveDescription(token.description, group, step)}</p>
      </div>
      <div className="swatch-row-actions">
        <CopyButton kind="css" label="CSS" value={`var(${token.figma.codeSyntax})`} />
      </div>
    </div>
  );
}

export function SemanticSwatch({ group, tokenKey, token }: { group: string; tokenKey: string; token: SemanticColorToken }) {
  const fullName = `${group}/${tokenKey}`;
  const theme = useTheme();
  const current = themedColor(token, theme);
  const differs = theme !== 'clinic' && current.value !== token.value;
  const label = (c: { aliasOf: string | null; value: string }) => (c.aliasOf ? `${c.aliasOf} (${c.value})` : c.value);
  return (
    <div className="swatch-row swatch-row--semantic">
      <div className="swatch-row-preview" style={{ background: current.value }} />
      <div className="swatch-row-body">
        <div className="swatch-row-name">{fullName}</div>
        <div className="swatch-row-meta">
          {label(current)}
          {differs && <span style={{ color: 'var(--imoc-text-tertiary)' }}> · Clinic: {label(token)}</span>}
        </div>
        <p className="swatch-row-desc">{cleanSemanticDescription(group, tokenKey, token.description)}</p>
        <UsedInChip tokenName={fullName} />
      </div>
      <div className="swatch-row-actions">
        <CopyButton kind="css" label="CSS" value={`var(${token.figma.codeSyntax})`} />
      </div>
    </div>
  );
}
