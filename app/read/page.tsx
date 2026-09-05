import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import styles from './Read.module.css';

export const metadata = {
  title: 'The Scale of Wealth — Reading Edition',
  description: 'The long-form narrative reading edition of The Scale of Wealth. Mathematics and physical proportions of extreme fortunes.',
};

export default function ReadPage() {
  return (
    <>
      <Header />
      <article className={styles.article}>
        <header className={styles.hero}>
          <div className={styles.kicker}>The Reading Edition</div>
          <h1 className={styles.mainTitle}>The Scale of Wealth</h1>
          <p className={styles.lead}>
            Human intuition fails when numbers exceed ordinary experience. When we hear of hundreds of billions or trillions of dollars, the mind files them under the vague concept of “unimaginably rich.” 
            This document sets down the narrative journey using a strict physical baseline: <strong>one square pixel equals one thousand dollars ($1,000)</strong>.
          </p>
          <div className={styles.metaBar}>
            <span>Committed Snapshot: 5 September 2026</span>
            <span>Scale: 1 px² = $1,000</span>
            <Link href="/" className={styles.interactiveLink}>Launch Scale Visualizer &rarr;</Link>
          </div>
        </header>

        <div className={styles.content}>
          {/* Section 1: The Canonical Unit */}
          <section className={styles.chapterSection}>
            <div className={styles.chapterHeader}>
              <span className={styles.chapterTag}>Part 1</span>
              <h2 className={styles.chapterTitle}>The Starting Unit: $1,000</h2>
            </div>
            <p>
              On this scale, a single square pixel of area represents exactly <strong>$1,000</strong>.
              Because a single pixel is difficult to see on a modern high-resolution display, a subtle indicator points to it.
              Everything else on this website is drawn strictly proportional to this single pixel.
            </p>
          </section>

          {/* Section 2: Human Scale */}
          <section className={styles.chapterSection}>
            <div className={styles.chapterHeader}>
              <span className={styles.chapterTag}>Part 2</span>
              <h2 className={styles.chapterTitle}>Human Scale: $83,730</h2>
            </div>
            <p>
              According to the US Census Bureau’s 2024 Current Population Survey (released in September 2025), the median annual gross income for an American household was <strong>$83,730</strong>.
            </p>
            <p>
              At our scale, this represents an area of 83.73 square pixels—a modest square roughly 9.15 pixels on each side.
              Half of all American households earn more than this in a year of labor; half earn less.
            </p>
          </section>

          {/* Section 3: One Million Dollars */}
          <section className={styles.chapterSection}>
            <div className={styles.chapterHeader}>
              <span className={styles.chapterTag}>Part 3</span>
              <h2 className={styles.chapterTitle}>$1 Million</h2>
            </div>
            <p>
              One million dollars consists of 1,000 units of $1,000.
              In physical terms, it forms a square 31.62 pixels wide and 31.62 pixels tall (1,000 square pixels).
            </p>
            <p>
              It is already noticeably larger than the median household income, yet easily fits on any computer screen.
            </p>
          </section>

          {/* Section 4: One Billion Dollars */}
          <section className={styles.chapterSection}>
            <div className={styles.chapterHeader}>
              <span className={styles.chapterTag}>Part 4</span>
              <h2 className={styles.chapterTitle}>$1 Billion</h2>
            </div>
            <p>
              One billion dollars is one thousand million dollars.
              At a corridor height of 500 pixels, one billion dollars stretches <strong>2,000 pixels</strong> long.
            </p>
            <p>
              Embedded right at the entrance of this 2,000-pixel corridor is the entire $1 million square—a tiny 31.62-pixel box sitting inside an enormous 2,000-pixel expanse.
              Traversing this distance requires scrolling across several screens.
            </p>
          </section>

          {/* Section 5: One Trillion Dollars */}
          <section className={styles.chapterSection}>
            <div className={styles.chapterHeader}>
              <span className={styles.chapterTag}>Part 5</span>
              <h2 className={styles.chapterTitle}>$1 Trillion: The Modern Benchmark</h2>
            </div>
            <p>
              One trillion dollars is one thousand billion dollars.
              At the same canonical scale and 500-pixel height, one trillion dollars requires a corridor <strong>2,000,000 pixels long</strong> (two million pixels).
            </p>
            <p>
              At the entrance of this corridor, the entire 2,000-pixel billion-dollar rectangle that previously felt enormous now occupies a mere fraction of the opening.
            </p>
            <p>
              Inside this trillion-dollar corridor, physical benchmarks put the scale in perspective:
            </p>
            <ul>
              <li>
                <strong>40 years of median household income ($3.35 million):</strong> A typical career of gross earnings occupies just 6.7 pixels along the corridor.
              </li>
              <li>
                <strong>1% of $1 trillion ($10 billion):</strong> Reached after 20,000 pixels of scrolling. Losing 99% of one trillion dollars still leaves ten thousand million dollars.
              </li>
              <li>
                <strong>Elon Musk ($892 billion):</strong> According to Forbes’ Real-Time Billionaires snapshot on 1 September 2026, Elon Musk’s estimated net worth is $892 billion. In our trillion-dollar corridor, his fortune reaches 1,784,000 pixels—or 89.2% of the way through the corridor.
              </li>
            </ul>
          </section>

          {/* Section 6: Collective Scale & Finale */}
          <section className={styles.chapterSection}>
            <div className={styles.chapterHeader}>
              <span className={styles.chapterTag}>Part 6</span>
              <h2 className={styles.chapterTitle}>The Forbes 400 & The Finale</h2>
            </div>
            <p>
              The combined net worth of the 400 richest Americans on the Forbes 400 list totals <strong>$6.6 trillion</strong> ($6,600,000,000,000).
              At 500 pixels high, this corridor extends for <strong>13,200,000 pixels</strong>.
            </p>
            <p>
              To grasp the sheer magnitude of this fortune, consider a simple division:
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.summaryTable}>
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Value</th>
                    <th>Corridor Length</th>
                    <th>Proportion</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Reserve $1 Billion for Each of the 400 Members</strong></td>
                    <td>$400,000,000,000</td>
                    <td>800,000 px</td>
                    <td>6.06%</td>
                  </tr>
                  <tr className={styles.remainderRow}>
                    <td><strong>Amount Remaining</strong></td>
                    <td>$6,200,000,000,000</td>
                    <td>12,400,000 px</td>
                    <td>93.94%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Even after leaving every single one of the 400 individuals with a personal fortune of one thousand million dollars ($1,000,000,000), <strong>$6.2 trillion—or 93.9% of their wealth—still remains</strong>.
              The geometry speaks for itself.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
