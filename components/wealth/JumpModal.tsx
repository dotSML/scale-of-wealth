'use client';

import React, { useEffect } from 'react';
import styles from './JumpModal.module.css';

interface JumpModalProps {
  isOpen: boolean;
  traversedUSD: number;
  targetBeatTitle: string;
  onClose: () => void;
}

export function JumpModal({
  isOpen,
  traversedUSD,
  targetBeatTitle,
  onClose,
}: JumpModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formattedTraversed = traversedUSD >= 1_000_000_000_000
    ? `$${(traversedUSD / 1_000_000_000_000).toFixed(2)} trillion`
    : traversedUSD >= 1_000_000_000
    ? `$${(traversedUSD / 1_000_000_000).toFixed(1)} billion`
    : `$${(traversedUSD / 1_000_000).toFixed(1)} million`;

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <div className={styles.toastHeader}>
        <span className={styles.icon}>&rarr;&rarr;</span>
        <span className={styles.toastTitle}>DISTANCE TRAVERSED</span>
      </div>
      <div className={styles.amount}>
        {formattedTraversed}
      </div>
      <div className={styles.target}>
        Jumped uninterrupted wealth corridor to <strong>{targetBeatTitle}</strong>
      </div>
    </div>
  );
}
