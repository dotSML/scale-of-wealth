'use client';

import React from 'react';
import { StoryBeat } from '@/data/story';
import styles from './StoryOverlay.module.css';

interface StoryOverlayProps {
  activeBeat: StoryBeat | null;
  onOpenCitation: () => void;
}

export function StoryOverlay({
  activeBeat,
  onOpenCitation,
}: StoryOverlayProps) {
  if (!activeBeat) return null;

  return (
    <section 
      className={styles.overlayContainer} 
      aria-labelledby="active-beat-title"
    >
      {/* Screen reader live region announcing beat updates */}
      <div 
        className={styles.srOnly} 
        aria-live="polite" 
        aria-atomic="true"
      >
        {activeBeat.chapterTitle}: {activeBeat.title}. {activeBeat.headline}
      </div>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <div className={styles.chapterBadge}>
            Chapter {activeBeat.chapter}: {activeBeat.chapterTitle}
          </div>
          <div className={styles.beatCounter}>
            Beat {activeBeat.index} of 30
          </div>
        </header>

        <h1 id="active-beat-title" className={styles.title}>
          {activeBeat.title}
        </h1>

        <div className={styles.headline}>
          {activeBeat.headline}
        </div>

        <div className={styles.copy}>
          {activeBeat.copy.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {activeBeat.derivedMetric && (
          <div className={styles.metricCallout}>
            <span className={styles.metricLabel}>{activeBeat.derivedMetric.label}</span>
            <span className={styles.metricValue}>{activeBeat.derivedMetric.valueString}</span>
            <span className={styles.metricFormula}>{activeBeat.derivedMetric.calculationDetails}</span>
          </div>
        )}

        <footer className={styles.cardFooter}>
          <button 
            type="button" 
            className={styles.citationLink}
            onClick={onOpenCitation}
            aria-haspopup="dialog"
          >
            Source: {activeBeat.citation.label} ({activeBeat.citation.date}) &rarr;
          </button>
        </footer>
      </article>
    </section>
  );
}
