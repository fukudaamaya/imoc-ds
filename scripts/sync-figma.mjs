#!/usr/bin/env node
// Pulls the live Figma variables for IMOC DS, diffs them against tokens/*.json, writes a
// dated changelog entry, prepends a summary to CHANGELOG.md, and overwrites tokens/*.json.
//
// Two ways to get the source data — pick whichever matches your Figma plan:
//
//   1. --from-file (works on ANY plan, no token needed). The Variables REST endpoint is
//      Enterprise-only, but the Plugin API (figma.variables.*) isn't — it's available to
//      plugins on every plan. Run the companion plugin in figma-plugin/ (Figma → Plugins →
//      Development → Import plugin from manifest… → figma-plugin/manifest.json → Run), which
//      exports figma-variables-export.json in the same shape the REST API returns. Then:
//        npm run sync-figma -- --from-file figma-variables-export.json
//
//   2. Live REST fetch (Enterprise plans only — needs FIGMA_ACCESS_TOKEN):
//        FIGMA_ACCESS_TOKEN=... npm run sync-figma
//
// Add --dry-run to either mode to see the diff without writing anything.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { transformFigmaVariables } from './lib/figma-transform.mjs';
import { diffTokens } from './lib/diff.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TOKENS_DIR = join(ROOT, 'tokens');
const CHANGELOG_DIR = join(ROOT, 'changelog', 'diffs');
const CHANGELOG_MD = join(ROOT, 'CHANGELOG.md');

const FILE_KEY = '83u6tgRpNEq3yYZetZBpQ9';
const DRY_RUN = process.argv.includes('--dry-run');

function today() {
  return new Date().toISOString().slice(0, 10);
}

function readCurrentTokens() {
  const read = (name) => JSON.parse(readFileSync(join(TOKENS_DIR, name), 'utf-8'));
  return {
    primitives: read('primitives.json'),
    color: read('color.json'),
    dimensions: read('dimensions.json'),
  };
}

async function fetchFigmaVariables(fileKey, token) {
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}/variables/local`, {
    headers: { 'X-Figma-Token': token },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Figma API request failed (${res.status}). ${
        res.status === 403
          ? 'The Variables REST API needs an Enterprise plan — if this file is on a lower plan, pull tokens through Figma Desktop + the figma-console MCP instead and call diffAndWrite() directly with the result.'
          : body
      }`,
    );
  }
  return res.json();
}

function summarize(entries) {
  const added = entries.filter((e) => e.status === 'added').length;
  const changed = entries.filter((e) => e.status === 'changed').length;
  const removed = entries.filter((e) => e.status === 'removed').length;
  return { added, changed, removed, total: entries.length };
}

function prependChangelog(date, summary, diffFilePath) {
  const existing = existsSync(CHANGELOG_MD) ? readFileSync(CHANGELOG_MD, 'utf-8') : '# Changelog\n\n';
  const [header, ...rest] = existing.split('\n\n');
  const relDiffPath = diffFilePath.replace(ROOT + '/', '');

  const entry = `## ${date} — Figma sync

${summary.added} added, ${summary.changed} changed, ${summary.removed} removed (${summary.total} tokens touched).

Full diff: [${relDiffPath}](${relDiffPath})`;

  const body = rest.join('\n\n');
  writeFileSync(CHANGELOG_MD, `${header}\n\n${entry}\n\n${body}`.trimEnd() + '\n');
}

export function diffAndWrite(newTokens, { dryRun = false } = {}) {
  const date = today();
  const oldTokens = readCurrentTokens();
  const entries = diffTokens(oldTokens, newTokens, date);

  if (entries.length === 0) {
    console.log('No token changes since last sync — nothing to write.');
    return { entries: [], summary: summarize([]) };
  }

  const summary = summarize(entries);
  console.log(`${summary.added} added, ${summary.changed} changed, ${summary.removed} removed.`);

  if (dryRun) {
    console.log('--dry-run: not writing files.');
    return { entries, summary };
  }

  mkdirSync(CHANGELOG_DIR, { recursive: true });
  const diffPath = join(CHANGELOG_DIR, `${date}.json`);
  const priorEntries = existsSync(diffPath) ? JSON.parse(readFileSync(diffPath, 'utf-8')) : [];
  writeFileSync(diffPath, JSON.stringify([...priorEntries, ...entries], null, 2) + '\n');
  console.log(`✔ ${diffPath}`);

  prependChangelog(date, summary, diffPath);
  console.log('✔ CHANGELOG.md');

  writeFileSync(join(TOKENS_DIR, 'primitives.json'), JSON.stringify(newTokens.primitives, null, 2) + '\n');
  writeFileSync(join(TOKENS_DIR, 'color.json'), JSON.stringify(newTokens.color, null, 2) + '\n');
  writeFileSync(join(TOKENS_DIR, 'dimensions.json'), JSON.stringify(newTokens.dimensions, null, 2) + '\n');
  console.log('✔ tokens/*.json updated');
  console.log('\nRun `npm run tokens:build` to regenerate build/css and build/dart.');

  return { entries, summary };
}

function parseFromFileArg() {
  const i = process.argv.indexOf('--from-file');
  if (i === -1) return null;
  const path = process.argv[i + 1];
  if (!path) throw new Error('--from-file needs a path, e.g. --from-file figma-variables-export.json');
  return path;
}

async function main() {
  const fromFile = parseFromFileArg();

  let apiResponse;
  if (fromFile) {
    const resolvedPath = join(ROOT, fromFile);
    if (!existsSync(resolvedPath)) {
      throw new Error(
        `${fromFile} not found. Run the exporter plugin in figma-plugin/ (Figma → Plugins → Development → Import plugin from manifest…) and move the downloaded file here.`,
      );
    }
    console.log(`Reading ${fromFile}…`);
    apiResponse = JSON.parse(readFileSync(resolvedPath, 'utf-8'));
  } else {
    const token = process.env.FIGMA_ACCESS_TOKEN;
    if (!token) {
      console.error(
        [
          'No source specified. Either:',
          '',
          '  1. Export via the Figma plugin (works on any plan, no token needed):',
          '       npm run sync-figma -- --from-file figma-variables-export.json',
          '     (see figma-plugin/ for the one-time plugin install)',
          '',
          '  2. Or fetch live via REST (Enterprise plans only):',
          '       FIGMA_ACCESS_TOKEN=your-token npm run sync-figma',
        ].join('\n'),
      );
      process.exit(1);
    }
    console.log(`Fetching variables for file ${FILE_KEY}…`);
    apiResponse = await fetchFigmaVariables(FILE_KEY, token);
  }

  const newTokens = transformFigmaVariables(apiResponse);
  diffAndWrite(newTokens, { dryRun: DRY_RUN });
}

// Only auto-run when invoked directly (`node scripts/sync-figma.mjs`), not when imported —
// keeps diffAndWrite()/transformFigmaVariables() usable from a REPL or another script.
// Comparing via pathToFileURL (not a raw `file://${...}` string) matters here specifically
// because this repo's path contains a space ("IMOC DS"), which import.meta.url percent-
// encodes but a naive string join on process.argv[1] does not — the two would never match.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
