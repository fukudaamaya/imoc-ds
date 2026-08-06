export interface ChangelogEntry {
  tokenName: string;
  collection: string;
  oldValue: string | null;
  newValue: string | null;
  date: string;
  status: 'added' | 'changed' | 'removed';
}

// Eagerly bundles every dated diff file — new syncs just need to drop a new file in
// changelog/diffs/, nothing here needs to change.
const modules = import.meta.glob('../../changelog/diffs/*.json', { eager: true }) as Record<
  string,
  { default: ChangelogEntry[] }
>;

export function allChangelogEntries(): ChangelogEntry[] {
  const files = Object.keys(modules).sort().reverse(); // newest date first
  return files.flatMap((f) => modules[f].default);
}
