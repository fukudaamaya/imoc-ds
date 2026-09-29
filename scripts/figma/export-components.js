// IMOC DS — component snapshot exporter.
//
// Runs inside Figma's plugin context (figma_execute via the Console MCP bridge, or pasted
// into a development plugin). Reads each documented component set and returns the JSON
// that lives at components/components.json: description, properties, and — per variant —
// the variables and text styles actually bound in the file.
//
// Only live bindings are recorded. A value that is hard-coded in Figma (not bound to a
// variable) does not appear here, so the Storybook pages can never claim a token is used
// where it isn't.
//
// To refresh: run this, write the returned object to components/components.json, then
// re-export renders with scripts/figma/export-renders.js.

const COMPONENTS = {
  badge: { page: 'Badge', sets: ['9149:442'] },
  button: { page: 'Buttons', sets: ['9149:99'] },
  breadcrumb: { page: 'Breadcrumb', sets: ['9241:3759', '9241:14215'] },
  'text-field': { page: 'Text Field', sets: ['9259:1911'] },
  'dropdown-menu': { page: 'Dropdown menu', sets: ['9209:2388', '9241:15329', '9241:15421'] },
  headers: { page: 'Headers', sets: ['9243:16580', '9243:16645'] },
  navigation: { page: 'Navigation', sets: ['9243:15552', '9241:14764', '9241:15211'] },
};

const varNames = {};
async function varName(id) {
  if (!(id in varNames)) {
    const v = await figma.variables.getVariableByIdAsync(id);
    varNames[id] = v ? v.name : null;
  }
  return varNames[id];
}
const styleNames = {};
async function styleName(id) {
  if (!id || typeof id !== 'string') return null;
  if (!(id in styleNames)) {
    const s = await figma.getStyleByIdAsync(id);
    styleNames[id] = s ? s.name : null;
  }
  return styleNames[id];
}

// Collapse Figma's per-side / per-corner properties into the names a developer reads.
const PROP_MAP = {
  topLeftRadius: 'radius', topRightRadius: 'radius', bottomLeftRadius: 'radius', bottomRightRadius: 'radius',
  paddingLeft: 'padding-x', paddingRight: 'padding-x', paddingTop: 'padding-y', paddingBottom: 'padding-y',
  itemSpacing: 'gap', counterAxisSpacing: 'row-gap', strokeWeight: 'border-width',
  strokeTopWeight: 'border-width', strokeBottomWeight: 'border-width',
  strokeLeftWeight: 'border-width', strokeRightWeight: 'border-width',
  minWidth: 'min-width', maxWidth: 'max-width', minHeight: 'min-height', maxHeight: 'max-height',
};
// Typography sub-bindings are redundant when the text style itself is applied.
const TYPE_SUBPROPS = ['fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'letterSpacing', 'paragraphSpacing'];
const SKIP = ['fills', 'strokes', 'effects', 'componentProperties'];

// Vector layers inside icon/indicator instances all carry the same colour — report them
// once, under the nearest meaningful ancestor.
function layerLabel(path) {
  const parts = path.filter((p) => !/^(Vector|Group|Union|Subtract|Ellipse \d*|Line \d*)$/i.test(p));
  return parts.join(' / ') || '(root)';
}

async function collect(node, path, out) {
  const bv = node.boundVariables || {};
  const hasTextStyle = node.type === 'TEXT' && typeof node.textStyleId === 'string' && node.textStyleId;
  for (const [prop, val] of Object.entries(bv)) {
    if (SKIP.includes(prop)) continue;
    if (hasTextStyle && TYPE_SUBPROPS.includes(prop)) continue;
    const arr = Array.isArray(val) ? val : [val];
    for (const a of arr) if (a && a.id) out.push([layerLabel(path), PROP_MAP[prop] || prop, await varName(a.id)]);
  }
  if (Array.isArray(node.fills))
    for (const f of node.fills)
      if (f.visible !== false && f.boundVariables && f.boundVariables.color)
        out.push([layerLabel(path), node.type === 'TEXT' ? 'color' : 'fill', await varName(f.boundVariables.color.id)]);
  if (Array.isArray(node.strokes))
    for (const f of node.strokes)
      if (f.visible !== false && f.boundVariables && f.boundVariables.color)
        out.push([layerLabel(path), 'border', await varName(f.boundVariables.color.id)]);
  if (hasTextStyle) out.push([layerLabel(path), 'text-style', await styleName(node.textStyleId)]);
  if ('effectStyleId' in node && node.effectStyleId) out.push([layerLabel(path), 'effect', await styleName(node.effectStyleId)]);
  if ('children' in node) for (const c of node.children) if (c.visible) await collect(c, [...path, c.name], out);
}

function props(set) {
  return Object.entries(set.componentPropertyDefinitions).map(([key, d]) => ({
    name: key.replace(/#.*$/, ''),
    type: d.type,
    options: d.type === 'VARIANT' ? d.variantOptions : undefined,
    default: d.type === 'VARIANT' ? undefined : d.defaultValue,
  }));
}

const result = {};
for (const [key, cfg] of Object.entries(COMPONENTS)) {
  const sets = [];
  for (const id of cfg.sets) {
    const set = await figma.getNodeByIdAsync(id);
    if (!set) throw new Error(`Node ${id} (${key}) not found`);
    const variants = [];
    const kids = set.type === 'COMPONENT_SET' ? set.children : [set];
    for (const v of kids) {
      if (v.type !== 'COMPONENT') continue;
      const raw = [];
      await collect(v, [], raw);
      const seen = new Set();
      const tokens = raw.filter(([l, p, t]) => t && !seen.has(`${l}|${p}|${t}`) && seen.add(`${l}|${p}|${t}`));
      variants.push({
        id: v.id,
        name: v.name,
        props: v.variantProperties || {},
        width: Math.round(v.width),
        height: Math.round(v.height),
        tokens: tokens.map(([layer, property, token]) => ({ layer, property, token })),
      });
    }
    sets.push({ id: set.id, name: set.name, description: set.description || '', properties: props(set), variants });
  }
  result[key] = { page: cfg.page, sets };
}
return result;
