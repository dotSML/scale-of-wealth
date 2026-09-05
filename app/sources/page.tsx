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
              <li>$83,730 (Median US household income) = 83.73 CSS px² (~9.15px × 9.15px square)</li>
              <li>$1,000,000 = 1,000 CSS px² (~31.62px × 31.62px square)</li>
              <li>$3,349,200 (40 years of median income) = 3,349.2 CSS px² (~57.87px × 57.87px square)</li>
              <li>$1,000,000,000 = 1,000,000 CSS px² (2,000px × 500px corridor on desktop)</li>
              <li>$10,000,000,000 (1% of $1T) = 10,000,000 CSS px² (20,000px × 500px corridor on desktop)</li>
              <li>$892,000,000,000 (Musk estimate) = 892,000,000 CSS px² (1,784,000px × 500px corridor on desktop)</li>
              <li>$1,000,000,000,000 = 1,000,000,000 CSS px² (2,000,000px × 500px corridor on desktop)</li>
              <li>$6,600,000,000,000 (Forbes 400) = 6,600,000,000 CSS px² (13,200,000px × 500px corridor on desktop)</li>
              <li>$400,000,000,000 (Reserved $1B for 400 members) = 400,000,000 CSS px² (800,000px × 500px corridor, 6.06%)</li>
              <li>$6,200,000,000,000 (Remainder) = 6,200,000,000 CSS px² (12,400,000px × 500px corridor, 93.94%)</li>
            </ul>

            <h3>2. Area Preservation Between Desktop and Mobile</h3>
            <p>
              Desktop exploration uses a horizontal corridor with fixed height <code>H = 500px</code>, where width <code>W = Area / 500</code>.
              Mobile exploration uses a vertical corridor with fixed width <code>W = 300px</code>, where height <code>H = Area / 300</code>.
            </p>
            <p>
              Because <code>Area = W × H = (Area / 500) × 500 = 300 × (Area / 300)</code>, mathematical physical area is preserved identically across every viewport and orientation.
            </p>

            <h3>3. Viewport Virtualization & Bounded Geometry</h3>
            <p>
              Trillion-dollar geometry at true scale exceeds modern browser DOM layout limits.
              The application uses bounded virtualized viewport projection: elements rendered in the DOM are strictly bounded to the visible screen (&lt; 2,000px), eliminating coordinate overflow while delivering an unbroken, continuous visual journey.
            </p>
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
