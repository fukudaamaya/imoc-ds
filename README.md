# IMOC DS
 
Design system for Integrative Medicine OC — token pipeline ([Style Dictionary](https://styledictionary.com/)) and living documentation ([Storybook](https://storybook.js.org/)), synced from the [IMOC DS Figma file](https://www.figma.com/file/83u6tgRpNEq3yYZetZBpQ9).
 
Live docs: deployed via Vercel on every push to `master`.
 
## What's here
 
- **`tokens/`** — source of truth for design tokens, synced from Figma variables
  - `primitives.json` — colour ramps, type families, spacing scale, radius scale (single mode)
  - `color.json` — semantic text/surface/border tokens, aliased to primitives (single "Clinic" mode)
  - `dimensions.json` — type scale, semantic spacing, semantic radius, layout (Mobile + Web modes)
- **`style-dictionary/`** — build pipeline that turns `tokens/*.json` into consumable output
- **`build/css/`** — generated CSS custom properties (`_root.css` for web defaults, `_mobile.css` as a `[data-platform="mobile"]` override)
- **`stories/`** — Storybook pages documenting the system (Overview, Colors, Typography, Spacing, Accessibility, Changelog)
- **`figma-plugin/`** — companion Figma plugin (IMOC DS Token Exporter) used to export variables from Figma when the REST Variables API isn't available on plan
- **`scripts/sync-figma.mjs`** — pulls live Figma variables, diffs against `tokens/*.json`, writes a dated changelog entry, updates the token JSON
- **`changelog/diffs/`** — dated JSON diffs from each Figma sync, feeding the Changelog Storybook page
- **`CHANGELOG.md`** — human-readable summary of token changes, prepended by `sync-figma`
## Token architecture
 
Two independent mode axes, intentionally kept separate rather than collapsed into one:
 
- **Colour mode** — theme axis. Currently only "Clinic" is defined; a future "Supplement" mode will activate the `flora` primitive ramp.
- **Web/Mobile mode** — dimension axis, applied to typography, spacing, radius, and layout only. Colour does not vary by platform.
Semantic tokens use property-first naming (no `color/` prefix) — see individual token descriptions in `tokens/*.json` for usage rules, including accessibility guardrails on `border/default` vs `border/strong`.
 
## Setup
 
```bash
npm install
```
 
## Scripts
 
| Command | What it does |
|---|---|
| `npm run tokens:build` | Builds `build/css/tokens.css` from `tokens/*.json` |
| `npm run sync-figma` | Pulls latest Figma variables and updates `tokens/*.json` + changelog (see below) |
| `npm run storybook` | Runs Storybook locally at `localhost:6006` |
| `npm run build-storybook` | Builds tokens, then builds static Storybook (what Vercel runs) |
| `npm run typecheck` | TypeScript check, no emit |
 
### Syncing tokens from Figma
 
Two ways to pull the live Figma variables, depending on plan:
 
```bash
# Any Figma plan — export via the companion plugin first (Figma → Plugins → Development →
# Import plugin from manifest… → figma-plugin/manifest.json → Run), then:
npm run sync-figma -- --from-file figma-variables-export.json
 
# Enterprise plans only (Variables REST API access):
FIGMA_ACCESS_TOKEN=... npm run sync-figma
```
 
Add `--dry-run` to either mode to preview the diff without writing anything.
 
## Deployment
 
Vercel builds `npm run build-storybook` and serves `storybook-static/` on every push to `master`. See `vercel.json`.
 
## Contributing
 
Maya Allister is the sole designer and maintainer. This system serves the IMOC Clinic product line today; a Supplement line extension (Colour mode + `flora` primitive activation) is planned.
 
