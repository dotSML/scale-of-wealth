/**
 * Scene Geometry and Layout Engine
 * 
 * Manages scenes, bounded segments, coordinate rebasing,
 * viewport rendering projections, and overview calculations.
 */

import { SCENES, SceneId, StoryBeat, getStoryBeats } from '@/data/story';
import {
  dollarsToArea,
  DESKTOP_CORRIDOR_HEIGHT,
  MOBILE_CORRIDOR_WIDTH,
  SEGMENT_MAX_PIXELS,
} from '@/lib/wealth-math';

export type LayoutOrientation = 'horizontal' | 'vertical';

export interface SceneSegment {
  sceneId: SceneId;
  segmentIndex: number;
  totalSegments: number;
  startUSD: number;
  endUSD: number;
  pixelLength: number; // Length along main scrolling axis
  cumulativeStartPixels: number;
}

export interface SceneLayout {
  sceneId: SceneId;
  totalUSD: number;
  totalPixels: number;
  corridorCrossDimension: number; // Height on desktop, width on mobile
  segments: SceneSegment[];
  beats: StoryBeat[];
}

/**
 * Calculates layout for a scene based on orientation.
 */
export function getSceneLayout(
  sceneId: SceneId,
  orientation: LayoutOrientation = 'horizontal',
  segmentMaxPixels = SEGMENT_MAX_PIXELS
): SceneLayout {
  const sceneDef = SCENES[sceneId];
  const allBeats = getStoryBeats();
  const sceneBeats = allBeats.filter((b) => b.parentSceneId === sceneId);

  const totalArea = dollarsToArea(sceneDef.totalUSD);
  let totalPixels: number;
  let corridorCrossDimension: number;

  if (orientation === 'horizontal') {
    corridorCrossDimension = DESKTOP_CORRIDOR_HEIGHT;
    totalPixels = totalArea / DESKTOP_CORRIDOR_HEIGHT;
  } else {
    corridorCrossDimension = MOBILE_CORRIDOR_WIDTH;
    totalPixels = totalArea / MOBILE_CORRIDOR_WIDTH;
  }

  // Segment calculation
  const totalSegments = Math.max(1, Math.ceil(totalPixels / segmentMaxPixels));
  const segments: SceneSegment[] = [];

  let cumulativePixels = 0;
  for (let i = 0; i < totalSegments; i++) {
    const startPx = cumulativePixels;
    const endPx = Math.min(totalPixels, (i + 1) * segmentMaxPixels);
    const pixelLength = endPx - startPx;

    const startFraction = startPx / totalPixels;
    const endFraction = endPx / totalPixels;

    segments.push({
      sceneId,
      segmentIndex: i,
      totalSegments,
      startUSD: sceneDef.totalUSD * startFraction,
      endUSD: sceneDef.totalUSD * endFraction,
      pixelLength,
      cumulativeStartPixels: startPx,
    });

    cumulativePixels = endPx;
  }

  return {
    sceneId,
    totalUSD: sceneDef.totalUSD,
    totalPixels,
    corridorCrossDimension,
    segments,
    beats: sceneBeats,
  };
}

/**
 * Converts a dollar amount within a scene to its main-axis pixel offset.
 */
export function usdToScenePixel(
  usd: number,
  sceneId: SceneId,
  orientation: LayoutOrientation = 'horizontal'
): number {
  const area = dollarsToArea(usd);
  if (orientation === 'horizontal') {
    return area / DESKTOP_CORRIDOR_HEIGHT;
  }
  return area / MOBILE_CORRIDOR_WIDTH;
}

/**
 * Converts a main-axis pixel offset within a scene back to USD.
 */
export function scenePixelToUSD(
  pixel: number,
  sceneId: SceneId,
  orientation: LayoutOrientation = 'horizontal'
): number {
  const crossDimension = orientation === 'horizontal' ? DESKTOP_CORRIDOR_HEIGHT : MOBILE_CORRIDOR_WIDTH;
  const area = pixel * crossDimension;
  return area * 1_000;
}

/**
 * Calculates the uniform scale for Overview Mode to fit the entire scene
 * comfortably into the given viewport dimensions.
 */
export function getOverviewScale(
  sceneId: SceneId,
  viewportWidth: number,
  viewportHeight: number,
  orientation: LayoutOrientation = 'horizontal'
): {
  scaleFactor: number; // Multiplier applied to canonical dimensions (< 1)
  dollarsPerPixelSq: number; // Effective scale in dollars per pixel²
  overviewWidth: number;
  overviewHeight: number;
} {
  const sceneDef = SCENES[sceneId];
  const area = dollarsToArea(sceneDef.totalUSD);

  let canonicalWidth: number;
  let canonicalHeight: number;

  if (orientation === 'horizontal') {
    canonicalWidth = area / DESKTOP_CORRIDOR_HEIGHT;
    canonicalHeight = DESKTOP_CORRIDOR_HEIGHT;
  } else {
    canonicalWidth = MOBILE_CORRIDOR_WIDTH;
    canonicalHeight = area / MOBILE_CORRIDOR_WIDTH;
  }

  // Provide margin inside viewport
  const availableWidth = Math.max(100, viewportWidth - 80);
  const availableHeight = Math.max(100, viewportHeight - 160);

  const scaleX = availableWidth / canonicalWidth;
  const scaleY = availableHeight / canonicalHeight;
  const scaleFactor = Math.min(scaleX, scaleY, 1); // Never zoom in past 1:1

  const overviewWidth = canonicalWidth * scaleFactor;
  const overviewHeight = canonicalHeight * scaleFactor;

  // Since area scales as scaleFactor², dollars per pixel² is:
  // (Canonical $1,000) / (scaleFactor²)
  const dollarsPerPixelSq = 1_000 / (scaleFactor * scaleFactor);

  return {
    scaleFactor,
    dollarsPerPixelSq,
    overviewWidth,
    overviewHeight,
  };
}

/**
 * Finds the currently active Story Beat for a given USD offset within a scene.
 */
export function getActiveBeatForOffset(
  sceneBeats: StoryBeat[],
  currentOffsetUSD: number,
  toleranceUSD: number
): StoryBeat | null {
  if (sceneBeats.length === 0) return null;

  // Find the beat with the smallest distance to currentOffsetUSD within tolerance
  let closestBeat: StoryBeat | null = null;
  let minDistance = Infinity;

  for (const beat of sceneBeats) {
    const distance = Math.abs(beat.offsetInParentUSD - currentOffsetUSD);
    if (distance <= toleranceUSD && distance < minDistance) {
      minDistance = distance;
      closestBeat = beat;
    }
  }

  return closestBeat;
}
