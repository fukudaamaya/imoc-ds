import StyleDictionary from 'style-dictionary';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  expandMode,
  cssValue,
  GENERATED_BANNER_CSS,
} from './lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TOKENS = join(ROOT, 'tokens');

const primitives = JSON.parse(readFileSync(join(TOKENS, 'primitives.json'), 'utf-8'));
const color = JSON.parse(readFileSync(join(TOKENS, 'color.json'), 'utf-8'));
const dimensions = JSON.parse(readFileSync(join(TOKENS, 'dimensions.json'), 'utf-8'));

mkdirSync(join(ROOT, 'build/css'), { recursive: true });

// ---------------------------------------------------------------------------
// Token trees
// ---------------------------------------------------------------------------

// Full tree, Web mode for the Dimensions collection — this is the CSS :root default.
const webTree = {
  color: { primitive: primitives.color, ...color },
  typography: { family: primitives.typography.family, ...expandMode(dimensions.typography, 'web') },
  spacing: { primitive: primitives.spacing, semantic: expandMode(dimensions.spacing, 'web') },
  radius: { primitive: primitives.radius, semantic: expandMode(dimensions.radius, 'web') },
  layout: expandMode(dimensions.layout, 'web'),
};

// Dimensions-only, Mobile mode — CSS [data-platform="mobile"] override. Color collection
// has a single "Clinic" mode (no platform variance), so it's intentionally excluded here.
const mobileOverrideTree = {
  typography: expandMode(dimensions.typography, 'mobile'),
  spacing: { semantic: expandMode(dimensions.spacing, 'mobile') },
  radius: { semantic: expandMode(dimensions.radius, 'mobile') },
  layout: expandMode(dimensions.layout, 'mobile'),
};


// ---------------------------------------------------------------------------
// CSS formats
// ---------------------------------------------------------------------------

function cssLines(allTokens) {
  return allTokens
    .filter((t) => t.figma?.codeSyntax)
    .map((t) => `  ${t.figma.codeSyntax}: ${cssValue(t)};`)
    .join('\n');
}

StyleDictionary.registerFormat({
  name: 'css/imoc-root',
  format: ({ dictionary }) =>
    `${GENERATED_BANNER_CSS}\n:root {\n${cssLines(dictionary.allTokens)}\n}\n`,
});

StyleDictionary.registerFormat({
  name: 'css/imoc-mobile-override',
  format: ({ dictionary }) =>
    `\n/* Mobile-mode overrides — Dimensions collection only (Colour has a single mode) */\n[data-platform="mobile"] {\n${cssLines(
      dictionary.allTokens,
    )}\n}\n`,
});

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

// Token names collide by design here (e.g. every color scale ends in "/50") because our
// custom formats key off `figma.codeSyntax`, not SD's auto-generated `token.name` — so the
// name-collision warning is expected noise, not a real problem. Silenced below.
const sharedLog = { verbosity: 'silent', warnings: 'disabled' };

const sdWeb = new StyleDictionary({
  tokens: webTree,
  log: sharedLog,
  platforms: {
    css: {
      transforms: [],
      buildPath: 'build/css/',
      files: [{ destination: '_root.css', format: 'css/imoc-root' }],
    },
  },
});

const sdMobile = new StyleDictionary({
  tokens: mobileOverrideTree,
  log: sharedLog,
  platforms: {
    css: {
      transforms: [],
      buildPath: 'build/css/',
      files: [{ destination: '_mobile.css', format: 'css/imoc-mobile-override' }],
    },
  },
});


await sdWeb.hasInitialized;
await sdMobile.hasInitialized;

const [rootCss] = await sdWeb.formatPlatform('css');
const [mobileCss] = await sdMobile.formatPlatform('css');

const { writeFileSync } = await import('node:fs');
writeFileSync(join(ROOT, 'build/css/tokens.css'), rootCss.output + '\n' + mobileCss.output);
console.log('✔ build/css/tokens.css');

console.log('\nStyle Dictionary build complete.');
