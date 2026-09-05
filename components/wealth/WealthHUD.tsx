'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { SceneId, SCENES, SCENE_ORDER } from '@/data/story';
import {
  getHouseholdMarkerDimensions,
  formatCurrency,
  percentageOf,
} from '@/lib/wealth-math';
import styles from './WealthHUD.module.css';

interface WealthHUDProps {
  currentSceneId: SceneId;
  currentUSD: number;
  onSelectScene: (sceneId: SceneId) => void;
  onOpenProportionalOverview: () => void;
  onSkipAhead?: () => void;
  nextBeatTitle?: string | null;
  speedMultiplier?: number;
}

export function WealthHUD({
  currentSceneId,
  currentUSD,
  onSelectScene,
  onOpenProportionalOverview,
  onSkipAhead,
  nextBeatTitle,
  speedMultiplier = 1,
}: WealthHUDProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const currentScene = SCENES[currentSceneId];
  const householdMarker = getHouseholdMarkerDimensions();

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Position within current parent fortune (only shown for corridor fortunes)
  const isCorridor = currentScene.isCorridor;
  const positionUSD = Math.min(currentUSD, currentScene.totalUSD);
  const positionPercentage = percentageOf(positionUSD, currentScene.totalUSD);
  const formattedPos = formatCurrency(positionUSD, { compact: true, precision: 1 });
  const formattedTotal = formatCurrency(currentScene.totalUSD, { compact: true, precision: 1 });

  return (
    <aside className={styles.hudRoot} aria-label="Scale Explorer Navigation and Reference">
      {/* 1. TOP-LEFT: Small Scale Legend & Physical Reference */}
      <div className={styles.scaleLegend}>
        <div className={styles.scaleTag}>
          <span className={styles.scaleRatio}>1 CSS px² = $1,000</span>
        </div>
        <div 
          className={styles.referenceItem} 
          title="Physical scale marker: US Median Family Net Worth ($192,900)"
        >
          <div 
            className={styles.markerSquare}
            style={{
              width: `${householdMarker.width}px`,
              height: `${householdMarker.height}px`,
            }}
            aria-hidden="true"
          />
          <span className={styles.markerText}>Median Family ($193k)</span>
        </div>
      </div>

      {/* 2. TOP-RIGHT: Unobtrusive Navigation Dropdown Menu */}
      <div className={styles.navMenuContainer} ref={menuRef}>
        <button
          type="button"
          className={styles.menuTriggerBtn}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
          aria-label="Navigation Menu"
        >
          <span className={styles.currentSceneLabel}>{currentScene.shortName}</span>
          <span className={styles.dropdownChevron} aria-hidden="true">▾</span>
        </button>

        {isMenuOpen && (
          <div className={styles.dropdownMenu} role="menu">
            <div className={styles.menuGroupHeader}>Story Landmarks</div>
            {SCENE_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                role="menuitem"
                className={`${styles.menuItem} ${currentSceneId === id ? styles.menuItemActive : ''}`}
                onClick={() => {
                  onSelectScene(id);
                  setIsMenuOpen(false);
                }}
              >
                <span className={styles.menuItemTitle}>{SCENES[id].title}</span>
                <span className={styles.menuItemMeta}>{formatCurrency(SCENES[id].totalUSD, { compact: true })}</span>
              </button>
            ))}

            <div className={styles.menuDivider} />

            <button
              type="button"
              role="menuitem"
              className={styles.menuItemSpecial}
              onClick={() => {
                onOpenProportionalOverview();
                setIsMenuOpen(false);
              }}
            >
              📊 Proportional Overview
            </button>

            <div className={styles.menuDivider} />

            <Link href="/read" className={styles.menuLink} onClick={() => setIsMenuOpen(false)}>
              Narrative Reading Edition &rarr;
            </Link>
            <Link href="/sources" className={styles.menuLink} onClick={() => setIsMenuOpen(false)}>
              Data Sources & Methodology &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* 3. BOTTOM-CENTER: Fortune Progress Bar (Shown ONLY during long fortunes) */}
      {isCorridor && (
        <div className={styles.fortuneProgressContainer}>
          <div className={styles.fortuneInfo}>
            <span className={styles.fortuneTitle}>{currentScene.title}:</span>
            <span className={styles.fortuneNumbers}>
              {formattedPos} of {formattedTotal} ({positionPercentage.toFixed(1)}%)
            </span>
            {speedMultiplier > 1.3 && (
              <span className={styles.speedPill} title="Dynamic Traversal Acceleration Active">
                ⚡ {speedMultiplier.toFixed(1)}x speed
              </span>
            )}
          </div>
          <div 
            className={styles.progressTrack} 
            role="progressbar" 
            aria-valuenow={positionPercentage} 
            aria-valuemin={0} 
            aria-valuemax={100}
          >
            <div 
              className={styles.progressFill} 
              style={{ width: `${Math.min(100, Math.max(0.5, positionPercentage))}%` }}
            />
          </div>
        </div>
      )}

      {/* 4. DISCREET SKIP AHEAD LINK (During long uninterrupted stretches) */}
      {onSkipAhead && nextBeatTitle && (
        <div className={styles.skipAheadContainer}>
          <button
            type="button"
            className={styles.skipAheadBtn}
            onClick={onSkipAhead}
            title={`Skip ahead across uninterrupted wealth to ${nextBeatTitle}`}
          >
            Skip ahead to {nextBeatTitle} &rarr;
          </button>
        </div>
      )}
    </aside>
  );
}
