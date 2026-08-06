import StyleDictionary from 'style-dictionary';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  expandMode,
  dartFieldName,
  toCamel,
  cssValue,
  dartColorLiteral,
  dartDoc,
  GENERATED_BANNER_CSS,
  GENERATED_BANNER_DART,
} from './lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TOKENS = join(ROOT, 'tokens');

const primitives = JSON.parse(readFileSync(join(TOKENS, 'primitives.json'), 'utf-8'));
const color = JSON.parse(readFileSync(join(TOKENS, 'color.json'), 'utf-8'));
const dimensions = JSON.parse(readFileSync(join(TOKENS, 'dimensions.json'), 'utf-8'));

mkdirSync(join(ROOT, 'build/css'), { recursive: true });
mkdirSync(join(ROOT, 'build/dart'), { recursive: true });

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

// Dart feeds the Flutter client — Mobile mode for dimensions, same colors as web (colors
// don't vary by platform). See CHANGELOG / build plan for why Mobile was chosen.
const dartTree = {
  color: { primitive: primitives.color, ...color },
  typography: { family: primitives.typography.family, ...expandMode(dimensions.typography, 'mobile') },
  spacing: { primitive: primitives.spacing, semantic: expandMode(dimensions.spacing, 'mobile') },
  radius: { primitive: primitives.radius, semantic: expandMode(dimensions.radius, 'mobile') },
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
// Dart formats
// ---------------------------------------------------------------------------

StyleDictionary.registerFormat({
  name: 'dart/imoc-colors',
  format: ({ dictionary }) => {
    const primitiveTokens = dictionary.allTokens.filter((t) => t.path[0] === 'color' && t.path[1] === 'primitive');
    const semanticTokens = dictionary.allTokens.filter((t) => t.path[0] === 'color' && t.path[1] !== 'primitive');

    const primitiveFields = primitiveTokens
      .map((t) => {
        const name = dartFieldName(t.path);
        return `${dartDoc(t.description)}  static const Color ${name} = ${dartColorLiteral(t.value)};`;
      })
      .join('\n\n');

    const semanticFields = semanticTokens
      .map((t) => {
        const name = dartFieldName(t.path);
        return `${dartDoc(t.description)}  static const Color ${name} = ${dartColorLiteral(t.value)};`;
      })
      .join('\n\n');

    return `${GENERATED_BANNER_DART}
import 'package:flutter/widgets.dart';

/// Primitive color ramps (ocean, earth, flora, neutral, success, warning, error, info).
/// Prefer [AppColors] (semantic) in product code — reach for these only for illustration,
/// data-vis, or building a new semantic token.
class AppColorPrimitives {
  AppColorPrimitives._();

${primitiveFields}
}

/// Semantic color tokens — text, surface, border. These are what product code should use.
class AppColors {
  AppColors._();

${semanticFields}
}
`;
  },
});

StyleDictionary.registerFormat({
  name: 'dart/imoc-typography',
  format: ({ dictionary }) => {
    const styles = {};
    for (const t of dictionary.allTokens) {
      if (t.path[0] !== 'typography' || t.path[1] === 'family') continue;
      const style = t.path[1];
      const prop = t.path[2];
      styles[style] = styles[style] || {};
      styles[style][prop] = t;
    }

    const getters = Object.entries(styles)
      .map(([style, props]) => {
        const name = toCamel(style);
        const fam = props.family?.value ?? 'Satoshi';
        const size = props.size?.value ?? 16;
        const weight = props.weight?.value ?? 400;
        const lineHeight = props['line-height']?.value ?? size;
        const letterSpacing = props['letter-spacing']?.value ?? 0;
        const desc = props.size?.description ?? '';
        // Flutter's TextStyle.height is a multiplier of fontSize, not an absolute px value.
        const heightMultiplier = (lineHeight / size).toFixed(3);
        return `${dartDoc(desc)}  static const TextStyle ${name} = TextStyle(
    fontFamily: '${fam}',
    fontSize: ${size},
    fontWeight: FontWeight.w${weight},
    height: ${heightMultiplier},
    letterSpacing: ${letterSpacing},
  );`;
      })
      .join('\n\n');

    return `${GENERATED_BANNER_DART}
import 'package:flutter/widgets.dart';

/// Text styles as live specimens — sizes/weights are Mobile-mode values from the
/// Dimensions collection. TextStyle.height is a multiplier of fontSize (Flutter convention),
/// computed here from the Figma line-height (px) / font size (px).
class AppTypography {
  AppTypography._();

${getters}
}
`;
  },
});

StyleDictionary.registerFormat({
  name: 'dart/imoc-spacing',
  format: ({ dictionary }) => {
    const section = (pathPrefix, className) => {
      const tokens = dictionary.allTokens.filter(
        (t) => t.path[0] === pathPrefix[0] && t.path[1] === pathPrefix[1],
      );
      const isPrimitiveScale = pathPrefix[1] === 'primitive';
      const fields = tokens
        .map((t) => {
          const last = t.path[t.path.length - 1];
          const name = isPrimitiveScale ? toCamel('scale', last) : toCamel(last);
          return `${dartDoc(t.description)}  static const double ${name} = ${t.value};`;
        })
        .join('\n\n');
      return `class ${className} {\n  ${className}._();\n\n${fields}\n}\n`;
    };

    const layoutTokens = dictionary.allTokens.filter((t) => t.path[0] === 'layout');
    const layoutFields = layoutTokens
      .map((t) => {
        const name = toCamel(t.path[t.path.length - 1]);
        return `${dartDoc(t.description)}  static const double ${name} = ${t.value};`;
      })
      .join('\n\n');

    return `${GENERATED_BANNER_DART}
/// Spacing, radius, and layout constants — Mobile-mode values from the Dimensions collection.
${section(['spacing', 'primitive'], 'AppSpacingScale')}
${section(['spacing', 'semantic'], 'AppSpacing')}
${section(['radius', 'primitive'], 'AppRadiusScale')}
${section(['radius', 'semantic'], 'AppRadius')}
class AppLayout {
  AppLayout._();

${layoutFields}
}
`;
  },
});

StyleDictionary.registerFormat({
  name: 'dart/imoc-theme',
  format: ({ dictionary }) => {
    const semanticColorTokens = dictionary.allTokens.filter(
      (t) => t.path[0] === 'color' && t.path[1] !== 'primitive',
    );
    const fieldNames = semanticColorTokens.map((t) => dartFieldName(t.path));

    const fields = fieldNames.map((n) => `  final Color ${n};`).join('\n');
    const ctorParams = fieldNames.map((n) => `    required this.${n},`).join('\n');
    const defaults = semanticColorTokens
      .map((t) => `      ${dartFieldName(t.path)}: AppColors.${dartFieldName(t.path)},`)
      .join('\n');
    const copyWithParams = fieldNames.map((n) => `    Color? ${n},`).join('\n');
    const copyWithBody = fieldNames.map((n) => `      ${n}: ${n} ?? this.${n},`).join('\n');
    const lerpBody = fieldNames
      .map((n) => `      ${n}: Color.lerp(${n}, other.${n}, t) ?? ${n},`)
      .join('\n');

    return `${GENERATED_BANNER_DART}
import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_typography.dart';

/// Semantic design tokens as a ThemeExtension — the rest of the app should read colors
/// through \`ImocDsTokens.of(context)\`, never through [AppColors] directly, so that a future
/// dark mode / alternate brand mode only has to change what's registered on [ThemeData].
@immutable
class ImocDsTokens extends ThemeExtension<ImocDsTokens> {
  const ImocDsTokens({
${ctorParams}
  });

${fields}

  factory ImocDsTokens.clinic() => const ImocDsTokens(
${defaults}
      );

  static ImocDsTokens of(BuildContext context) =>
      Theme.of(context).extension<ImocDsTokens>() ?? ImocDsTokens.clinic();

  @override
  ImocDsTokens copyWith({
${copyWithParams}
  }) {
    return ImocDsTokens(
${copyWithBody}
    );
  }

  @override
  ImocDsTokens lerp(ThemeExtension<ImocDsTokens>? other, double t) {
    if (other is! ImocDsTokens) return this;
    return ImocDsTokens(
${lerpBody}
    );
  }
}

ThemeData buildImocTheme() {
  final tokens = ImocDsTokens.clinic();
  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: tokens.surfaceBackground,
    colorScheme: ColorScheme.light(
      primary: tokens.surfaceAction,
      onPrimary: tokens.textOnFill,
      surface: tokens.surfaceCard,
      onSurface: tokens.textPrimary,
      error: tokens.surfaceError,
      onError: tokens.textOnFill,
    ),
    textTheme: TextTheme(
      displayLarge: AppTypography.display,
      headlineLarge: AppTypography.heading1,
      headlineMedium: AppTypography.heading2,
      headlineSmall: AppTypography.heading3,
      bodyLarge: AppTypography.bodyLarge,
      bodyMedium: AppTypography.bodyMedium,
      bodySmall: AppTypography.bodySmall,
      labelLarge: AppTypography.label,
    ),
    extensions: [tokens],
  );
}
`;
  },
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

const sdDart = new StyleDictionary({
  tokens: dartTree,
  log: sharedLog,
  platforms: {
    dart: {
      transforms: [],
      buildPath: 'build/dart/',
      files: [
        { destination: 'app_colors.dart', format: 'dart/imoc-colors' },
        { destination: 'app_typography.dart', format: 'dart/imoc-typography' },
        { destination: 'app_spacing.dart', format: 'dart/imoc-spacing' },
        { destination: 'app_theme.dart', format: 'dart/imoc-theme' },
      ],
    },
  },
});

await sdWeb.hasInitialized;
await sdMobile.hasInitialized;
await sdDart.hasInitialized;

const [rootCss] = await sdWeb.formatPlatform('css');
const [mobileCss] = await sdMobile.formatPlatform('css');

const { writeFileSync } = await import('node:fs');
writeFileSync(join(ROOT, 'build/css/tokens.css'), rootCss.output + '\n' + mobileCss.output);
console.log('✔ build/css/tokens.css');

await sdDart.buildAllPlatforms();

console.log('\nStyle Dictionary build complete.');
