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
    <aside 
      className={styles.annotationContainer} 
      aria-label="Active Comparison Annotation"
    >
      <div 
        className={styles.srOnly} 
        aria-live="polite" 
        aria-atomic="true"
      >
        {activeBeat.title}. {activeBeat.headline}
      </div>

      <article className={styles.annotation}>
        {/* Main Number or Title */}
        <h2 className={styles.primaryNumber}>
          {activeBeat.comparisonLabel || activeBeat.headline}
        </h2>

        {/* Short, crisp ~25 word caption */}
        <p className={styles.caption}>
          {activeBeat.shortCaption || activeBeat.headline}
        </p>

        {/* Small, discreet source link */}
        <div className={styles.sourceRow}>
          <button 
            type="button" 
            className={styles.sourceLink}
            onClick={onOpenCitation}
            aria-haspopup="dialog"
          >
            {activeBeat.citation.label} · Source &rarr;
          </button>
        </div>
      </article>
    </aside>
  );
}
