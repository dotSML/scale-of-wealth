import { describe, it, expect } from 'vitest';
import {
  getJourneyLayout,
  getDistanceToNextLandmark,
  scrollOffsetToUSD,
} from '../lib/scene-geometry';
import { SNAPSHOT_DATA } from '../data/snapshot';
import { DESKTOP_CORRIDOR_HEIGHT, MOBILE_CORRIDOR_WIDTH } from '../lib/wealth-math';

describe('Continuous Scene Geometry & Layout', () => {
  it('builds canonical desktop horizontal journey with 500px corridor height', () => {
    const layout = getJourneyLayout('horizontal');
    expect(layout.orientation).toBe('horizontal');
    expect(layout.crossDimensionPx).toBe(DESKTOP_CORRIDOR_HEIGHT);
    expect(layout.crossDimensionPx).toBe(500);

    // Corridors: $1B, $1T, Forbes 400
    expect(layout.corridors.length).toBe(3);

    const [billion, trillion, forbes400] = layout.corridors;

    // $1B corridor: 2,000px wide
    expect(billion.lengthPx).toBe(2_000);
    expect(billion.totalUSD).toBe(SNAPSHOT_DATA.oneBillion.value);

    // $1T corridor: 2,000,000px wide
    expect(trillion.lengthPx).toBe(2_000_000);
    expect(trillion.totalUSD).toBe(SNAPSHOT_DATA.oneTrillion.value);

    // Forbes 400 corridor: 13,200,000px wide
    expect(forbes400.lengthPx).toBe(13_200_000);
    expect(forbes400.totalUSD).toBe(SNAPSHOT_DATA.forbes400Wealth.value);
  });

  it('builds canonical mobile vertical journey with 300px corridor width', () => {
    const layout = getJourneyLayout('vertical');
    expect(layout.orientation).toBe('vertical');
    expect(layout.crossDimensionPx).toBe(MOBILE_CORRIDOR_WIDTH);
    expect(layout.crossDimensionPx).toBe(300);

    const [billion, trillion, forbes400] = layout.corridors;

    // $1B corridor at 300px width: 1,000,000 / 300 = 3,333.33px tall
    expect(billion.lengthPx).toBeCloseTo(3333.333, 2);

    // $1T corridor at 300px width: 1,000,000,000 / 300 = 3,333,333.33px tall
    expect(trillion.lengthPx).toBeCloseTo(3333333.333, 2);

    // Forbes 400 at 300px width: 6,600,000,000 / 300 = 22,000,000px tall
    expect(forbes400.lengthPx).toBe(22_000_000);
  });

  it('positions Elon Musk marker at true proportion (89.2%) inside the $1T corridor', () => {
    const layout = getJourneyLayout('horizontal');
    const trillion = layout.corridors.find((c) => c.id === 'trillion-corridor')!;
    const muskLandmark = layout.landmarks.find((l) => l.id === 'musk')!;

    expect(muskLandmark).toBeDefined();
    const offsetInTrillion = muskLandmark.offsetPx - trillion.startPx;

    // Musk ($892B) at $500,000/px = 1,784,000px into the trillion
    expect(offsetInTrillion).toBe(1_784_000);
    const fractionOfTrillion = offsetInTrillion / trillion.lengthPx;
    expect(fractionOfTrillion).toBeCloseTo(0.892, 4); // 89.2%
  });

  it('correctly maps Forbes 400 finale reserved $1B per member and remainder', () => {
    const layout = getJourneyLayout('horizontal');
    const forbesCorridor = layout.corridors.find((c) => c.id === 'forbes400-corridor')!;
    const reservedLM = layout.landmarks.find((l) => l.id === 'forbes400-reserved')!;
    const remainderLM = layout.landmarks.find((l) => l.id === 'forbes400-remainder')!;

    expect(reservedLM).toBeDefined();
    expect(remainderLM).toBeDefined();

    // Reserved $400B at 500px corridor height: 400,000,000 / 500 = 800,000px
    expect(reservedLM.lengthPx).toBe(800_000);

    // Remainder divider starts at 800,000px
    expect(remainderLM.offsetPx).toBe(forbesCorridor.startPx + 800_000);
  });

  it('calculates distance to upcoming landmark for conservative deceleration', () => {
    const distFromStart = getDistanceToNextLandmark(0, 'horizontal');
    expect(distFromStart).toBeGreaterThan(0);
    expect(distFromStart).toBeLessThan(2_000);

    // Inside the vast empty stretch of $1T (e.g. at 50,000px): distance to Musk is ~1.7M px
    const layout = getJourneyLayout('horizontal');
    const trillion = layout.corridors.find((c) => c.id === 'trillion-corridor')!;
    const emptyPos = trillion.startPx + 50_000;
    const distToMusk = getDistanceToNextLandmark(emptyPos, 'horizontal');
    expect(distToMusk).toBeGreaterThan(1_500_000);
  });

  it('translates scroll offsets into reasonable USD approximations', () => {
    const layout = getJourneyLayout('horizontal');
    const trillion = layout.corridors.find((c) => c.id === 'trillion-corridor')!;

    // Halfway through $1T corridor: exactly $500 billion
    const halfwayPx = trillion.startPx + trillion.lengthPx / 2;
    const derivedUSD = scrollOffsetToUSD(halfwayPx, 'horizontal');
    expect(derivedUSD).toBeCloseTo(500_000_000_000, -5);
  });

  it('caches journey layout instances for referential stability', () => {
    const a = getJourneyLayout('horizontal');
    const b = getJourneyLayout('horizontal');
    expect(a).toBe(b);
  });
});
