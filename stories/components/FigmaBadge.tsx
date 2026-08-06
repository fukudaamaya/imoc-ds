import React from 'react';
import { FIGMA_FILE_URL } from '../lib/tokens';

export function FigmaBadge({ href = FIGMA_FILE_URL }: { href?: string }) {
  return (
    <a className="figma-badge" href={href} target="_blank" rel="noreferrer">
      ↗ Figma
    </a>
  );
}
