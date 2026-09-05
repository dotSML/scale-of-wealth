'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SceneId, SCENES, StoryBeat, getStoryBeats } from '@/data/story';
import {
  getSceneLayout,
  usdToScenePixel,
  scenePixelToUSD,
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
import { JumpModal } from './JumpModal';
import { CitationModal } from './CitationModal';
import styles from './WealthScroller.module.css';

export function WealthScroller() {
  const [sceneId, setSceneId] = useState<SceneId>('musk');
  const [orientation, setOrientation] = useState<LayoutOrientation>('horizontal');
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [currentUSD, setCurrentUSD] = useState(0);
  const [currentPixelOffset, setCurrentPixelOffset] = useState(0);
  const [activeBeat, setActiveBeat] = useState<StoryBeat | null>(null);
  const [isOverviewMode, setIsOverviewMode] = useState(false);
  const [isCitationOpen, setIsCitationOpen] = useState(false);

  // Jump state
  const [jumpInfo, setJumpInfo] = useState<{
    isOpen: boolean;
    traversedUSD: number;
    targetBeatTitle: string;
  }>({
    isOpen: false,
    traversedUSD: 0,
    targetBeatTitle: '',
  });

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isRebasingRef = useRef(false);
  const lastUSDRef = useRef(0);

  // All beats
  const allBeats = useRef(getStoryBeats()).current;

  // Current scene layout
  const sceneLayout: SceneLayout = getSceneLayout(sceneId, orientation);
  const currentSegment = sceneLayout.segments[segmentIndex] || sceneLayout.segments[0];

  // Navigate to a specific USD offset within a scene
  const navigateToUSD = useCallback((
    targetUSD: number,
    targetSceneId: SceneId,
    targetOrientation: LayoutOrientation = orientation,
    animate = false
  ) => {
    const safeUSD = Math.max(0, Math.min(targetUSD, SCENES[targetSceneId].totalUSD));
    lastUSDRef.current = safeUSD;
    setCurrentUSD(safeUSD);

    if (targetSceneId !== sceneId) {
      setSceneId(targetSceneId);
    }

    const targetPixel = usdToScenePixel(safeUSD, targetSceneId, targetOrientation);
    setCurrentPixelOffset(targetPixel);

    const { segmentIndex: targetSegIndex, segmentOffset } = logicalToSegmentCoordinate(
      targetPixel,
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

  // Detect orientation on mount and resize
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      const newOrientation: LayoutOrientation = isMobile ? 'vertical' : 'horizontal';
      
      setOrientation((prevOrientation) => {
        if (prevOrientation !== newOrientation) {
          // Preserve narrative position across orientation change
          const savedUSD = lastUSDRef.current;
          setTimeout(() => {
            navigateToUSD(savedUSD, sceneId, newOrientation);
          }, 50);
        }
        return newOrientation;
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigateToUSD, sceneId]);

  // Update active beat based on current USD
  useEffect(() => {
    lastUSDRef.current = currentUSD;

    // Find closest beat in current scene
    const sceneBeats = sceneLayout.beats;
    let foundBeat: StoryBeat | null = null;
    let minDistance = Infinity;

    for (const b of sceneBeats) {
      const dist = Math.abs(b.offsetInParentUSD - currentUSD);
      // Tolerance: within 10% or within $1B / $10B depending on fortune size
      const tolerance = Math.max(sceneLayout.totalUSD * 0.05, 5_000_000_000);
      if (dist < tolerance && dist < minDistance) {
        minDistance = dist;
        foundBeat = b;
      }
    }

    // Fallback: if at very start of scene, select first beat
    if (!foundBeat && sceneBeats.length > 0) {
      if (currentUSD < sceneBeats[0].offsetInParentUSD) {
        foundBeat = sceneBeats[0];
      } else {
        foundBeat = sceneBeats[sceneBeats.length - 1];
      }
    }

    setActiveBeat(foundBeat);

    // Sync URL hash without triggering full history push
    if (foundBeat && window.location.hash !== `#${foundBeat.id}`) {
      window.history.replaceState(null, '', `#${foundBeat.id}`);
    }
  }, [currentUSD, sceneLayout]);

  // Handle URL hash on initial load and popstate
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;

      const targetBeat = allBeats.find((b) => b.id === hash);
      if (targetBeat) {
        navigateToUSD(targetBeat.offsetInParentUSD, targetBeat.parentSceneId, orientation);
      }
    };

    handleHashChange();
    window.addEventListener('popstate', handleHashChange);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handleHashChange);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [allBeats, navigateToUSD, orientation]);

  // Native scroll listener with coordinate rebasing
  const handleScroll = useCallback(() => {
    if (isRebasingRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const isHorizontal = orientation === 'horizontal';
    const scrollPos = isHorizontal ? container.scrollLeft : container.scrollTop;

    // Current segment bounds
    const segLength = currentSegment.pixelLength;

    // FORWARD REBASING: User crossed the end of this segment
    if (scrollPos >= segLength - 2 && segmentIndex < sceneLayout.segments.length - 1) {
      isRebasingRef.current = true;
      const nextIndex = segmentIndex + 1;
      setSegmentIndex(nextIndex);

      const overflow = scrollPos - segLength;
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

    // REVERSE REBASING: User scrolled back past the start of this segment
    if (scrollPos <= 0 && segmentIndex > 0) {
      isRebasingRef.current = true;
      const prevIndex = segmentIndex - 1;
      const prevSeg = sceneLayout.segments[prevIndex];
      setSegmentIndex(prevIndex);

      if (isHorizontal) {
        container.scrollLeft = prevSeg.pixelLength - 1;
      } else {
        container.scrollTop = prevSeg.pixelLength - 1;
      }

      const newLogicalPx = prevSeg.cumulativeStartPixels + prevSeg.pixelLength - 1;
      setCurrentPixelOffset(newLogicalPx);
      setCurrentUSD(scenePixelToUSD(newLogicalPx, sceneId, orientation));

      setTimeout(() => {
        isRebasingRef.current = false;
      }, 30);
      return;
    }

    // Normal in-segment scrolling
    const logicalPx = currentSegment.cumulativeStartPixels + scrollPos;
    setCurrentPixelOffset(logicalPx);
    const derivedUSD = scenePixelToUSD(logicalPx, sceneId, orientation);
    setCurrentUSD(derivedUSD);
  }, [currentSegment, orientation, sceneId, sceneLayout.segments, segmentIndex]);

  // Desktop horizontal wheel translation (preserving browser zoom on ctrlKey)
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    // Preserve browser pinch-to-zoom (ctrlKey)
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    if (orientation === 'horizontal') {
      const container = scrollContainerRef.current;
      if (!container) return;

      // Translate vertical delta into horizontal scroll
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        container.scrollLeft += e.deltaY;
      }
    }
  }, [orientation]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting if focus is in modal or input
      if (isCitationOpen) return;

      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollDelta = 100;
      const pageDelta = 600;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'j') {
        if (orientation === 'horizontal') {
          container.scrollLeft += scrollDelta;
        } else {
          container.scrollTop += scrollDelta;
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'k') {
        if (orientation === 'horizontal') {
          container.scrollLeft -= scrollDelta;
        } else {
          container.scrollTop -= scrollDelta;
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
        navigateToUSD(0, sceneId, orientation, true);
      } else if (e.key === 'End') {
        navigateToUSD(sceneLayout.totalUSD, sceneId, orientation, true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCitationOpen, navigateToUSD, orientation, sceneId, sceneLayout.totalUSD]);

  // Chapter / Scene Selector handler
  const handleSelectScene = (newSceneId: SceneId) => {
    navigateToUSD(0, newSceneId, orientation, false);
  };

  // Previous & Next Beat buttons
  const currentBeatIndex = activeBeat ? activeBeat.index : 1;
  const canPrev = currentBeatIndex > 1;
  const canNext = currentBeatIndex < 30;

  const handlePrevBeat = () => {
    if (!canPrev) return;
    const prevBeat = allBeats[currentBeatIndex - 2];
    if (prevBeat) {
      navigateToUSD(prevBeat.offsetInParentUSD, prevBeat.parentSceneId, orientation, true);
    }
  };

  const handleNextBeat = () => {
    if (!canNext) return;
    const nextBeat = allBeats[currentBeatIndex];
    if (nextBeat) {
      navigateToUSD(nextBeat.offsetInParentUSD, nextBeat.parentSceneId, orientation, true);
    }
  };

  // Jump forward across uninterrupted wealth
  const handleJumpNext = () => {
    let targetBeat: StoryBeat | null = null;

    // Find the next beat in narrative order
    if (currentBeatIndex < 30) {
      targetBeat = allBeats[currentBeatIndex];
    } else {
      // Jump to the end of current fortune
      const traversed = sceneLayout.totalUSD - currentUSD;
      navigateToUSD(sceneLayout.totalUSD, sceneId, orientation, true);
      setJumpInfo({
        isOpen: true,
        traversedUSD: Math.max(0, traversed),
        targetBeatTitle: 'End of ' + SCENES[sceneId].title,
      });
      return;
    }

    if (targetBeat) {
      const traversed = Math.abs(targetBeat.offsetInParentUSD - currentUSD);
      navigateToUSD(targetBeat.offsetInParentUSD, targetBeat.parentSceneId, orientation, true);
      setJumpInfo({
        isOpen: true,
        traversedUSD: traversed,
        targetBeatTitle: targetBeat.title,
      });
    }
  };

  return (
    <div className={styles.viewport}>
      {/* Background Wealth Canvas */}
      <WealthCanvas
        sceneId={sceneId}
        sceneLayout={sceneLayout}
        currentPixelOffset={currentPixelOffset}
        orientation={orientation}
        isOverviewMode={isOverviewMode}
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
        {/* Virtual Runway Sized Exactly to Current Segment */}
        <div
          className={styles.runway}
          style={
            orientation === 'horizontal'
              ? { width: `${currentSegment.pixelLength}px`, height: '100%' }
              : { width: '100%', height: `${currentSegment.pixelLength}px` }
          }
        />
      </div>

      {/* Active Story Beat Callout Overlay */}
      <StoryOverlay
        activeBeat={activeBeat}
        onOpenCitation={() => setIsCitationOpen(true)}
      />

      {/* Persistent Scale HUD and Navigation Controls */}
      <WealthHUD
        currentSceneId={sceneId}
        currentUSD={currentUSD}
        activeBeat={activeBeat}
        onSelectScene={handleSelectScene}
        onPrevBeat={handlePrevBeat}
        onNextBeat={handleNextBeat}
        onJumpNext={handleJumpNext}
        canPrev={canPrev}
        canNext={canNext}
        isOverviewMode={isOverviewMode}
        onToggleOverview={() => setIsOverviewMode((prev) => !prev)}
        onOpenCitation={() => setIsCitationOpen(true)}
      />

      {/* Jump Traversal Toast Notification */}
      <JumpModal
        isOpen={jumpInfo.isOpen}
        traversedUSD={jumpInfo.traversedUSD}
        targetBeatTitle={jumpInfo.targetBeatTitle}
        onClose={() => setJumpInfo((prev) => ({ ...prev, isOpen: false }))}
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
