'use client';

import React from 'react';
import { calculateFinalePackage, formatCurrency } from '@/lib/wealth-math';
import { SNAPSHOT_DATA } from '@/data/snapshot';
import styles from './ProportionalOverview.module.css';

interface ProportionalOverviewProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProportionalOverview({ isOpen, onClose }: ProportionalOverviewProps) {
  if (!isOpen) return null;

  const finale = calculateFinalePackage();
  const forbes400Total = finale.forbes400Total; // $6.6T
  const muskTotal = SNAPSHOT_DATA.muskNetWorth.value; // $892B
  const bezosTotal = SNAPSHOT_DATA.bezosNetWorth.value; // $268B
  const oneBillion = 1_000_000_000;
  const medianNetWorth = SNAPSHOT_DATA.usMedianFamilyNetWorth.value; // $192,900

  const muskPct = (muskTotal / forbes400Total) * 100;
  const bezosPct = (bezosTotal / forbes400Total) * 100;
  const oneBPct = (oneBillion / forbes400Total) * 100;

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="overview-title">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div>
            <div className={styles.badge}>Proportional Overview</div>
            <h2 id="overview-title" className={styles.title}>The Forbes 400 & The Social Carve-Out</h2>
            <p className={styles.subtitle}>
              Showing true relative proportions. Subdivisions represent exact percentage shares of the Forbes 400 collective wealth ($6.6 Trillion).
              <br />
              <strong className={styles.warningNote}>Note: This overview is proportional to fit the screen. It is not drawn at the 1 CSS px² = $1,000 canonical pixel scale.</strong>
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close overview">
            &times;
          </button>
        </header>

        {/* 1. Main Forbes 400 Bar with Social Carve-Out */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionName}>The Forbes 400 ($6.6 Trillion)</span>
            <span className={styles.sectionMeta}>100% Collective Wealth</span>
          </div>

          <div className={styles.barTrack}>
            {/* Social Package 2.88% */}
            <div 
              className={styles.packageSegment} 
              style={{ width: `${Math.max(3.5, finale.packagePercentage)}%` }}
              title={`Combined Social Package: $190B (${finale.packagePercentage.toFixed(1)}%)`}
            >
              {finale.items.map((item) => {
                const itemFraction = item.totalCost / finale.packageTotal;
                return (
                  <div
                    key={item.id}
                    className={styles.subSlice}
                    style={{
                      width: `${itemFraction * 100}%`,
                      backgroundColor: item.color,
                    }}
                    title={`${item.name}: ${formatCurrency(item.totalCost, { compact: true })}`}
                  />
                );
              })}
            </div>

            {/* Remainder 97.12% */}
            <div 
              className={styles.remainderSegment}
              style={{ width: `${100 - Math.max(3.5, finale.packagePercentage)}%` }}
              title={`Untouched Remainder: $6.41T (${finale.remainderPercentage.toFixed(1)}%)`}
            >
              <span className={styles.remainderText}>
                Remaining Untouched: $6.41 Trillion (97.1%)
              </span>
            </div>
          </div>

          {/* Legend for the carved-out package */}
          <div className={styles.itemsLegend}>
            <div className={styles.legendItem}>
              <span className={styles.colorDot} style={{ backgroundColor: '#f59e0b' }} />
              <span>100,000 Homes: $30B (0.45%)</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.colorDot} style={{ backgroundColor: '#38bdf8' }} />
              <span>100,000 Teachers (10 yrs): $100B (1.52%)</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.colorDot} style={{ backgroundColor: '#a855f7' }} />
              <span>1M College Scholarships: $50B (0.76%)</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.colorDot} style={{ backgroundColor: '#10b981' }} />
              <span>1M Emergency Grants: $10B (0.15%)</span>
            </div>
          </div>
        </section>

        {/* 2. Relative Comparison Bars */}
        <section className={styles.section}>
          <h3 className={styles.comparisonHeading}>Comparative Fortunes at this Proportional Scale</h3>

          <div className={styles.comparisonRow}>
            <div className={styles.rowLabel}>
              <span>Elon Musk</span>
              <span className={styles.rowValue}>$892 Billion (13.5%)</span>
            </div>
            <div className={styles.miniTrack}>
              <div className={styles.miniFill} style={{ width: `${muskPct}%`, backgroundColor: '#f59e0b' }} />
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.rowLabel}>
              <span>Jeff Bezos</span>
              <span className={styles.rowValue}>$268 Billion (4.1%)</span>
            </div>
            <div className={styles.miniTrack}>
              <div className={styles.miniFill} style={{ width: `${bezosPct}%`, backgroundColor: '#eab308' }} />
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.rowLabel}>
              <span>One Billion Dollars ($1B)</span>
              <span className={styles.rowValue}>$1,000,000,000 (0.015%)</span>
            </div>
            <div className={styles.miniTrack}>
              <div className={styles.miniFill} style={{ width: `${Math.max(0.3, oneBPct)}%`, backgroundColor: '#10b981' }} />
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.rowLabel}>
              <span>US Median Family Net Worth</span>
              <span className={styles.rowValue}>{formatCurrency(medianNetWorth)} (0.000003%)</span>
            </div>
            <div className={styles.miniTrack}>
              <div className={styles.miniFill} style={{ width: '1px', backgroundColor: '#60a5fa' }} />
            </div>
            <span className={styles.nanoNote}>Microscopic fraction: less than one tenth of a pixel at this scale.</span>
          </div>
        </section>

        <footer className={styles.footer}>
          <button type="button" className={styles.returnBtn} onClick={onClose}>
            &larr; Return to 1:1 Scale Scrolling Journey
          </button>
        </footer>
      </div>
    </div>
  );
}
