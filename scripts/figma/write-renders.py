"""Decode the output of export-renders.js into stories/assets/components/.

Usage: python3 scripts/figma/write-renders.py <renders.json>

<renders.json> is the object export-renders.js returns (or the raw figma_execute result
wrapping it under "result"). Each variant is written to
stories/assets/components/<component-key>/<variant-id>.png, where the component key and
variant ids come from components/components.json.
"""

import base64
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]

data = json.loads(pathlib.Path(sys.argv[1]).read_text())
renders = data.get("result", data)
renders = renders.get("renders", renders)

components = json.loads((ROOT / "components/components.json").read_text())
owner = {
    v["id"]: key
    for key, comp in components.items()
    for s in comp["sets"]
    for v in s["variants"]
}

for node_id, b64 in renders.items():
    key = owner.get(node_id)
    if key is None:
        sys.exit(f"{node_id} is not in components/components.json — re-run export-components.js first")
    path = ROOT / "stories/assets/components" / key / f"{node_id.replace(':', '-')}.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(base64.b64decode(b64))
    print(path.relative_to(ROOT))
