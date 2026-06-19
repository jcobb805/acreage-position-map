# Acreage Position Map

Interactive map of acreage positions for **Cinco, OLS, OE, Cherokee Moon** and rotating deals under evaluation, with a wells layer (PDP / DUC / Spud / Permitted-Proposed) and a georeferenced **CLR Red Fork analysis** overlay (geo pay heatmap, drainage radii, horizontal locations; CLR op wells removed).

- `index.html` — self-contained dashboard (Leaflet)
- `data.json` — entity ownership by section, section geometry (BLM PLSS), wells
- `redfork_overlay.webp` — georeferenced Red Fork analysis overlay

## Adding a deal under evaluation
Edit `data.json` → `"deals"`:
```json
"deals": { "Project X": { "sections": ["12-14N-20W","13-14N-20W"] } }
```
A magenta toggle pill appears automatically. Sections must exist in `data.json.sections`.
