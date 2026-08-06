// IMOC DS Token Exporter — runs in the Figma plugin sandbox (Plugin API), NOT the REST API.
// This is what makes token syncing work without an Enterprise plan: the Variables REST
// endpoint is Enterprise-gated, but figma.variables.* is available to plugins on any plan.
// Output shape matches Figma's own REST API response (`{ meta: { variables, variableCollections } }`)
// exactly, so scripts/lib/figma-transform.mjs can consume either one unmodified.

figma.showUI(__html__, { width: 340, height: 180 });

async function run() {
  try {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const variables = await figma.variables.getLocalVariablesAsync();

    const variableCollections = {};
    for (const c of collections) {
      variableCollections[c.id] = {
        id: c.id,
        name: c.name,
        key: c.key,
        modes: c.modes.map((m) => ({ modeId: m.modeId, name: m.name })),
        defaultModeId: c.defaultModeId,
      };
    }

    const variablesOut = {};
    for (const v of variables) {
      variablesOut[v.id] = {
        id: v.id,
        name: v.name,
        key: v.key,
        variableCollectionId: v.variableCollectionId,
        resolvedType: v.resolvedType,
        valuesByMode: v.valuesByMode,
        scopes: v.scopes,
        codeSyntax: v.codeSyntax,
        description: v.description,
        hiddenFromPublishing: v.hiddenFromPublishing,
      };
    }

    const payload = { meta: { variables: variablesOut, variableCollections } };
    figma.ui.postMessage({ type: 'export-ready', payload, count: variables.length });
  } catch (err) {
    figma.ui.postMessage({ type: 'export-error', message: err.message });
  }
}

run();
