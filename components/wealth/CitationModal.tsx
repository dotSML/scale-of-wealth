'use client';

import React from 'react';
import { StoryBeat } from '@/data/story';
import styles from './CitationModal.module.css';

interface CitationModalProps {
  beat: StoryBeat | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CitationModal({ beat, isOpen, onClose }: CitationModalProps) {
  if (!isOpen || !beat) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div className={styles.categoryBadge}>
            {beat.citation.category.toUpperCase()} DATA
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </header>

        <h2 id="modal-title" className={styles.title}>
          {beat.title}
        </h2>

        <div className={styles.body}>
          <div className={styles.section}>
            <span className={styles.label}>Source & Publisher</span>
            <p className={styles.value}>{beat.citation.label}</p>
          </div>

          <div className={styles.section}>
            <span className={styles.label}>Observation / Period Date</span>
            <p className={styles.value}>{beat.citation.date}</p>
          </div>

          <div className={styles.section}>
            <span className={styles.label}>Citation Detail</span>
            <p className={styles.value}>{beat.citation.sourceText}</p>
          </div>

          {beat.derivedMetric && (
            <div className={styles.section}>
              <span className={styles.label}>Derived Calculation</span>
              <p className={styles.formula}>{beat.derivedMetric.calculationDetails}</p>
            </div>
          )}

          {beat.citation.url && beat.citation.url.startsWith('http') && (
            <div className={styles.section}>
              <a
                href={beat.citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}
              >
                View Primary Source Document &rarr;
              </a>
            </div>
          )}
        </div>

        <footer className={styles.modalFooter}>
          <button className={styles.doneButton} onClick={onClose}>
            Close Citation
          </button>
        </footer>
      </div>
    </div>
  );
}
