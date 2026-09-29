import componentsJson from '../../components/components.json';
import { semanticColor, dimensions } from './tokens';

// ---- shapes (mirrors scripts/figma/export-components.js) ----

export interface TokenBinding {
  layer: string;
  property: string;
  token: string;
}

export interface ComponentVariant {
  id: string;
  name: string;
  props: Record<string, string>;
  width: number;
  height: number;
  /** Hidden on the Figma canvas — no render can be exported. */
  hidden?: boolean;
  tokens: TokenBinding[];
}

export interface ComponentProperty {
  name: string;
  type: 'VARIANT' | 'TEXT' | 'BOOLEAN' | 'INSTANCE_SWAP' | 'SLOT';
  options?: string[];
  default?: string | boolean;
}

export interface ComponentSetSnapshot {
  id: string;
  name: string;
  description: string;
  properties: ComponentProperty[];
  variants: ComponentVariant[];
}

export interface ComponentSnapshot {
  page: string;
  sets: ComponentSetSnapshot[];
}

/**
 * Figma text layers are often auto-named after their sample text ("Email", "Jane",
 * "Section headline goes here"), which differs between variants and would split one
 * layer into several token-table rows. These map those names to the layer's role.
 * Keyed by component; each rule rewrites one path segment.
 */
const LAYER_ALIASES: Record<string, [RegExp, string][]> = {
  'text-field': [
    [/^(Email|First [Nn]ame)$/, 'Label'],
    [/^(jane\.smith@gmail\.com|Jane SmI|Jane|J)$/, 'Value'],
  ],
  breadcrumb: [
    [/^Home$/, 'First crumb'],
    [/^Services$/, 'Crumb'],
    [/^Metabolic Disorders$/, 'Current crumb'],
  ],
  headers: [
    [/^Section Overline$/, 'Overline'],
    [/^Section headline goes here$/, 'Headline'],
    [/^Section subheader$/, 'Subheader'],
    [/^Home$/, 'First crumb'],
    [/^Services$/, 'Crumb'],
    [/^Metabolic Disorders$/, 'Current crumb'],
  ],
  navigation: [[/^Nav Link — .+$/, 'Nav Link']],
  'dropdown-menu': [[/^Column \d$/, 'Column']],
};

function aliasLayer(componentKey: string, layer: string): string {
  const rules = LAYER_ALIASES[componentKey];
  if (!rules) return layer;
  return layer
    .split(' / ')
    .map((seg) => rules.reduce((acc, [re, to]) => (re.test(acc) ? to : acc), seg))
    .join(' / ');
}

export const components = Object.fromEntries(
  Object.entries(componentsJson as unknown as Record<string, ComponentSnapshot>).map(([key, comp]) => [
    key,
    {
      ...comp,
      sets: comp.sets.map((set) => ({
        ...set,
        variants: set.variants.map((v) => ({
          ...v,
          // Logo artwork is raw vector paths, not tokens — nothing useful to list.
          tokens: v.tokens
            .filter((t) => !/(^|\/ )Logo( \/|$)/.test(t.layer))
            .map((t) => ({ ...t, layer: aliasLayer(key, t.layer) })),
        })),
      })),
    },
  ]),
) as Record<string, ComponentSnapshot>;

export const FIGMA_FILE_KEY = '83u6tgRpNEq3yYZetZBpQ9';

export function figmaNodeUrl(nodeId: string): string {
  return `https://www.figma.com/design/${FIGMA_FILE_KEY}/IMOC-DS?node-id=${nodeId.replace(':', '-')}`;
}

// ---- renders exported from Figma (scripts/figma/export-renders.js) ----

const renderUrls = import.meta.glob('../assets/components/**/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export function renderUrl(componentKey: string, variantId: string): string | undefined {
  return renderUrls[`../assets/components/${componentKey}/${variantId.replace(':', '-')}.png`];
}

// ---- token name -> code ----

const TYPE_PROPS = ['family', 'size', 'weight', 'line-height', 'letter-spacing'] as const;
const CSS_PROP: Record<string, string> = {
  family: 'font-family',
  size: 'font-size',
  weight: 'font-weight',
  'line-height': 'line-height',
  'letter-spacing': 'letter-spacing',
};

/**
 * What a developer pastes for a bound token. Colour, spacing, radius, and layout tokens map
 * to their own custom property; a text style expands to its five type properties. Returns
 * null for anything the token pipeline doesn't export yet (e.g. Figma effect styles).
 */
export function tokenCode(token: string): string | null {
  const [group, ...rest] = token.split('/');
  const key = rest.join('/');

  if (semanticColor[group]?.[key]) return `var(${semanticColor[group][key].figma.codeSyntax})`;

  if (group === 'spacing' || group === 'radius' || group === 'layout') {
    const t = dimensions[group][key];
    return t ? `var(${t.figma.codeSyntax})` : null;
  }

  if (group === 'type') {
    const style = dimensions.typography[rest[0]];
    if (!style) return null;
    if (rest.length === 1) {
      return TYPE_PROPS.filter((p) => style[p])
        .map((p) => `${CSS_PROP[p]}: var(${style[p].figma.codeSyntax});`)
        .join('\n');
    }
    const t = style[rest[1]];
    return t ? `var(${t.figma.codeSyntax})` : null;
  }

  return null;
}

// ---- variant analysis for the doc page ----

export function variantAxes(set: ComponentSetSnapshot): { name: string; options: string[] }[] {
  return set.properties
    .filter((p) => p.type === 'VARIANT' && p.options && p.options.length > 1)
    .map((p) => ({ name: p.name, options: p.options! }));
}

export interface TokenRow {
  layer: string;
  property: string;
  /** variant id -> token (undefined = nothing bound on that variant) */
  byVariant: Record<string, string | undefined>;
}

/**
 * Splits every layer·property binding in a set into rows that are identical on every variant
 * (shared) and rows whose token changes between variants (varying).
 */
export function tokenRows(set: ComponentSetSnapshot): { shared: TokenRow[]; varying: TokenRow[] } {
  const rows = new Map<string, TokenRow>();
  for (const v of set.variants) {
    for (const b of v.tokens) {
      const k = `${b.layer}|${b.property}`;
      if (!rows.has(k)) rows.set(k, { layer: b.layer, property: b.property, byVariant: {} });
      rows.get(k)!.byVariant[v.id] = b.token;
    }
  }
  const shared: TokenRow[] = [];
  const varying: TokenRow[] = [];
  for (const row of rows.values()) {
    const values = set.variants.map((v) => row.byVariant[v.id]);
    (values.every((t) => t === values[0]) ? shared : varying).push(row);
  }
  return { shared, varying };
}

/** "Button Surface / Label" -> "Label"; "(root)" -> "Root". Keeps the last meaningful segment. */
export function layerShortName(layer: string): string {
  if (layer === '(root)') return 'Root';
  const parts = layer.split(' / ');
  return parts[parts.length - 1];
}
