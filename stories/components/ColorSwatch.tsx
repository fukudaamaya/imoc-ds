import React from 'react';
import { CopyButton } from './CopyButton';
import { FigmaBadge } from './FigmaBadge';
import { UsedInChip } from './UsedInChip';
import type { PrimitiveColorToken, SemanticColorToken } from '../lib/tokens';
import { dartPrimitiveColorRef, dartSemanticColorRef } from '../lib/tokens';

export function PrimitiveSwatch({ group, step, token }: { group: string; step: string; token: PrimitiveColorToken }) {
  return (
    <div className="swatch-card">
      <div className="swatch-preview" style={{ background: token.value }} />
      <div className="swatch-body">
        <div className="swatch-name">
          {group}/{step}
        </div>
        <div className="swatch-hex">{token.value}</div>
        <p className="swatch-desc">{token.description}</p>
        <div className="action-row">
          <CopyButton kind="css" label={token.figma.codeSyntax} value={`var(${token.figma.codeSyntax})`} />
          <CopyButton kind="dart" label="Dart" value={dartPrimitiveColorRef(group, step)} />
          <FigmaBadge />
        </div>
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
          <CopyButton kind="css" label={token.figma.codeSyntax} value={`var(${token.figma.codeSyntax})`} />
          <CopyButton kind="dart" label="Dart" value={dartSemanticColorRef(group, tokenKey)} />
          <FigmaBadge />
        </div>
        <UsedInChip tokenName={fullName} />
      </div>
    </div>
  );
}
