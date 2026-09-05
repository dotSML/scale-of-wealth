'use client';

import React from 'react';
import { SceneId, SCENES, StoryBeat } from '@/data/story';
import {
  getHouseholdMarkerDimensions,
  formatCurrency,
  percentageOf,
} from '@/lib/wealth-math';
import styles from './WealthHUD.module.css';

interface WealthHUDProps {
  currentSceneId: SceneId;
  currentUSD: number;
  activeBeat: StoryBeat | null;
  onSelectScene: (sceneId: SceneId) => void;
  onPrevBeat: () => void;
  onNextBeat: () => void;
  onJumpNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  isOverviewMode: boolean;
  onToggleOverview: () => void;
  overviewScaleText?: string;
  onOpenCitation: () => void;
}

export function WealthHUD({
  currentSceneId,
  currentUSD,
  activeBeat,
  onSelectScene,
  onPrevBeat,
  onNextBeat,
  onJumpNext,
  canPrev,
  canNext,
  isOverviewMode,
  onToggleOverview,
  overviewScaleText,
  onOpenCitation,
}: WealthHUDProps) {
  const currentScene = SCENES[currentSceneId];
  const householdMarker = getHouseholdMarkerDimensions();

  // Position within current parent fortune
  const positionUSD = Math.min(currentUSD, currentScene.totalUSD);
  const positionPercentage = percentageOf(positionUSD, currentScene.totalUSD);

  const formattedPos = formatCurrency(positionUSD, { compact: true, precision: 1 });
  const formattedTotal = formatCurrency(currentScene.totalUSD, { compact: true, precision: 1 });

  return (
    <aside className={styles.hudContainer} aria-label="Scale Explorer HUD">
      {/* Top Bar: Persistent Scale & Household Reference */}
      <div className={styles.topHud}>
        <div className={styles.scaleCard}>
          <div className={styles.scaleTitle}>
            {isOverviewMode ? 'OVERVIEW MODE' : 'CANONICAL SCALE'}
          </div>
          <div className={styles.scaleRatio}>
            {isOverviewMode ? (
              overviewScaleText || 'Uniform Scale (Compressed)'
            ) : (
              <span>1 CSS px² = $1,000</span>
            )}
          </div>
        </div>

        {/* Household Reference Marker */}
        <div className={styles.householdCard} title="Physical reference: US Median Family Net Worth ($192,900)">
          <div className={styles.markerWrapper}>
            <div 
              className={styles.markerSquare}
              style={{
                width: `${householdMarker.width}px`,
                height: `${householdMarker.height}px`,
              }}
              aria-hidden="true"
            />
          </div>
          <div className={styles.markerMeta}>
            <span className={styles.markerLabel}>Median US Family</span>
            <span className={styles.markerValue}>$192,900 Net Worth</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Position in Fortune & Controls */}
      <div className={styles.bottomHud}>
        {/* Fortune Progress Indicator */}
        <div className={styles.fortuneProgressCard}>
          <div className={styles.fortuneMeta}>
            <span className={styles.fortuneName}>{currentScene.title}</span>
            <span className={styles.fortunePosition}>
              {formattedPos} / {formattedTotal} ({positionPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className={styles.progressBarTrack} role="progressbar" aria-valuenow={positionPercentage} aria-valuemin={0} aria-valuemax={100}>
            <div 
              className={styles.progressBarFill} 
              style={{ width: `${Math.min(100, Math.max(0.5, positionPercentage))}%` }}
            />
          </div>
        </div>

        {/* Scene / Chapter Selector */}
        <div className={styles.sceneTabs} role="tablist" aria-label="Story Chapters">
          {(Object.keys(SCENES) as SceneId[]).map((id) => (
            <button
              key={id}
              role="tab"
              aria-selected={currentSceneId === id}
              className={`${styles.sceneTab} ${currentSceneId === id ? styles.activeSceneTab : ''}`}
              onClick={() => onSelectScene(id)}
            >
              {SCENES[id].shortName}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className={styles.actionControls}>
          <button
            className={`${styles.ctrlButton} ${isOverviewMode ? styles.activeMode : ''}`}
            onClick={onToggleOverview}
            title="Toggle between canonical 1:1 scale and fitted overview"
            aria-pressed={isOverviewMode}
          >
            {isOverviewMode ? '1:1 Scale' : 'Overview'}
          </button>

          <button
            className={styles.ctrlButton}
            onClick={onPrevBeat}
            disabled={!canPrev}
            title="Previous comparison beat (Left Arrow)"
            aria-label="Previous comparison"
          >
            &larr; Prev
          </button>

          <button
            className={styles.ctrlButton}
            onClick={onNextBeat}
            disabled={!canNext}
            title="Next comparison beat (Right Arrow)"
            aria-label="Next comparison"
          >
            Next &rarr;
          </button>

          <button
            className={`${styles.ctrlButton} ${styles.jumpButton}`}
            onClick={onJumpNext}
            title="Jump across uninterrupted wealth distance"
            aria-label="Jump forward across wealth distance"
          >
            Jump &rarr;&rarr;
          </button>

          {activeBeat && (
            <button
              className={styles.citationButton}
              onClick={onOpenCitation}
              title="View source and calculation details"
              aria-label="View source citation"
            >
              Source
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
