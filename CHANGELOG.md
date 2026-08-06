# Changelog

Token changes are tracked automatically by `npm run sync-figma`. Each run diffs the live
Figma variables against `tokens/*.json`, writes a dated diff to `changelog/diffs/`, updates
the token JSON, and prepends a summary here. See the **Changelog** page in Storybook for a
filterable, browsable version of the same data.

## 2026-08-06 — Initial sync

Initial import from the IMOC DS Figma file (`83u6tgRpNEq3yYZetZBpQ9`). 188 tokens added across
3 collections:

- **Primitives** (75) — color ramps (ocean, earth, flora, neutral, success, warning, error,
  info), type families, spacing scale, radius scale. Single "Value" mode.
- **Colour** (46) — semantic text/surface/border tokens, aliased to Primitives. Single
  "Clinic" mode — no Mobile/Web variance.
- **Dimensions** (67) — type scale, semantic spacing, semantic radius, layout. Mobile + Web
  modes.

Full diff: [changelog/diffs/2026-08-06.json](changelog/diffs/2026-08-06.json)
