// Flattens a tokens/*.json-shaped tree to {name, collection, value} leaves, then diffs two
// snapshots (old vs freshly-fetched) into changelog entries. A leaf is any object carrying
// `value`, or both `mobile` and `web`. Value and description are diffed independently (tagged
// via `field`) since Figma lets either change without the other — a description-only edit
// (usage guidance, aliasing notes) should still surface in the changelog.

function isLeaf(node) {
  return node && typeof node === 'object' && ('value' in node || ('mobile' in node && 'web' in node));
}

function formatLeaf(leaf) {
  if ('value' in leaf) return `${leaf.value}${leaf.unit === 'px' ? 'px' : ''}`;
  const unit = leaf.unit === 'px' ? 'px' : '';
  return `mobile: ${leaf.mobile}${unit}, web: ${leaf.web}${unit}`;
}

function valueEqual(a, b) {
  if ('value' in a) return a.value === b.value;
  return a.mobile === b.mobile && a.web === b.web;
}

function descriptionOf(leaf) {
  return leaf.description ?? '';
}

function flatten(tree, collectionName, path = []) {
  const out = new Map(); // tokenName -> leaf
  function walk(node, path) {
    if (isLeaf(node)) {
      out.set(path.join('/'), node);
      return;
    }
    if (node && typeof node === 'object') {
      for (const key of Object.keys(node)) walk(node[key], [...path, key]);
    }
  }
  walk(tree, path);
  return out;
}

/**
 * @param {{primitives: object, color: object, dimensions: object}} oldTokens
 * @param {{primitives: object, color: object, dimensions: object}} newTokens
 * @param {string} date - YYYY-MM-DD
 */
export function diffTokens(oldTokens, newTokens, date) {
  const entries = [];
  const collectionMap = { primitives: 'Primitives', color: 'Colour', dimensions: 'Dimensions' };

  for (const [key, collectionName] of Object.entries(collectionMap)) {
    const oldFlat = flatten(oldTokens[key], collectionName);
    const newFlat = flatten(newTokens[key], collectionName);
    const names = new Set([...oldFlat.keys(), ...newFlat.keys()]);

    for (const name of names) {
      const before = oldFlat.get(name);
      const after = newFlat.get(name);

      if (before && !after) {
        entries.push({ tokenName: name, collection: collectionName, field: 'value', oldValue: formatLeaf(before), newValue: null, date, status: 'removed' });
      } else if (!before && after) {
        entries.push({ tokenName: name, collection: collectionName, field: 'value', oldValue: null, newValue: formatLeaf(after), date, status: 'added' });
      } else {
        if (!valueEqual(before, after)) {
          entries.push({
            tokenName: name,
            collection: collectionName,
            field: 'value',
            oldValue: formatLeaf(before),
            newValue: formatLeaf(after),
            date,
            status: 'changed',
          });
        }
        if (descriptionOf(before) !== descriptionOf(after)) {
          entries.push({
            tokenName: name,
            collection: collectionName,
            field: 'description',
            oldValue: descriptionOf(before),
            newValue: descriptionOf(after),
            date,
            status: 'changed',
          });
        }
      }
    }
  }

  return entries;
}
