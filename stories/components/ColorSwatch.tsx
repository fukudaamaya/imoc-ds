import React from 'react';
import { CopyButton } from './CopyButton';
import { FigmaBadge } from './FigmaBadge';
import { UsedInChip } from './UsedInChip';
import type { PrimitiveColorToken, SemanticColorToken } from '../lib/tokens';
import { cleanPrimitiveDescription } from '../lib/tokens';

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
  return (
    <div className="swatch-card">
      <div className="swatch-preview" style={{ background: token.value }} />
      <div className="swatch-body">
        <div className="swatch-name">{fullName}</div>
        <div className="swatch-hex">{token.value}</div>
        {token.aliasOf && (
          <div className="swatch-alias">
            aliases <code>{token.aliasOf}</code>
          </div>
        )}
        <p className="swatch-desc">{token.description}</p>
        {token.scopes.length > 0 && (
          <div className="chip-row">
            {token.scopes.map((s) => (
              <span className="chip" key={s}>
                {s.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}
        <div className="action-row">
          <CopyButton kind="css" label="CSS" value={`var(${token.figma.codeSyntax})`} />
          <FigmaBadge />
        </div>
        <UsedInChip tokenName={fullName} />
      </div>
    </div>
  );
}
