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

/**
 * Figma's semantic color descriptions mix use-case guidance with contrast ratios (e.g.
 * "14.78:1 on surface/page") and WCAG citations. The ratios are already computed live,
 * from resolved RGB, on the Accessibility page — carrying them here too just duplicates
 * (and risks drifting from) that source of truth. This map trims each description down to
 * use-case guidance only. Hand-curated rather than regex-stripped, since the ratio clauses
 * don't sit in one consistent position across descriptions. Falls back to the raw Figma
 * description for any token not covered here (e.g. a token added after this was written).
 */
const SEMANTIC_DESCRIPTION_OVERRIDES: Record<string, string> = {
  'text/primary': 'Body copy, treatment descriptions, headings, form labels — the default reading colour.',
  'text/secondary':
    'Documentation-page labels and table headers here on the Foundations pages. Not yet used on a live product component — "card subtitles, breadcrumbs" is planned, not current; breadcrumbs use text/link today.',
  'text/tertiary':
    'Helper text under form inputs, footnotes, supporting detail inside cards. Shares its value with text/placeholder today — kept as a separate token since they mean different things even when they render the same.',
  'text/disabled': 'Disabled button labels, unavailable appointment slot text, locked form step labels. Always pair with a non-colour cue.',
  'text/inverse': 'Body copy in the footer — brand blurb, nav link columns, practice details, contact info. Dark longevity sections are planned, not yet built.',
  'text/link':
    'Breadcrumb items, plain-variant button labels, card "Explore →" affordances, and inline links in body copy. Underlined only when inline in body copy, where colour alone isn\'t enough of a cue — breadcrumbs, buttons, and card affordances read as interactive from their own component context and don\'t carry an underline.',
  'text/link-hover': 'Hover and focus state on inline links.',
  'text/link-inverse': 'Not currently used in any built component — use case undecided.',
  'text/brand': 'Overline eyebrow labels above section titles (not the headings themselves), badge label colour (Type=brand), secondary button label, and the active-state nav link label.',
  'text/accent': 'Earth-coloured editorial headings, pull quotes, treatment category labels.',
  'text/on-fill':
    'Text and icons on any dark filled surface — primary button labels on surface/action, headings on surface/brand, copy on surface/accent editorial blocks. Replaces the former text/on-brand and text/on-accent, which were the same white doing the same job.',
  'text/success': 'Confirmation copy — "Your request is in, we\'ll call within one business day." Also the label colour of the success badge.',
  'text/warning': 'Advisory copy — out-of-state travel notes, limited availability messages. Also the label colour of the warning badge.',
  'text/error': 'Validation messages beside the failing field. Supportive tone, never blaming. Also the label colour of the error badge.',
  'text/info': 'Explanatory copy — cash-pay policy, what to bring, telehealth eligibility. Also the label colour of the info badge.',
  'text/placeholder':
    'Placeholder text inside empty form fields — "you@example.com", "Search conditions". Distinct from text/tertiary (helper text below a field) and text/disabled (inactive control), even though it shares text/tertiary\'s value today.',

  'surface/background': 'Base page canvas behind all content on every route. Warm off-white rather than pure white to reduce glare for light-sensitive readers.',
  'surface/card': 'Treatment and condition cards, practitioner bio panels, FAQ accordions. Lifts off the page without needing a border.',
  'surface/input': 'Text fields, selects, textareas, date pickers in the booking and intake forms. Always pair with border/strong.',
  'surface/inverse': 'Not currently used in any built component — use case undecided.',
  'surface/disabled': 'Disabled buttons, unavailable appointment slots, locked form steps.',
  'surface/brand': 'Active/selected-state indicator on the nav link underline bar — navigation, dropdown menu, footer nav links.',
  'surface/brand-subtle': 'Badge background (Type=brand) and icon-frame background for cards.',
  'surface/accent': 'Not currently used in any built component — reserved for a future editorial/feature-panel use.',
  'surface/accent-subtle': 'Badge background (Type=accent), feature card label-chip background.',
  'surface/action': 'Primary buttons — "Book an appointment", "Start intake". In Supplement mode, aliases flora/300 as that line\'s primary CTA colour.',
  'surface/action-hover': 'Hover state on primary buttons.',
  'surface/action-pressed': 'Active and pressed state on primary buttons.',
  'surface/success': 'Booking confirmed panels, "request received" states, saved-intake banners. Also the background colour of the success badge.',
  'surface/warning': 'Out-of-state logistics notices, "call to confirm availability" strips. Also the background colour of the warning badge.',
  'surface/error': 'Form validation summaries, failed submission banners. Also the background colour of the error badge.',
  'surface/info': 'Cash-pay policy notes, what-to-bring callouts, first-visit and telehealth explainers. Also the background colour of the info badge.',
  'surface/overlay': 'Scrim behind modals and the mobile navigation drawer. Warm-tinted to match neutral/950.',
  'surface/decorative': 'Illustration fills, image mattes, mascot colourways, decorative shapes behind content. The Sand brand value. Shape fill only — never text or borders.',
  'surface/hover': 'Hover state on nav items, dropdown items, secondary/plain buttons, and text field inputs.',
  'surface/selected':
    'Selected state — the chosen condition card, active filter chip, current step in the intake flow. Stronger than surface/brand-subtle so selection reads as a deliberate act rather than a highlight.',

  'border/subtle':
    'Dividers between list items, table row rules, section separators — decorative, carries no information. Also the outer edge of the dropdown panel (simple list, mega menu), where it acts as a structural boundary rather than a decorative divider.',
  'border/default':
    'Card outlines, non-interactive container edges, and Text Field\'s default (resting) border. On Text Field, this is currently the only visual cue that the control is interactive until hover/focus takes over — flagged as in tension with border tokens generally not being the sole indicator of an interactive control, not yet resolved.',
  'border/strong': 'Text Field\'s active-state border, Feature Card\'s hover-state border. Not yet used on checkboxes, radios, or selects — none of those components exist yet.',
  'border/focus':
    'Keyboard focus ring on every interactive element — 2px weight, 2px offset so the ring sits clear of the control against the page background. Implement as outline: 2px solid + outline-offset: 2px. Never removable, never flush.',
  'border/brand':
    'Secondary button outline (all states), badge border (Type=brand). Pair with text/brand for the label. Not yet used for filter chips, tab underlines, or condition-card outlines — none of those components exist yet.',
  'border/accent': 'Badge border (Type=accent), feature card label-chip border. Not yet used for pull-quote rules or treatment-card dividers — no such component exists yet.',
  'border/success': 'Badge border (Type=success). Not yet used as a confirmation-panel left rule — no such component exists yet.',
  'border/warning': 'Badge border (Type=warning). Not yet used as an advisory-panel left rule — no such component exists yet.',
  'border/error': 'Failed input field outline. Always paired with an icon and a message.',
  'border/info': 'Badge border (Type=info). Not yet used as an informational-callout left rule — no such component exists yet.',
};

export function cleanSemanticDescription(group: string, key: string, description: string): string {
  return SEMANTIC_DESCRIPTION_OVERRIDES[`${group}/${key}`] ?? description;
}

