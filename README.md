# Scale of Wealth

A data update of [Wealth, shown to scale](https://eattherichtextformat.github.io/1-pixel-wealth/), checked September 6, 2026. The original layout, typography, colors, monetary scale, and zoom are retained. English and German examples, proportional blocks, counters, and charts use the updated figures. Small reading controls make the longer journey easier to explore.

## Data

[`data/snapshot-2026-09-06.json`](data/snapshot-2026-09-06.json) records the inputs, source links, and calculations. The English and German update files record the corresponding callouts. Dates are included in the page: individual wealth estimates are from September 6, 2026; the latest complete Forbes 400 list is the 2025 edition, valued September 1, 2025; other measures use their latest available reporting periods.

The scale remains **$1,000 per square pixel**. Lifetime earnings illustrations assume 40 years at a constant annual wage, before tax and without investment returns. Grants and multi-year funding examples are explicit illustrations, not estimates of guaranteed outcomes. The final five-item bundle totals $1.7474 trillion, or about 26.5% of $6.6 trillion, leaving $4.8526 trillion. It excludes the separate poverty grant and the smaller household payment to avoid double counting.

Run `python3 scripts/verify-data.py` to check the monetary areas, chart proportions, translations, and final-bundle arithmetic.

The extended Musk section adds everyday purchases: 1,000 new Honda Civics bought outright, then a million cars; mortgage-free homes; prepaid rent; groceries; cleared credit-card balances; income for time away from work; and a century of spending $1 million a day. [`data/musk-comparisons-2026-09-06.json`](data/musk-comparisons-2026-09-06.json) records the prices, assumptions, quantities, and geometry. Honda's price includes destination and excludes local tax and registration. Other household budgets are explicitly hypothetical.

Colored squares represent individual purchases or working lives. Repeated stripes represent weeks or years. Orange gaps are excluded from the monetary area. Sticky callouts fill the remaining space within the existing Musk rectangle; its size and ruler remain unchanged.

## Reading controls

Scroll or swipe horizontally to experience the full distances. A plain bottom bar moves to the previous or next example, including each repeated field and each week/year group. Arrow keys move across one screen; Space and Page Down advance to the next example; Shift+Space and Page Up go back. Home returns to the opening; End reaches the last callout. These jumps are immediate, with no long animation across millions of pixels. At the last example the forward button becomes “Start again.”

Vertical mouse wheels move horizontally when the page fits vertically. Short windows keep native vertical scrolling, as do the household and child illustrations. Trackpad gestures, touch, browser zoom, links, and focused controls keep their native behavior. The two vertical illustrations are keyboard focusable. Reduced-motion preferences disable the opening arrow animation.

The counter uses the actual left edge of each wealth rectangle and shows the share still ahead. It describes position through asset wealth, not money spent. Counter values update once per animation frame; geometry is cached between resizes. The thousand-car comparison also has a normalized reference: at a $1,000 fortune, $25.89 million out of $908.2 billion is about $0.0285, less than three cents. Cars and homes show the percentage remaining after their separate purchases.

Run `node --test scripts/journey.test.cjs` for scrolling, navigation, counter boundaries, and translation-loading behavior. Run the data verifier above for the monetary geometry and bilingual copy.

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
