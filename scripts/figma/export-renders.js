// IMOC DS — component render exporter.
//
// Runs inside Figma's plugin context, like export-components.js. Exports each variant of
// the listed component sets as a PNG (2x, capped at 1600px wide) and returns
// { "<variant node id>": "<base64 png>" }. scripts/figma/write-renders.py decodes that
// into stories/assets/components/<component>/<variant-id>.png.
//
// Set SETS to the component-set ids to export (see COMPONENTS in export-components.js).

const SETS = ['9149:99'];

const out = {};
for (const id of SETS) {
  const set = await figma.getNodeByIdAsync(id);
  if (!set) throw new Error(`Node ${id} not found`);
  const kids = set.type === 'COMPONENT_SET' ? set.children : [set];
  for (const v of kids) {
    if (v.type !== 'COMPONENT') continue;
    const scale = Math.min(2, 1600 / v.width);
    const bytes = await v.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: scale } });
    out[v.id] = figma.base64Encode(bytes);
  }
}
return out;
