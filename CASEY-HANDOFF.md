# Acreage Position Map — Handoff (adding evaluation targets)

Live site: https://jcobb805.github.io/acreage-position-map/  (password: `RF2026!`)

The map data is **encrypted** in the repo (`data.enc`). The plaintext (`data.json`) is
never committed. To add or remove a deal under evaluation you: decrypt → edit → re-encrypt → push.
GitHub Pages redeploys automatically within ~1 minute.

## One-time setup (Mac mini)

1. Install **Node.js** (LTS) — https://nodejs.org  (the crypto tool uses Node's built-in
   `crypto`, so there's nothing to `npm install`).
2. Clone the repo:
   ```bash
   git clone https://github.com/jcobb805/acreage-position-map.git
   cd acreage-position-map
   ```
3. Decrypt the working data once:
   ```bash
   PW='RF2026!' node crypto-tool.js decrypt data.enc data.json
   ```
   `data.json` is gitignored, so it stays local — it will never be committed by accident.

## Adding / editing an evaluation target

Open `data.json` and find the `"deals"` object. Each deal is one colored, toggleable
layer on the map. Format:

```json
"deals": {
  "VEX – Red Fork": { "color": "#e84393", "sections": { "5-20N-19W": 692, "8-20N-19W": 640 } },
  "Anthony Moore":  { "color": "#c0392b", "sections": { "12-15N-20W": 640 } }
}
```

- **Key** = the name shown on the legend pill (under "EVALUATING").
- **color** = any hex color (give each new deal its own).
- **sections** = `"<sec>-<twp>N-<rng>W": <net acres>` for every tract. Section/township/range
  in the standard STR format used everywhere else on the map.

To **add** a target, add a new entry. To **remove** one when the deal is dead, delete its entry.

> If a section isn't already on the map grid it will still show (it's pulled from the data),
> but if you add tracts in a brand-new area far outside NW Oklahoma and the section outline
> doesn't render, send the STR list to Josh — the BLM polygon may need to be fetched.

## Publish

```bash
PW='RF2026!' node crypto-tool.js encrypt data.json data.enc
git add data.enc
git commit -m "Update evaluation targets"
git push
```

Wait ~1 min, hard-refresh the live site, enter the password, and the new pill appears.

## Notes
- **Only `data.enc` gets committed.** Never `git add data.json` (it's the plaintext — and it's
  already gitignored so git won't pick it up).
- `redfork.enc` / the Red Fork overlay are static — you don't touch them to add deals.
- Same password (`RF2026!`) for the tool and the website.
- Questions on wells, acreage refreshes, or the Red Fork overlay → Josh.