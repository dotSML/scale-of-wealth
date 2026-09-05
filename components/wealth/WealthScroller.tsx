'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  getJourneyLayout,
  getDistanceToNextLandmark,
  LayoutOrientation,
  JourneyLayout,
} from '@/lib/scene-geometry';
import styles from './WealthScroller.module.css';

export function WealthScroller() {
  const [orientation, setOrientation] = useState<LayoutOrientation>('horizontal');
  const [viewportSize, setViewportSize] = useState(1280);
  const [scrollOffset, setScrollOffset] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const consecutiveScrollRef = useRef(0);
  const lastScrollTimeRef = useRef(0);
  const touchStartPosRef = useRef(0);
  const touchStartScrollRef = useRef(0);
  const isDraggingScrubRef = useRef(false);

  // Resize and orientation handling
  useEffect(() => {
    const updateDimensions = () => {
      const isHorizontal = window.innerWidth >= 768;
      setOrientation(isHorizontal ? 'horizontal' : 'vertical');
      setViewportSize(isHorizontal ? window.innerWidth : window.innerHeight);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const layout: JourneyLayout = useMemo(
    () => getJourneyLayout(orientation),
    [orientation]
  );

  const isHorizontal = orientation === 'horizontal';

  // Smooth bounded scroll updater
  const updateScroll = useCallback((newOffset: number) => {
    const clamped = Math.max(0, Math.min(layout.totalLengthPx, newOffset));
    setScrollOffset(clamped);
  }, [layout.totalLengthPx]);

  // Wheel handling with smooth normalized translation and conservative empty-space pacing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Allow browser native pinch-to-zoom
      if (e.ctrlKey || e.metaKey) return;

      e.preventDefault();

      const now = performance.now();
      if (now - lastScrollTimeRef.current < 180) {
        consecutiveScrollRef.current = Math.min(20, consecutiveScrollRef.current + 1);
      } else {
        consecutiveScrollRef.current = 0;
      }
      lastScrollTimeRef.current = now;

      // Normalize delta
      let delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (e.deltaMode === 1) delta *= 24; // Line mode
      else if (e.deltaMode === 2) delta *= viewportSize; // Page mode

      // Distance to upcoming milestone
      const distToNext = getDistanceToNextLandmark(scrollOffset, orientation);

      // Conservative acceleration only during sustained scrolling in deep empty stretches
      let multiplier = 1.0;
      if (distToNext > 5000 && consecutiveScrollRef.current > 4) {
        const ramp = (consecutiveScrollRef.current - 4) * 0.1;
        multiplier = Math.min(2.4, 1.0 + ramp);
      }

      updateScroll(scrollOffset + delta * multiplier);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [scrollOffset, orientation, viewportSize, updateScroll]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        activeEl instanceof HTMLButtonElement
      ) return;

      const step = 120;
      const pageStep = viewportSize * 0.75;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'j') {
        updateScroll(scrollOffset + step);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'k') {
        updateScroll(scrollOffset - step);
      } else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        updateScroll(scrollOffset + pageStep);
      } else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        updateScroll(scrollOffset - pageStep);
      } else if (e.key === 'Home') {
        updateScroll(0);
      } else if (e.key === 'End') {
        updateScroll(layout.totalLengthPx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollOffset, viewportSize, layout.totalLengthPx, updateScroll]);

  // Touch drag handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPosRef.current = isHorizontal ? touch.clientX : touch.clientY;
    touchStartScrollRef.current = scrollOffset;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const currentPos = isHorizontal ? touch.clientX : touch.clientY;
    const diff = touchStartPosRef.current - currentPos;
    updateScroll(touchStartScrollRef.current + diff);
  };

  // Bottom scrub bar dragging
  const handleScrubMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingScrubRef.current = true;
    const updateFromMouse = (clientX: number) => {
      const fraction = Math.max(0, Math.min(1, clientX / window.innerWidth));
      updateScroll(fraction * layout.totalLengthPx);
    };
    updateFromMouse(e.clientX);

    const onMouseMove = (moveEvt: MouseEvent) => {
      if (!isDraggingScrubRef.current) return;
      updateFromMouse(moveEvt.clientX);
    };

    const onMouseUp = () => {
      isDraggingScrubRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Viewport bounds for virtualized projection
  const viewStart = scrollOffset - 250;
  const viewEnd = scrollOffset + viewportSize + 250;

  // Intersecting corridors (sliced into bounded DOM elements < 2,000px)
  const visibleCorridors = layout.corridors.filter(
    (c) => c.endPx > viewStart && c.startPx < viewEnd
  );

  // Intersecting standalone landmarks
  const visibleLandmarks = layout.landmarks.filter(
    (l) => (l.offsetPx + l.lengthPx) > viewStart && l.offsetPx < viewEnd
  );

  // Progress fraction for scrub bar
  const progressPercent = (scrollOffset / (layout.totalLengthPx || 1)) * 100;

  return (
    <div
      ref={containerRef}
      className={`${styles.viewport} ${isHorizontal ? styles.horizontal : styles.vertical}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      tabIndex={0}
      aria-label="The Scale of Wealth visualizer"
    >
      {/* Quiet corner links */}
      <nav className={styles.cornerNav}>
        <Link href="/read" className={styles.quietLink}>Text version</Link>
        <Link href="/sources" className={styles.quietLink}>Sources</Link>
      </nav>

      {/* Virtualized Stage */}
      <div className={styles.stage}>
        {/* 1. Intro Screen */}
        {viewStart < 1200 && (
          <div
            className={styles.introScreen}
            style={
              isHorizontal
                ? { left: `${0 - scrollOffset}px`, width: `${viewportSize}px` }
                : { top: `${0 - scrollOffset}px`, height: `${viewportSize}px`, width: '100%' }
            }
          >
            <h1 className={styles.introTitle}>Wealth, shown to scale</h1>
            <p className={styles.introSubtitle}>Every pixel of area represents $1,000.</p>
            <div className={styles.scrollPrompt}>
              {isHorizontal ? 'Scroll →' : 'Scroll down ↓'}
            </div>
          </div>
        )}

        {/* 2. Standalone Anchors ($1,000, Median Income, $1 Million) */}
        {visibleLandmarks.map((lm) => {
          if (lm.type === 'intro') return null;

          const renderCoord = lm.offsetPx - scrollOffset;

          if (lm.type === 'pixel') {
            return (
              <div
                key={lm.id}
                className={styles.shapeContainer}
                style={isHorizontal ? { left: `${renderCoord}px` } : { top: `${renderCoord}px` }}
              >
                <div className={styles.itemTitle}>{lm.title}</div>
                <div className={styles.pixelUnitWrapper}>
                  <div className={styles.onePixel} />
                  <div className={styles.locatorLine}>
                    <span className={styles.locatorArrow}>←</span>
                    <span>{lm.subtitle}</span>
                  </div>
                </div>
              </div>
            );
          }

          if (lm.type === 'square') {
            const side = lm.squareSize || 20;
            return (
              <div
                key={lm.id}
                className={styles.shapeContainer}
                style={isHorizontal ? { left: `${renderCoord}px` } : { top: `${renderCoord}px` }}
              >
                <div className={styles.itemTitle}>{lm.title}</div>
                {lm.subtitle && <div className={styles.itemSubtitle}>{lm.subtitle}</div>}
                <div
                  className={styles.wealthSquare}
                  style={{ width: `${side}px`, height: `${side}px` }}
                />
                {lm.observationNote && (
                  <div className={styles.observationNote}>{lm.observationNote}</div>
                )}
              </div>
            );
          }

          return null;
        })}

        {/* 3. Bounded Corridor Slices ($1B, $1T, Forbes 400) */}
        {visibleCorridors.map((corridor) => {
          const sliceStart = Math.max(corridor.startPx, viewStart);
          const sliceEnd = Math.min(corridor.endPx, viewEnd);
          const renderCoord = sliceStart - scrollOffset;
          const sliceLength = sliceEnd - sliceStart;

          if (sliceLength <= 0) return null;

          return (
            <React.Fragment key={corridor.id}>
              {/* Rendered Bounded Slice */}
              <div
                className={styles.corridorSlice}
                style={
                  isHorizontal
                    ? { left: `${renderCoord}px`, width: `${sliceLength}px` }
                    : { top: `${renderCoord}px`, height: `${sliceLength}px` }
                }
              />

              {/* Corridor Entrance Heading */}
              {corridor.startPx >= viewStart && corridor.startPx <= viewEnd && (
                <div
                  className={styles.corridorHeading}
                  style={
                    isHorizontal
                      ? { left: `${corridor.startPx - scrollOffset}px` }
                      : { top: `${corridor.startPx - scrollOffset - 60}px` }
                  }
                >
                  <div className={styles.itemTitle}>{corridor.title}</div>
                  {corridor.subtitle && (
                    <div className={styles.itemSubtitle}>{corridor.subtitle}</div>
                  )}
                </div>
              )}

              {/* $1B Corridor Entrance: Embedded $1M Square (31.62px × 31.62px) */}
              {corridor.id === 'billion-corridor' && (
                corridor.startPx >= viewStart - 100 && corridor.startPx <= viewEnd && (
                  <div
                    className={styles.referenceBlock}
                    style={
                      isHorizontal
                        ? {
                            left: `${corridor.startPx - scrollOffset}px`,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '31.62px',
                            height: '31.62px',
                          }
                        : {
                            top: `${corridor.startPx - scrollOffset}px`,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '31.62px',
                            height: '31.62px',
                          }
                    }
                  >
                    <span className={styles.referenceLabel}>$1M</span>
                  </div>
                )
              )}

              {/* $1T Corridor Entrance: Embedded $1B Reference Block (2,000px corridor) */}
              {corridor.id === 'trillion-corridor' && (
                corridor.startPx >= viewStart - 2500 && corridor.startPx <= viewEnd && (
                  <div
                    className={styles.referenceBlock}
                    style={
                      isHorizontal
                        ? {
                            left: `${corridor.startPx - scrollOffset}px`,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '2000px',
                            height: '500px',
                          }
                        : {
                            top: `${corridor.startPx - scrollOffset}px`,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '300px',
                            height: '3333.33px',
                          }
                    }
                  >
                    <span className={styles.referenceLabel}>Previous $1 Billion</span>
                  </div>
                )
              )}

              {/* Forbes 400 Corridor: Finale Reserved $400B Slice (800,000px wide) */}
              {corridor.id === 'forbes400-corridor' && (
                (() => {
                  const reservedStart = corridor.startPx;
                  const reservedEnd = corridor.startPx + (isHorizontal ? 800_000 : 1_333_333.33);
                  const resSliceStart = Math.max(reservedStart, viewStart);
                  const resSliceEnd = Math.min(reservedEnd, viewEnd);

                  if (resSliceEnd > resSliceStart) {
                    const resRenderCoord = resSliceStart - scrollOffset;
                    const resSliceLen = resSliceEnd - resSliceStart;

                    return (
                      <div
                        className={styles.reservedCorridorSlice}
                        style={
                          isHorizontal
                            ? { left: `${resRenderCoord}px`, width: `${resSliceLen}px` }
                            : { top: `${resRenderCoord}px`, height: `${resSliceLen}px` }
                        }
                      />
                    );
                  }
                  return null;
                })()
              )}
            </React.Fragment>
          );
        })}

        {/* 4. Corridor Interior Landmarks & Markers */}
        {visibleLandmarks.map((lm) => {
          if (lm.type !== 'corridor-marker') return null;

          const renderCoord = lm.offsetPx - scrollOffset;

          return (
            <React.Fragment key={lm.id}>
              {/* Landmark Line */}
              <div
                className={styles.corridorMarkerLine}
                style={
                  isHorizontal
                    ? { left: `${renderCoord}px` }
                    : { top: `${renderCoord}px` }
                }
              />

              {/* Landmark Label */}
              <div
                className={styles.markerLabelContainer}
                style={
                  isHorizontal
                    ? { left: `${renderCoord + 8}px` }
                    : { top: `${renderCoord + 8}px` }
                }
              >
                <div className={styles.markerTitle}>{lm.title}</div>
                {lm.subtitle && <div className={styles.markerSubtitle}>{lm.subtitle}</div>}
                {lm.observationNote && (
                  <div className={styles.observationNote}>{lm.observationNote}</div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Discreet bottom scrub bar */}
      <div
        className={styles.scrubTrack}
        onMouseDown={handleScrubMouseDown}
        aria-hidden="true"
      >
        <div
          className={styles.scrubThumb}
          style={{ width: `${Math.min(100, Math.max(0.2, progressPercent))}%` }}
        />
      </div>
    </div>
  );
}
