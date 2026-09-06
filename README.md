# Scale of Wealth

A data update of [Wealth, shown to scale](https://eattherichtextformat.github.io/1-pixel-wealth/), checked September 6, 2026. The original layout, typography, colors, scrolling, and zoom interaction are retained. English and German examples, proportional blocks, counters, and charts use the updated figures.

## Data

[`data/snapshot-2026-09-06.json`](data/snapshot-2026-09-06.json) records the inputs, source links, and calculations. The English and German update files record the corresponding callouts. Dates are included in the page: individual wealth estimates are from September 6, 2026; the latest complete Forbes 400 list is the 2025 edition, valued September 1, 2025; other measures use their latest available reporting periods.

The scale remains **$1,000 per square pixel**. Lifetime earnings illustrations assume 40 years at a constant annual wage, before tax and without investment returns. Grants and multi-year funding examples are explicit illustrations, not estimates of guaranteed outcomes. The final five-item bundle totals $1.7474 trillion, or about 26.5% of $6.6 trillion, leaving $4.8526 trillion. It excludes the separate poverty grant and the smaller household payment to avoid double counting.

Run `python3 scripts/verify-data.py` to check the monetary areas, chart proportions, translations, and final-bundle arithmetic.

## Source and license

The files in `public/` were originally copied byte-for-byte from
[`eattherichtextformat/1-pixel-wealth`](https://github.com/eattherichtextformat/1-pixel-wealth)
at published `gh-pages` commit `774183b6bc9193757b3d8d957f359fa61b1e71c0`, including its German translation,
images, styles, scripts, metadata, and original analytics configuration. This version updates the data and examples in that presentation.

Original project by [Matt Korostoff](https://github.com/mkorostoff/1-pixel-wealth),
with the changes and translations in the referenced fork. The original GNU GPL v3
license is retained at [`public/LICENSE.txt`](public/LICENSE.txt). Historical class names and translation keys remain so that the original layout and interaction code keep working.

## Deployment

Vercel serves `public/` directly. `vercel.json` selects the static-site preset,
disables dependency installation and compilation, and sets the output directory.
Pushing to `main` triggers the connected Vercel production deployment.

## Local preview

Run `python3 -m http.server 8000 --directory public`, then open
`http://localhost:8000/`.
