import React from 'react';
import { Header } from '@/components/common/Header';
import { SNAPSHOT_DATA } from '@/data/snapshot';
import styles from './Sources.module.css';

export const metadata = {
  title: 'The Scale of Wealth — Sources & Methodology',
  description: 'Committed data snapshot, complete source citations, mathematical proofs, and editorial caveats for The Scale of Wealth.',
};

export default function SourcesPage() {
  const citations = Object.values(SNAPSHOT_DATA);

  return (
    <>
      <Header />
      <main className={styles.container}>
        <header className={styles.hero}>
          <div className={styles.kicker}>Methodology & Verification</div>
          <h1 className={styles.title}>Sources & Data Snapshot</h1>
          <p className={styles.lead}>
            This visualization relies on a frozen, committed data snapshot assembled on <strong>5 September 2026</strong>. 
            There are no dynamic APIs, real-time scraping, or background database fetches. Every calculation and physical proportion is derived deterministically in code from these primary sources.
          </p>
        </header>

        {/* Snapshot Table */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Committed Metric Snapshot</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Observation Date</th>
                  <th>Category</th>
                  <th>Publisher & Link</th>
                </tr>
              </thead>
              <tbody>
                {citations.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                      <div className={styles.notes}>{c.notes}</div>
                    </td>
                    <td className={styles.monoCell}>{c.formattedValue}</td>
                    <td className={styles.monoCell}>{c.periodLabel}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[c.category]}`}>
                        {c.category}
                      </span>
                    </td>
                    <td>
                      {c.url.startsWith('http') ? (
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                          {c.publisher} &rarr;
                        </a>
                      ) : (
                        <span>{c.publisher}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Mathematical Contract & Proof */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Mathematical Contract</h2>
          <div className={styles.prose}>
            <h3>1. The Canonical Scale</h3>
            <p>
              The baseline scale is <strong>1 CSS pixel² = $1,000 USD</strong>.
              Rectangle area is strictly defined as <code>Area = Dollars / 1,000</code>.
            </p>
            <ul>
              <li>$1,000 = 1 CSS px² (1px × 1px square)</li>
              <li>$1,000,000 = 1,000 CSS px² (~31.62px × 31.62px square)</li>
              <li>$1,000,000,000 = 1,000,000 CSS px² (1,000px × 1,000px square, or 2,500px × 400px corridor)</li>
              <li>$892,000,000,000 (Musk) = 892,000,000 CSS px² (2,230,000px × 400px corridor)</li>
              <li>$6,600,000,000,000 (Forbes 400) = 6,600,000,000 CSS px² (16,500,000px × 400px corridor)</li>
              <li>$20,100,000,000,000 (Global Billionaires) = 20,100,000,000 CSS px² (50,250,000px × 400px corridor)</li>
            </ul>

            <h3>2. Area Preservation Between Desktop and Mobile</h3>
            <p>
              Desktop exploration uses a horizontal corridor with fixed height <code>H = 400px</code>, where width <code>W = Area / 400</code>.
              Mobile exploration uses a vertical corridor with fixed width <code>W = 300px</code>, where height <code>H = Area / 300</code>.
            </p>
            <p>
              Because <code>Area = W × H = (Area / 400) × 400 = 300 × (Area / 300)</code>, mathematical physical area is identical across every viewport and orientation.
            </p>

            <h3>3. Viewport Virtualization</h3>
            <p>
              Trillion-dollar geometry at true scale exceeds modern browser DOM element size caps (16,777,216 or 33,554,432 pixels). 
              The application uses bounded native scrolling segments (500,000 pixels maximum per segment) with seamless coordinate rebasing and viewport-only canvas rendering.
            </p>
          </div>
        </section>

        {/* Editorial Caveats & Defensibility */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Defensible Editorial Standards & Caveats</h2>
          <div className={styles.prose}>
            <div className={styles.alertCard}>
              <strong>Key Distinctions:</strong>
              <ol className={styles.caveatList}>
                <li>
                  <strong>Net Worth is Not a Cash Balance:</strong> A billionaire’s net worth consists primarily of corporate equity (such as shares of Tesla, SpaceX, or Amazon). 
                  Attempting to liquidate all assets at once would depress stock prices and incur capital gains taxes. These figures represent relative economic magnitude, not a liquidation model or tax-revenue estimate.
                </li>
                <li>
                  <strong>Annual Budgets Recur:</strong> The World Food Programme’s operational requirement ($13B) and the global malaria target ($9.3B) are annual operational needs, not one-time fees to permanently end hunger or disease.
                </li>
                <li>
                  <strong>Hypothetical Unit Costs are Model Benchmarks:</strong> The $300,000 home, $100,000 annual teacher employment cost, $50,000 scholarship, and $10,000 emergency grant are benchmark assumptions used to illustrate relative scale.
                </li>
                <li>
                  <strong>No Summing of Overlapping Groups:</strong> Elon Musk and Jeff Bezos are members of the Forbes 400, and the Forbes 400 are members of the 3,428 global billionaires. 
                  These groups must never be summed together.
                </li>
                <li>
                  <strong>No Inflation Adjustments Across Snapshot Dates:</strong> Metric observations span 2022 to 2026. Each metric is reported exactly as cited in its official release without synthetic inflation indexing.
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Attribution and Licensing */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Attribution & Licensing</h2>
          <div className={styles.prose}>
            <p>
              This project is conceptually inspired by Matt Korostoff’s foundational web project,{' '}
              <a href="https://eattherichtextformat.github.io/1-pixel-wealth/" target="_blank" rel="noopener noreferrer">
                <em>Wealth, shown to scale</em>
              </a>.
            </p>
            <p>
              All code and written narrative in this repository are newly authored from scratch in Next.js, TypeScript, and CSS Modules. 
              Newly authored code is licensed under the <strong>MIT License</strong>.
            </p>
            <p>
              Source code is available on{' '}
              <a href="https://github.com/dotSML/scale-of-wealth" target="_blank" rel="noopener noreferrer">
                GitHub: dotSML/scale-of-wealth
              </a>.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
