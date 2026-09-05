import { describe, it, expect } from 'vitest';
import {
  getSceneLayout,
  usdToScenePixel,
  scenePixelToUSD,
  getOverviewScale,
} from '../lib/scene-geometry';
import { SNAPSHOT_DATA } from '../data/snapshot';
import { SEGMENT_MAX_PIXELS } from '../lib/wealth-math';

describe('Scene Geometry and Segment Layout', () => {
  it('calculates Musk layout with bounded segments under SEGMENT_MAX_PIXELS', () => {
    const layout = getSceneLayout('musk', 'horizontal');
    expect(layout.totalUSD).toBe(SNAPSHOT_DATA.muskNetWorth.value); // $892B
    // Total pixels: 892M / 400 = 2,230,000 px
    expect(layout.totalPixels).toBe(2_230_000);

    // Number of 500k segments: ceil(2,230,000 / 500,000) = 5
    expect(layout.segments.length).toBe(5);

    layout.segments.forEach((seg) => {
      expect(seg.pixelLength).toBeLessThanOrEqual(SEGMENT_MAX_PIXELS);
    });

    const sumPixels = layout.segments.reduce((acc, s) => acc + s.pixelLength, 0);
    expect(sumPixels).toBe(layout.totalPixels);
  });

  it('calculates Beat 26 Worldwide Billionaires ($20.1T) with 101 safe bounded segments', () => {
    const layout = getSceneLayout('global', 'horizontal');
    expect(layout.totalUSD).toBe(20_100_000_000_000); // $20.1T
    // Total pixels: 20,100,000,000 / 400 = 50,250,000 px
    expect(layout.totalPixels).toBe(50_250_000);

    // 50,250,000 / 500,000 = 100.5 -> 101 segments
    expect(layout.segments.length).toBe(101);

    // Every single segment is safely bounded
    layout.segments.forEach((seg) => {
      expect(seg.pixelLength).toBeLessThanOrEqual(SEGMENT_MAX_PIXELS);
    });

    const sumPixels = layout.segments.reduce((acc, s) => acc + s.pixelLength, 0);
    expect(sumPixels).toBe(layout.totalPixels);
  });

  it('correctly maps USD to pixels and back invertibly', () => {
    const testUSD = 42_500_000_000;
    const px = usdToScenePixel(testUSD, 'musk', 'horizontal');
    const backUSD = scenePixelToUSD(px, 'musk', 'horizontal');
    expect(backUSD).toBeCloseTo(testUSD, 1);
  });

  it('calculates overview scale fitting the viewport with accurate scale legend', () => {
    const overview = getOverviewScale('musk', 1280, 800, 'horizontal');
    expect(overview.scaleFactor).toBeLessThan(1);
    expect(overview.overviewWidth).toBeLessThanOrEqual(1280);
    expect(overview.overviewHeight).toBeLessThanOrEqual(800);
    expect(overview.dollarsPerPixelSq).toBeGreaterThan(1_000);
  });

  it('allocates generous authored editorial spacing to ordinary money layout instead of 8px', () => {
    const ordinaryLayout = getSceneLayout('ordinary', 'horizontal');
    expect(ordinaryLayout.totalPixels).toBe(6800);
    expect(ordinaryLayout.beats.length).toBe(6);
    // Opening beat 1 ($1,000) at 450px
    expect(ordinaryLayout.beats[0].editorialPlacementPx).toBe(450);
    // Career beat 6 at 5,750px
    expect(ordinaryLayout.beats[5].editorialPlacementPx).toBe(5750);
  });

  it('stabilizes scene layout instances through caching', () => {
    const layoutA = getSceneLayout('musk', 'horizontal');
    const layoutB = getSceneLayout('musk', 'horizontal');
    expect(layoutA).toBe(layoutB); // identical reference
  });
});

