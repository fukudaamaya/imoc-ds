import primitivesJson from '../../tokens/primitives.json';
import colorJson from '../../tokens/color.json';
import dimensionsJson from '../../tokens/dimensions.json';

export const primitives = primitivesJson as PrimitivesFile;
export const semanticColor = colorJson as ColorFile;
export const dimensions = dimensionsJson as DimensionsFile;

export const FIGMA_FILE_URL =
  'https://www.figma.com/design/83u6tgRpNEq3yYZetZBpQ9/IMOC-DS?node-id=5121-1294';

// ---- shapes (mirrors style-dictionary/build.mjs's understanding of tokens/*.json) ----

export interface FigmaMeta {
  id: string;
  collection: string;
  mode?: string;
  codeSyntax: string;
}

export interface PrimitiveColorToken {
  value: string;
  type: 'color';
  description: string;
  figma: FigmaMeta;
}

export interface PrimitivesFile {
  color: Record<string, Record<string, PrimitiveColorToken>>;
  typography: { family: Record<string, { value: string; type: string; description: string; figma: FigmaMeta }> };
  spacing: Record<string, { value: number; type: string; unit: string; description: string; figma: FigmaMeta }>;
  radius: Record<string, { value: number; type: string; unit: string; description: string; figma: FigmaMeta }>;
}

export interface SemanticColorToken {
  value: string;
  alias: string | null;
  aliasOf: string | null;
  type: 'color';
  scopes: string[];
  description: string;
  figma: FigmaMeta;
}

export type ColorFile = Record<string, Record<string, SemanticColorToken>>;

export interface DimensionToken {
  mobile: number | string;
  web: number | string;
  aliasOf?: string;
  mobileAliasOf?: string;
  webAliasOf?: string;
  type: string;
  unit?: string;
  description: string;
  figma: FigmaMeta;
}

export interface DimensionsFile {
  typography: Record<string, Record<string, DimensionToken>>;
  spacing: Record<string, DimensionToken>;
  radius: Record<string, DimensionToken>;
  layout: Record<string, DimensionToken>;
}

// ---- flattened lists, convenient for story rendering ----

export interface FlatPrimitiveColor {
  group: string;
  step: string;
  name: string;
  token: PrimitiveColorToken;
}

export function flatPrimitiveColors(): FlatPrimitiveColor[] {
  const out: FlatPrimitiveColor[] = [];
  for (const group of Object.keys(primitives.color)) {
    for (const step of Object.keys(primitives.color[group])) {
      out.push({ group, step, name: `${group}/${step}`, token: primitives.color[group][step] });
    }
  }
  return out;
}

export interface FlatSemanticColor {
  group: string;
  key: string;
  name: string;
  token: SemanticColorToken;
}

export function flatSemanticColors(): FlatSemanticColor[] {
  const out: FlatSemanticColor[] = [];
  for (const group of Object.keys(semanticColor)) {
    for (const key of Object.keys(semanticColor[group])) {
      out.push({ group, key, name: `${group}/${key}`, token: semanticColor[group][key] });
    }
  }
  return out;
}

export interface FlatTypeStyle {
  name: string;
  family: DimensionToken;
  size: DimensionToken;
  weight: DimensionToken;
  lineHeight: DimensionToken;
  letterSpacing: DimensionToken;
}

const TYPE_ORDER = [
  'display',
  'heading-1',
  'heading-2',
  'heading-3',
  'body-large',
  'body-medium',
  'label',
  'body-small',
  'overline',
];

export function flatTypeStyles(): FlatTypeStyle[] {
  return TYPE_ORDER.filter((name) => dimensions.typography[name]).map((name) => {
    const props = dimensions.typography[name];
    return {
      name,
      family: props.family,
      size: props.size,
      weight: props.weight,
      lineHeight: props['line-height'],
      letterSpacing: props['letter-spacing'],
    };
  });
}


/**
 * Every primitive color description starts with its own name, e.g. "Ocean 50. Lightest
 * brand wash..." — redundant once the name's already shown as the row label. Strips just
 * that exact leading "{Group} {step}. " if present; leaves the description untouched
 * otherwise, so a differently-worded description in Figma never gets mangled.
 */
export function cleanPrimitiveDescription(description: string, group: string, step: string): string {
  const prefix = `${group.charAt(0).toUpperCase()}${group.slice(1)} ${step}. `;
  return description.startsWith(prefix) ? description.slice(prefix.length) : description;
}

