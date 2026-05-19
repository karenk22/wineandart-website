# wineandart

A small daily-rotating site that showcases contemporary architecture at Bordeaux wineries — a different château every day, with notes on the estate, the architect, and what the building is trying to do.

## How it works

- `index.html` shows **today's** featured winery, chosen deterministically from the date so everyone sees the same one on a given day.
- `archive.html` shows every winery in the library, most-recently-featured first.
- `winery.html?id=<id>` is the permanent link for a single château.
- `wineries.json` is the entire content library — one JSON entry per winery.

The site is plain static HTML/CSS/JS. No build step. No backend. Hosted free on GitHub Pages.

## Add a new winery

Open `wineries.json` and add a new entry to the array:

```json
{
  "id": "short-slug",
  "name": "Château Example",
  "appellation": "Saint-Émilion Grand Cru",
  "architect": "Architect Name",
  "year": 2024,
  "image": "",
  "palette": ["#2a0708", "#5c0f1a"],
  "winery": "A short paragraph about the estate.",
  "architect_blurb": "A short paragraph about the architect.",
  "why": "A short paragraph about why this building, on this site, matters."
}
```

Commit and push — GitHub Pages will redeploy in about a minute and the new entry will start appearing in the daily rotation.

### Adding a photo (optional)

Leave `"image": ""` and the site renders a stylised gradient cover using the two `palette` colours. To use a real photo, set `"image"` to any image URL (or a local path like `"img/faugeres.jpg"` if you put a file in an `img/` folder at the repo root).

## Local preview

Open `index.html` directly in a browser, or run any static server from the repo root (for example `python3 -m http.server 8000`).
