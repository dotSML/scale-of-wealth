import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { getStoryBeats } from '@/data/story';
import {
  formatCurrency,
  calculateFinalePackage,
} from '@/lib/wealth-math';
import styles from './Read.module.css';

export const metadata = {
  title: 'The Scale of Wealth — Complete Narrative',
  description: 'The complete long-form reading edition of The Scale of Wealth. Thirty comparisons documenting extreme wealth concentration through mathematics and physical proportions.',
};

export default function ReadPage() {
  const beats = getStoryBeats();
  const finale = calculateFinalePackage();

  // Group beats by chapter
  const chapters = [
    { number: 1, title: 'Ordinary Money', beats: beats.filter((b) => b.chapter === 1) },
    { number: 2, title: 'The Ladder', beats: beats.filter((b) => b.chapter === 2) },
    { number: 3, title: 'Beyond a Lifetime', beats: beats.filter((b) => b.chapter === 3) },
    { number: 4, title: 'Amounts That Change Lives', beats: beats.filter((b) => b.chapter === 4) },
    { number: 5, title: 'Collective Scale', beats: beats.filter((b) => b.chapter === 5) },
  ];

  return (
    <>
      <Header />
      <article className={styles.article}>
        <header className={styles.hero}>
          <div className={styles.kicker}>The Reading Edition</div>
          <h1 className={styles.mainTitle}>The Scale of Wealth</h1>
          <p className={styles.lead}>
            Human intuition fails when numbers exceed ordinary experience. When we hear of hundreds of billions or trillions of dollars, the brain files them under the vague concept of “unimaginably rich.” 
            This document sets down thirty physical comparisons using a strict mathematical baseline: <strong>one square pixel equals one thousand dollars</strong>.
          </p>
          <div className={styles.metaBar}>
            <span>Committed Snapshot: 5 September 2026</span>
            <span>Scale: 1 px² = $1,000</span>
            <Link href="/" className={styles.interactiveLink}>Launch Interactive Visual Explorer &rarr;</Link>
          </div>
        </header>

        {/* Table of Chapters */}
        <nav className={styles.toc} aria-label="Table of Contents">
          <div className={styles.tocTitle}>Chapters</div>
          <ol className={styles.tocList}>
            {chapters.map((ch) => (
              <li key={ch.number}>
                <a href={`#chapter-${ch.number}`}>
                  Chapter {ch.number}: {ch.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Narrative Chapters */}
        <div className={styles.content}>
          {chapters.map((ch) => (
            <section key={ch.number} id={`#chapter-${ch.number}`} className={styles.chapterSection}>
              <div className={styles.chapterHeader}>
                <span className={styles.chapterTag}>Chapter {ch.number}</span>
                <h2 className={styles.chapterTitle}>{ch.title}</h2>
              </div>

              <div className={styles.beatsList}>
                {ch.beats.map((beat) => (
                  <article key={beat.id} id={beat.id} className={styles.beatCard}>
                    <header className={styles.beatHeader}>
                      <span className={styles.beatIndex}>Beat {beat.index} of 30</span>
                      <h3 className={styles.beatTitle}>{beat.title}</h3>
                      <div className={styles.beatHeadline}>{beat.headline}</div>
                    </header>

                    <div className={styles.beatBody}>
                      {beat.copy.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>

                    {beat.derivedMetric && (
                      <div className={styles.metricCallout}>
                        <div className={styles.metricLabel}>{beat.derivedMetric.label}</div>
                        <div className={styles.metricValue}>{beat.derivedMetric.valueString}</div>
                        <div className={styles.metricDetails}>{beat.derivedMetric.calculationDetails}</div>
                      </div>
                    )}

                    <footer className={styles.beatFooter}>
                      <span className={styles.sourceTag}>
                        Source: {beat.citation.label} ({beat.citation.date})
                      </span>
                      {beat.citation.url && beat.citation.url.startsWith('http') && (
                        <a
                          href={beat.citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.citationLink}
                        >
                          View Primary Document &rarr;
                        </a>
                      )}
                    </footer>
                  </article>
                ))}
              </div>
            </section>
          ))}

          {/* Grand Finale Table Summary */}
          <section className={styles.finaleSection}>
            <div className={styles.chapterHeader}>
              <span className={styles.chapterTag}>Summary Arithmetic</span>
              <h2 className={styles.chapterTitle}>The Finale Package vs Forbes 400 Remainder</h2>
            </div>
            <p className={styles.summaryLead}>
              Combining every public investment examined in Chapter 4 produces a comprehensive social program costing $190 billion.
              Carving this out of the Forbes 400’s $6.6 trillion wealth leaves $6.41 trillion untouched.
            </p>

            <div className={styles.tableWrapper}>
              <table className={styles.summaryTable}>
                <thead>
                  <tr>
                    <th>Component Program</th>
                    <th>Unit Cost</th>
                    <th>Beneficiaries / Units</th>
                    <th>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {finale.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{formatCurrency(item.unitCost)}</td>
                      <td>{item.quantity.toLocaleString('en-US')}</td>
                      <td>{formatCurrency(item.totalCost)}</td>
                    </tr>
                  ))}
                  <tr className={styles.totalRow}>
                    <td colSpan={3}>Combined Social Investment Package</td>
                    <td>$190,000,000,000 (2.88%)</td>
                  </tr>
                  <tr className={styles.remainderRow}>
                    <td colSpan={3}>Forbes 400 Aggregate Remainder</td>
                    <td>$6,410,000,000,000 (97.12%)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.footnote}>
              * Note: Comparisons represent orders of magnitude and physical proportions. Net worth is an equity asset valuation, not a cash balance. Different dated datasets are not inflation-adjusted.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
