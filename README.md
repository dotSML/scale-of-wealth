# The Scale of Wealth

An editorial, shareable web application that visualizes extreme wealth concentration through true physical proportions and mathematical scale. Inspired conceptually by Matt Korostoff’s [*Wealth, shown to scale*](https://eattherichtextformat.github.io/1-pixel-wealth/).

Built with **Next.js 15 (App Router)**, **TypeScript**, **CSS Modules**, and **Static Export**, ready for zero-configuration Vercel deployment.

---

## The Mathematical Baseline

* **Canonical Scale**: `1 CSS pixel² = $1,000 USD`
* **Rectangle Area**: `Area (px²) = Dollars ÷ 1,000`
* **Square Dimensions**: `width = height = √Area`
* **Corridor Rectangles**:
  * Desktop (Horizontal): fixed height `H = 400px`, `width = Area ÷ 400`
  * Mobile (Vertical): fixed width `W = 300px`, `height = Area ÷ 300`
  * **Area Invariant**: `Area_desktop = Area_mobile = Area_canonical`. Mathematical area is strictly preserved across both desktop and mobile screens.

---

## Key Features

1. **Native Scrolling with Bounded-Segment Coordinate Rebasing**:
   * Trillion-dollar fortunes at this physical scale exceed browser DOM layout limits ($50.25\text{M}+$ pixels for Worldwide Billionaires).
   * The scroller utilizes bounded segments (max 500,000 pixels per segment) with continuous coordinate rebasing and viewport-only canvas rendering.
   * Preserves native trackpad gestures, touch momentum, keyboard controls, and browser zoom (`ctrlKey` / pinch-to-zoom pass-through) without artificial inertia engines.
2. **Embedded Narrative Comparisons**:
   * Rather than isolating comparisons in endless separate corridors, lifetime benchmarks, public programs, and social investments are placed directly *inside* the massive fortunes being explored (such as Elon Musk’s $892B fortune).
3. **Overview Mode**:
   * An explicitly labeled toggle that scales the active fortune to fit the screen uniformly, providing an updated scale ratio (e.g. `1 px² = $10,000,000`) to visualize the grand finale’s 2.9% carve-out against the 97.1% remainder at a single glance.
4. **Persistent Scale HUD**:
   * Displays the canonical scale indicator, current position within the named fortune (`$XX.XB / $YY.YB (Z.Z%)`), and an exact floating reference square of the **US Median Family Net Worth ($192,900)** derived directly from the geometric engine (~13.89px square).
5. **Jump Navigation**:
   * Traversal controls allow skipping uninterrupted stretches of wealth, displaying an exact traversal counter showing how many billions of dollars were bypassed.
6. **Three Dedicated Routes**:
   * `/`: Interactive visual canvas explorer with scrubbers and keyboard navigation.
   * `/read`: Complete long-form editorial article in accessible, semantic HTML with all 30 beats and derived arithmetic.
   * `/sources`: Comprehensive methodology, frozen data snapshot table, citations, and editorial caveats.

---

## The 30 Narrative Beats

* **Chapter 1: Ordinary Money**
  1. `$1,000`: One single CSS pixel.
  2. `$26,993`: Average annual employer-sponsored family health insurance premium (2025).
  3. `$83,730`: US median annual household income (2024).
  4. `$192,900`: US median family net worth (2022 survey). Persistent reference marker.
  5. `$300,000`: A hypothetical modest home.
  6. `$3,349,200`: 40 years earning today’s median household income.
* **Chapter 2: The Ladder**
  7. `$1,000,000`: One million dollars (1,000 px²).
  8. `$10,000,000`: Ten million dollars (10,000 px²).
  9. `$100,000,000`: One hundred million dollars (100,000 px²).
  10. `$1,000,000,000`: One billion dollars—the unmistakable 1,000× gulf.
  11. `$268,000,000,000`: Jeff Bezos estimated net worth (1 Sept 2026).
  12. `$892,000,000,000`: Elon Musk estimated net worth (1 Sept 2026).
* **Chapter 3: Beyond a Lifetime**
  13. `892,000 years`: Time to accumulate Musk’s fortune earning $1M annually.
  14. `$7,305,000,000`: Total accumulated saving $10,000 daily for 2,000 years since 26 AD.
  15. `2,442.2 years`: Time to exhaust Musk’s fortune spending $1,000,000 cash daily.
  16. `$8,920,000,000`: What 1% of Musk’s fortune represents.
  17. `$8,920,000,000`: Wealth remaining after losing 99% of his fortune.
  18. `$22.42`: A hypothetical $100M donation expressed as the same percentage of wealth for a $200,000 net worth household.
* **Chapter 4: Amounts That Change Lives**
  19. `$13,000,000,000`: UN World Food Programme (WFP) 2026 operational requirement.
  20. `$9,300,000,000`: Global malaria-response annual funding target (2025).
  21. `$30,000,000,000`: 100,000 hypothetical homes at $300,000 each.
  22. `$100,000,000,000`: 100,000 teaching positions funded for an entire decade.
  23. `$50,000,000,000`: One million $50,000 college scholarships.
  24. `$10,000,000,000`: One million $10,000 emergency household grants.
* **Chapter 5: Collective Scale**
  25. `$6,600,000,000,000`: Wealth of the Forbes 400 richest Americans (2025).
  26. `$20,100,000,000,000`: Worldwide billionaire wealth across 3,428 people (March 2026).
  27. `$66,000,000,000`: 1% of the Forbes 400.
  28. `$201,000,000,000`: 1% of worldwide billionaire wealth.
  29. `$6,200,000,000,000`: Forbes 400 aggregate remaining after guaranteeing $1B per member.
  30. `The Grand Finale`: The combined $190B social package carved out of the Forbes 400 (2.88%), leaving $6.41 trillion (97.12%) untouched.

---

## Frozen Data Snapshot (5 September 2026)

All figures are frozen in `data/snapshot.ts`:

| Metric | Amount | Observation Date | Source |
| :--- | :--- | :--- | :--- |
| Elon Musk Net Worth | $892,000,000,000 | 1 September 2026 | Forbes Real-Time |
| Jeff Bezos Net Worth | $268,000,000,000 | 1 September 2026 | Forbes Real-Time |
| US Median Family Net Worth | $192,900 | 2022 Survey | Federal Reserve SCF |
| US Median Household Income | $83,730 | 2024 | US Census Bureau |
| Family Health Insurance Premium | $26,993 | 2025 | KFF Employer Survey |
| Forbes 400 Wealth | $6,600,000,000,000 | 2025 List | Forbes |
| Worldwide Billionaire Wealth | $20,100,000,000,000 | 1 March 2026 | Forbes (3,428 people) |
| WFP Operational Requirement | $13,000,000,000 | 2026 Need | UN WFP (110M people) |
| Global Malaria Target | $9,300,000,000 | 2025 Target | WHO Global Report |

---

## Development & Testing

### Prerequisites
* Node.js 20+ (tested on Node.js v24.15)
* npm 10+

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Automated Tests
```bash
npm run test
```

### Type Checking
```bash
npm run typecheck
```

### Production Build & Static Export
```bash
npm run build
```
This generates a static export in the `out/` directory.

---

## Manual Data Updates

To update metrics in the future:
1. Open [`data/snapshot.ts`](data/snapshot.ts).
2. Update the observation values, dates, URLs, and notes.
3. Update `SNAPSHOT_DATE`.
4. Run `npm run test` to ensure all derived arithmetic and area calculations pass.
5. Commit and push the changes.

---

## Vercel Deployment

This project is configured for **Next.js Static Export** (`output: 'export'` in `next.config.ts`).
1. Connect your repository (`dotSML/scale-of-wealth`) to Vercel.
2. Vercel will automatically detect Next.js and run `next build`.
3. The resulting static assets in `out/` will be deployed instantly to Vercel’s global Edge Network with zero serverless function overhead.

---

## License & Attribution

* **Concept Attribution**: Inspired by Matt Korostoff’s *Wealth, shown to scale*.
* **Code & Content License**: Newly authored code and narrative are licensed under the **MIT License**. See [LICENSE](LICENSE) for details.
