// Shared with style-dictionary/build.mjs conceptually, but operates on live Figma REST API
// variable data instead of our own tokens/*.json — this is what turns a raw
// `GET /v1/files/:key/variables/local` response into the same shape tokens/*.json already
// uses. Mode IDs are resolved by NAME (not hardcoded), so this survives the file being
// re-organized in Figma as long as collection/mode names stay the same.

export function findCollectionByName(collections, name) {
  const match = Object.values(collections).find((c) => c.name.toLowerCase() === name.toLowerCase());
  if (!match) throw new Error(`No variable collection named "${name}" found in this Figma file.`);
  return match;
}

export function findModeIdByName(collection, name) {
  const mode = collection.modes.find((m) => m.name.toLowerCase() === name.toLowerCase());
  if (!mode) throw new Error(`Collection "${collection.name}" has no mode named "${name}".`);
  return mode.modeId;
}

function toHex(c) {
  const r = Math.round(c.r * 255),
    g = Math.round(c.g * 255),
    b = Math.round(c.b * 255);
  const hex = (n) => n.toString(16).padStart(2, '0');
  if (c.a === undefined || c.a === 1) return `#${hex(r)}${hex(g)}${hex(b)}`;
  return `#${hex(r)}${hex(g)}${hex(b)}${hex(Math.round(c.a * 255))}`;
}

function toRgba(c) {
  return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${+c.a.toFixed(2)})`;
}

function round(n) {
  return typeof n === 'number' ? Math.round(n * 100) / 100 : n;
}

function codeSyntaxOf(v) {
  return v.codeSyntax?.WEB ?? `--imoc-${v.name.replace(/\//g, '-')}`;
}

/** Builds tokens/primitives.json's shape from the Primitives collection. */
export function buildPrimitives(variables, collection) {
  const modeId = collection.modes[0].modeId; // Primitives has a single "Value" mode
  const out = { color: {}, typography: { family: {} }, spacing: {}, radius: {} };

  for (const v of Object.values(variables)) {
    if (v.variableCollectionId !== collection.id) continue;
    const [group, step] = v.name.split('/');
    const meta = { description: v.description, figma: { id: v.id, collection: collection.name, codeSyntax: codeSyntaxOf(v) } };
    const raw = v.valuesByMode[modeId];

    if (v.resolvedType === 'COLOR') {
      out.color[group] = out.color[group] || {};
      out.color[group][step] = { value: toHex(raw), type: 'color', ...meta };
    } else if (v.resolvedType === 'STRING' && group === 'family') {
      out.typography.family[step] = { value: raw, type: 'fontFamily', ...meta };
    } else if (v.resolvedType === 'FLOAT' && group === 'space') {
      out.spacing[step] = { value: round(raw), type: 'dimension', unit: 'px', ...meta };
    } else if (v.resolvedType === 'FLOAT' && group === 'radius') {
      out.radius[step] = { value: round(raw), type: 'dimension', unit: 'px', ...meta };
    }
  }
  return out;
}

/** Builds tokens/color.json's shape from the Colour collection (semantic, single mode). */
export function buildColor(variables, collection, primitivesById) {
  const modeId = collection.modes[0].modeId;
  const out = {};

  for (const v of Object.values(variables)) {
    if (v.variableCollectionId !== collection.id) continue;
    const [group, ...rest] = v.name.split('/');
    const key = rest.join('-');
    const raw = v.valuesByMode[modeId];
    out[group] = out[group] || {};

    const base = {
      type: 'color',
      scopes: v.scopes ?? [],
      description: v.description,
      figma: { id: v.id, collection: collection.name, mode: collection.modes[0].name, codeSyntax: codeSyntaxOf(v) },
    };

    if (raw && raw.type === 'VARIABLE_ALIAS') {
      const target = primitivesById.get(raw.id);
      if (!target) throw new Error(`Unresolved alias in ${v.name}: ${raw.id}`);
      out[group][key] = {
        value: toHex(target.valuesByMode[Object.keys(target.valuesByMode)[0]]),
        alias: `{color.primitive.${target.name.split('/')[0]}.${target.name.split('/')[1]}}`,
        aliasOf: target.name,
        ...base,
      };
    } else {
      out[group][key] = { value: toRgba(raw), alias: null, aliasOf: null, ...base };
    }
  }
  return out;
}

/** Builds tokens/dimensions.json's shape from the Dimensions collection (Mobile + Web modes). */
export function buildDimensions(variables, collection, allById) {
  const mobileModeId = findModeIdByName(collection, 'Mobile');
  const webModeId = findModeIdByName(collection, 'Web');
  const out = { typography: {}, spacing: {}, radius: {}, layout: {} };

  function resolve(raw) {
    if (raw && raw.type === 'VARIABLE_ALIAS') {
      const target = allById.get(raw.id);
      if (!target) throw new Error(`Unresolved dimension alias: ${raw.id}`);
      const val = Object.values(target.valuesByMode)[0];
      const inner = resolve(val);
      return { value: round(inner.value ?? val), aliasOf: target.name };
    }
    return { value: round(raw), aliasOf: null };
  }

  for (const v of Object.values(variables)) {
    if (v.variableCollectionId !== collection.id) continue;
    const parts = v.name.split('/');
    const mobileR = resolve(v.valuesByMode[mobileModeId]);
    const webR = resolve(v.valuesByMode[webModeId]);
    const base = { description: v.description, figma: { id: v.id, collection: collection.name, codeSyntax: codeSyntaxOf(v) } };

    if (parts[0] === 'type') {
      const [, style, prop] = parts;
      out.typography[style] = out.typography[style] || {};
      out.typography[style][prop] = {
        mobile: mobileR.value,
        web: webR.value,
        ...(mobileR.aliasOf ? { aliasOf: mobileR.aliasOf } : {}),
        type: prop === 'family' ? 'fontFamily' : prop === 'weight' ? 'fontWeight' : 'dimension',
        ...base,
      };
    } else if (parts[0] === 'spacing') {
      out.spacing[parts[1]] = {
        mobile: mobileR.value,
        web: webR.value,
        ...(mobileR.aliasOf ? { mobileAliasOf: mobileR.aliasOf } : {}),
        ...(webR.aliasOf ? { webAliasOf: webR.aliasOf } : {}),
        type: 'dimension',
        unit: 'px',
        ...base,
      };
    } else if (parts[0] === 'radius') {
      out.radius[parts[1]] = {
        mobile: mobileR.value,
        web: webR.value,
        ...(mobileR.aliasOf ? { aliasOf: mobileR.aliasOf } : {}),
        type: 'dimension',
        unit: 'px',
        ...base,
      };
    } else if (parts[0] === 'layout') {
      out.layout[parts[1]] = { mobile: mobileR.value, web: webR.value, type: 'dimension', unit: 'px', ...base };
    }
  }
  return out;
}

export function transformFigmaVariables(apiResponse) {
  const { variables, variableCollections } = apiResponse.meta;
  const primitivesCollection = findCollectionByName(variableCollections, 'Primitives');
  const colourCollection = findCollectionByName(variableCollections, 'Colour');
  const dimensionsCollection = findCollectionByName(variableCollections, 'Dimensions');

  const primitivesById = new Map(
    Object.values(variables)
      .filter((v) => v.variableCollectionId === primitivesCollection.id)
      .map((v) => [v.id, v]),
  );
  const allById = new Map(Object.values(variables).map((v) => [v.id, v]));

  return {
    primitives: buildPrimitives(variables, primitivesCollection),
    color: buildColor(variables, colourCollection, primitivesById),
    dimensions: buildDimensions(variables, dimensionsCollection, allById),
  };
}
