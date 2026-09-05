'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SceneId, SCENES, getStoryBeats, SCENE_ORDER } from '@/data/story';
import {
  getSceneLayout,
  usdToScenePixel,
  scenePixelToUSD,
  getActiveBeatForScroll,
  LayoutOrientation,
  SceneLayout,
} from '@/lib/scene-geometry';
import {
  logicalToSegmentCoordinate,
  SEGMENT_MAX_PIXELS,
} from '@/lib/wealth-math';
import { WealthCanvas } from './WealthCanvas';
import { WealthHUD } from './WealthHUD';
import { StoryOverlay } from './StoryOverlay';
import { CitationModal } from './CitationModal';
import { ProportionalOverview } from './ProportionalOverview';
import styles from './WealthScroller.module.css';

export function WealthScroller() {
  // Start naturally with ordinary money at the $1,000 pixel
  const [sceneId, setSceneId] = useState<SceneId>('ordinary');
  const [orientation, setOrientation] = useState<LayoutOrientation>('horizontal');
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [currentUSD, setCurrentUSD] = useState(1_000);
  const [currentPixelOffset, setCurrentPixelOffset] = useState(0);
  const [isCitationOpen, setIsCitationOpen] = useState(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isRebasingRef = useRef(false);
  const lastUSDRef = useRef(1_000);

  // All beats
  const allBeats = useMemo(() => getStoryBeats(), []);

  // Stabilize scene layout reference
  const sceneLayout: SceneLayout = useMemo(
    () => getSceneLayout(sceneId, orientation),
    [sceneId, orientation]
  );
  const currentSegment = sceneLayout.segments[segmentIndex] || sceneLayout.segments[0];

  // Active Story Beat derived directly and deterministically from explicit visibility ranges
  const activeBeat = useMemo(
    () => getActiveBeatForScroll(sceneLayout, currentPixelOffset),
    [sceneLayout, currentPixelOffset]
  );

  // Sync active beat ID with URL hash without triggering full reload
  useEffect(() => {
    if (activeBeat && typeof window !== 'undefined') {
      const hash = `#${activeBeat.id}`;
      if (window.location.hash !== hash) {
        window.history.replaceState(null, '', hash);
      }
    }
  }, [activeBeat]);

  // Navigate to a specific logical pixel within a scene
  const navigateToPixel = useCallback((
    targetPixel: number,
    targetSceneId: SceneId,
    targetOrientation: LayoutOrientation = orientation,
    animate = false
  ) => {
    const layout = getSceneLayout(targetSceneId, targetOrientation);
    const safePixel = Math.max(0, Math.min(targetPixel, layout.totalPixels));
    const safeUSD = scenePixelToUSD(safePixel, targetSceneId, targetOrientation);

    lastUSDRef.current = safeUSD;
    setCurrentUSD(safeUSD);
    setCurrentPixelOffset(safePixel);

    if (targetSceneId !== sceneId) {
      setSceneId(targetSceneId);
    }

    const { segmentIndex: targetSegIndex, segmentOffset } = logicalToSegmentCoordinate(
      safePixel,
      SEGMENT_MAX_PIXELS
    );

    setSegmentIndex(targetSegIndex);

    const container = scrollContainerRef.current;
    if (container) {
      isRebasingRef.current = true;
      if (targetOrientation === 'horizontal') {
        container.scrollTo({
          left: segmentOffset,
          behavior: animate ? 'smooth' : 'auto',
        });
      } else {
        container.scrollTo({
          top: segmentOffset,
          behavior: animate ? 'smooth' : 'auto',
        });
      }
      setTimeout(() => {
        isRebasingRef.current = false;
      }, 50);
    }
  }, [orientation, sceneId]);

  // Detect orientation on mount and window resize
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      const newOrientation: LayoutOrientation = isMobile ? 'vertical' : 'horizontal';

      setOrientation((prev) => {
        if (prev !== newOrientation) {
          const savedUSD = lastUSDRef.current;
          setTimeout(() => {
            const targetPx = usdToScenePixel(savedUSD, sceneId, newOrientation);
            navigateToPixel(targetPx, sceneId, newOrientation);
          }, 50);
        }
        return newOrientation;
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigateToPixel, sceneId]);

  // Handle URL hash on initial load and popstate
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;

      const targetBeat = allBeats.find((b) => b.id === hash);
      if (targetBeat) {
        const targetPx = SCENES[targetBeat.parentSceneId].isCorridor
          ? usdToScenePixel(targetBeat.offsetInParentUSD, targetBeat.parentSceneId, orientation)
          : targetBeat.editorialPlacementPx;
        navigateToPixel(targetPx, targetBeat.parentSceneId, orientation);
      }
    };

    handleHashChange();
    window.addEventListener('popstate', handleHashChange);
    return () => window.removeEventListener('popstate', handleHashChange);
  }, [allBeats, navigateToPixel, orientation]);

  // Native scroll listener with actual extent rebasing and scene chaining
  const handleScroll = useCallback(() => {
    if (isRebasingRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const isHorizontal = orientation === 'horizontal';
    const scrollPos = isHorizontal ? container.scrollLeft : container.scrollTop;
    const maxScroll = isHorizontal
      ? container.scrollWidth - container.clientWidth
      : container.scrollHeight - container.clientHeight;

    const segLength = currentSegment.pixelLength;

    // FORWARD REBASING / SCENE TRANSITION
    if (maxScroll > 0 && scrollPos >= maxScroll - 2) {
      // 1. Next segment in same scene
      if (segmentIndex < sceneLayout.segments.length - 1) {
        isRebasingRef.current = true;
        const nextIndex = segmentIndex + 1;
        setSegmentIndex(nextIndex);

        const overflow = Math.max(0, scrollPos - maxScroll);
        if (isHorizontal) {
          container.scrollLeft = overflow;
        } else {
          container.scrollTop = overflow;
        }

        const newLogicalPx = currentSegment.cumulativeStartPixels + segLength + overflow;
        setCurrentPixelOffset(newLogicalPx);
        setCurrentUSD(scenePixelToUSD(newLogicalPx, sceneId, orientation));

        setTimeout(() => {
          isRebasingRef.current = false;
        }, 30);
        return;
      }
      // 2. Transition naturally to next scene in narrative order
      else {
        const sceneIdx = SCENE_ORDER.indexOf(sceneId);
        if (sceneIdx < SCENE_ORDER.length - 1) {
          const nextSceneId = SCENE_ORDER[sceneIdx + 1];
          navigateToPixel(0, nextSceneId, orientation, false);
          return;
        }
      }
    }

    // REVERSE REBASING / SCENE TRANSITION
    if (scrollPos <= 0) {
      // 1. Previous segment in same scene
      if (segmentIndex > 0) {
        isRebasingRef.current = true;
        const prevIndex = segmentIndex - 1;
        const prevSeg = sceneLayout.segments[prevIndex];
        setSegmentIndex(prevIndex);

        const prevMaxScroll = Math.max(
          0,
          prevSeg.pixelLength - (isHorizontal ? container.clientWidth : container.clientHeight)
        );
        if (isHorizontal) {
          container.scrollLeft = prevMaxScroll;
        } else {
          container.scrollTop = prevMaxScroll;
        }

        const newLogicalPx = prevSeg.cumulativeStartPixels + prevMaxScroll;
        setCurrentPixelOffset(newLogicalPx);
        setCurrentUSD(scenePixelToUSD(newLogicalPx, sceneId, orientation));

        setTimeout(() => {
          isRebasingRef.current = false;
        }, 30);
        return;
      }
      // 2. Transition backwards to previous scene in narrative order
      else {
        const sceneIdx = SCENE_ORDER.indexOf(sceneId);
        if (sceneIdx > 0) {
          const prevSceneId = SCENE_ORDER[sceneIdx - 1];
          const prevLayout = getSceneLayout(prevSceneId, orientation);
          navigateToPixel(prevLayout.totalPixels - 10, prevSceneId, orientation, false);
          return;
        }
      }
    }

    // In-segment continuous scrolling
    const logicalPx = currentSegment.cumulativeStartPixels + scrollPos;
    setCurrentPixelOffset(logicalPx);
    const derivedUSD = scenePixelToUSD(logicalPx, sceneId, orientation);
    setCurrentUSD(derivedUSD);
    lastUSDRef.current = derivedUSD;
  }, [currentSegment, orientation, sceneId, sceneLayout, segmentIndex, navigateToPixel]);

  // Calm desktop wheel translation + smooth bounded acceleration in long fortunes
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    // Preserve browser pinch-to-zoom
    if (e.ctrlKey || e.metaKey) return;

    if (orientation === 'horizontal') {
      const container = scrollContainerRef.current;
      if (!container) return;

      const rawDelta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

      // In authored scenes (ordinary & ladder): strict 1:1 input-to-camera movement
      if (!SCENES[sceneId].isCorridor) {
        setSpeedMultiplier(1.0);
        container.scrollLeft += rawDelta;
        return;
      }

      // In long corridor fortunes: calculate distance to upcoming landmark
      const beats = sceneLayout.beats;
      let nextBeatPx = Infinity;
      for (const b of beats) {
        const bPx = usdToScenePixel(b.offsetInParentUSD, sceneId, 'horizontal');
        if (bPx > currentPixelOffset + 50) {
          nextBeatPx = bPx;
          break;
        }
      }

      const distToNext = nextBeatPx - currentPixelOffset;

      // Traversal speed smoothly scales up only when far (> 4000px) from the next landmark.
      // Returns to 1.0x normal speed well before (< 1500px) the next comparison enters view!
      let mult = 1.0;
      if (distToNext > 4000 && Math.abs(rawDelta) > 10) {
        mult = Math.min(3.2, 1.0 + (distToNext / 25000) * 1.5);
      } else {
        mult = 1.0;
      }

      setSpeedMultiplier(mult);
      container.scrollLeft += rawDelta * mult;
    }
  }, [currentPixelOffset, orientation, sceneId, sceneLayout.beats]);

  // Keyboard navigation avoiding global interception
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept if focus is in an input, button, or modal
      const activeEl = document.activeElement;
      const isInteractive =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        activeEl instanceof HTMLButtonElement ||
        (activeEl as HTMLElement)?.isContentEditable;

      if (isInteractive || isCitationOpen || isOverviewOpen) return;

      const container = scrollContainerRef.current;
      if (!container) return;

      const delta = 120;
      const pageDelta = 650;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'j') {
        if (orientation === 'horizontal') {
          container.scrollLeft += delta;
        } else {
          container.scrollTop += delta;
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'k') {
        if (orientation === 'horizontal') {
          container.scrollLeft -= delta;
        } else {
          container.scrollTop -= delta;
        }
      } else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        if (orientation === 'horizontal') {
          container.scrollLeft += pageDelta;
        } else {
          container.scrollTop += pageDelta;
        }
      } else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        if (orientation === 'horizontal') {
          container.scrollLeft -= pageDelta;
        } else {
          container.scrollTop -= pageDelta;
        }
      } else if (e.key === 'Home') {
        navigateToPixel(0, 'ordinary', orientation, true);
      } else if (e.key === 'End') {
        const lastScene = SCENE_ORDER[SCENE_ORDER.length - 1];
        const lastLayout = getSceneLayout(lastScene, orientation);
        navigateToPixel(lastLayout.totalPixels, lastScene, orientation, true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCitationOpen, isOverviewOpen, navigateToPixel, orientation]);

  // Find next landmark for the discreet "Skip ahead" link during empty stretches
  const nextLandmark = useMemo(() => {
    const beats = sceneLayout.beats;
    for (const b of beats) {
      const bPx = SCENES[sceneId].isCorridor
        ? usdToScenePixel(b.offsetInParentUSD, sceneId, orientation)
        : b.editorialPlacementPx;
      if (bPx > currentPixelOffset + 100) {
        return { beat: b, pixel: bPx, distance: bPx - currentPixelOffset };
      }
    }
    return null;
  }, [currentPixelOffset, orientation, sceneId, sceneLayout.beats]);

  // Only show skip ahead when there's an enormous empty stretch ahead (> 5,000 px)
  const canSkipAhead = Boolean(nextLandmark && nextLandmark.distance > 5000);
  const handleSkipAhead = useCallback(() => {
    if (nextLandmark) {
      navigateToPixel(nextLandmark.pixel, sceneId, orientation, true);
    }
  }, [navigateToPixel, nextLandmark, sceneId, orientation]);

  // Jump directly to a scene from navigation menu
  const handleSelectScene = (newSceneId: SceneId) => {
    navigateToPixel(0, newSceneId, orientation, false);
  };

  return (
    <div className={styles.viewport}>
      {/* Background Wealth Canvas with filled shapes */}
      <WealthCanvas
        sceneId={sceneId}
        sceneLayout={sceneLayout}
        currentPixelOffset={currentPixelOffset}
        orientation={orientation}
        isOverviewMode={false}
        activeBeat={activeBeat}
      />

      {/* Native Bounded-Segment Scroll Container */}
      <div
        ref={scrollContainerRef}
        className={`${styles.scrollContainer} ${
          orientation === 'horizontal' ? styles.horizontal : styles.vertical
        }`}
        onScroll={handleScroll}
        onWheel={handleWheel}
        tabIndex={0}
        aria-label="Wealth Scale Scroller"
      >
        {/* Virtual Runway Sized to Current Segment */}
        <div
          className={styles.runway}
          style={
            orientation === 'horizontal'
              ? { width: `${currentSegment.pixelLength}px`, height: '100%' }
              : { width: '100%', height: `${currentSegment.pixelLength}px` }
          }
        />
      </div>

      {/* Short, elegant visual annotation positioned beside visual */}
      <StoryOverlay
        activeBeat={activeBeat}
        onOpenCitation={() => setIsCitationOpen(true)}
      />

      {/* Minimal Unobtrusive Chrome (Scale Legend, Navigation Menu, Progress Bar) */}
      <WealthHUD
        currentSceneId={sceneId}
        currentUSD={currentUSD}
        onSelectScene={handleSelectScene}
        onOpenProportionalOverview={() => setIsOverviewOpen(true)}
        onSkipAhead={canSkipAhead ? handleSkipAhead : undefined}
        nextBeatTitle={nextLandmark?.beat.title}
        speedMultiplier={speedMultiplier}
      />

      {/* Proportional Overview Modal */}
      <ProportionalOverview
        isOpen={isOverviewOpen}
        onClose={() => setIsOverviewOpen(false)}
      />

      {/* Expandable Citation Modal */}
      <CitationModal
        beat={activeBeat}
        isOpen={isCitationOpen}
        onClose={() => setIsCitationOpen(false)}
      />
    </div>
  );
}
