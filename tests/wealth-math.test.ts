import { describe, it, expect } from 'vitest';
import {
  dollarsToArea,
  areaToDollars,
  areaToSquareDimensions,
  areaToDesktopCorridor,
  areaToMobileCorridor,
  getHouseholdMarkerDimensions,
  yearsToAccumulate,
  dailySavingsOverYears,
  yearsToSpend,
  percentageOf,
  wealthRemainingAfterLoss,
  forbes400RemainingAfterOneBillionReserve,
  logicalToSegmentCoordinate,
  segmentToLogicalCoordinate,
  formatCurrency,
  DESKTOP_CORRIDOR_HEIGHT,
  MOBILE_CORRIDOR_WIDTH,
  SEGMENT_MAX_PIXELS,
} from '../lib/wealth-math';
import { SNAPSHOT_DATA } from '../data/snapshot';
import { MILESTONES } from '../data/story';

describe('Pure Geometric Scale Engine', () => {
  it('enforces canonical scale: 1 CSS px² = $1,000 USD', () => {
    expect(dollarsToArea(1_000)).toBe(1);
    expect(areaToDollars(1)).toBe(1_000);

    expect(dollarsToArea(1_000_000)).toBe(1_000);
    expect(areaToDollars(1_000)).toBe(1_000_000);

    expect(dollarsToArea(1_000_000_000)).toBe(1_000_000);
    expect(areaToDollars(1_000_000)).toBe(1_000_000_000);

    expect(dollarsToArea(1_000_000_000_000)).toBe(1_000_000_000);
    expect(areaToDollars(1_000_000_000)).toBe(1_000_000_000_000);
  });

  it('calculates square dimensions correctly (side = sqrt(area))', () => {
    const unitSquare = areaToSquareDimensions(dollarsToArea(1_000));
    expect(unitSquare.width).toBe(1);
    expect(unitSquare.height).toBe(1);

    const millionSquare = areaToSquareDimensions(dollarsToArea(1_000_000));
    expect(millionSquare.width).toBeCloseTo(31.62277, 4);
    expect(millionSquare.height).toBeCloseTo(31.62277, 4);

    const billionSquare = areaToSquareDimensions(dollarsToArea(1_000_000_000));
    expect(billionSquare.width).toBe(1_000);
    expect(billionSquare.height).toBe(1_000);
  });

  it('calculates canonical desktop corridor dimensions with fixed 500px height', () => {
    expect(DESKTOP_CORRIDOR_HEIGHT).toBe(500);

    // $1 Billion at 500px height: 1,000,000 / 500 = 2,000px wide
    const billionCorridor = areaToDesktopCorridor(dollarsToArea(1_000_000_000));
    expect(billionCorridor.height).toBe(500);
    expect(billionCorridor.width).toBe(2_000);

    // $1 Trillion at 500px height: 1,000,000,000 / 500 = 2,000,000px wide
    const trillionCorridor = areaToDesktopCorridor(dollarsToArea(1_000_000_000_000));
    expect(trillionCorridor.height).toBe(500);
    expect(trillionCorridor.width).toBe(2_000_000);

    // Forbes 400 ($6.6T) at 500px height: 6,600,000,000 / 500 = 13,200,000px wide
    const forbesCorridor = areaToDesktopCorridor(dollarsToArea(6_600_000_000_000));
    expect(forbesCorridor.height).toBe(500);
    expect(forbesCorridor.width).toBe(13_200_000);
  });

  it('calculates canonical mobile corridor dimensions with fixed 300px width', () => {
    expect(MOBILE_CORRIDOR_WIDTH).toBe(300);

    // $1 Billion at 300px width: 1,000,000 / 300 = 3,333.33px tall
    const billionCorridor = areaToMobileCorridor(dollarsToArea(1_000_000_000));
    expect(billionCorridor.width).toBe(300);
    expect(billionCorridor.height).toBeCloseTo(3333.333, 2);

    // $1 Trillion at 300px width: 1,000,000,000 / 300 = 3,333,333.33px tall
    const trillionCorridor = areaToMobileCorridor(dollarsToArea(1_000_000_000_000));
    expect(trillionCorridor.width).toBe(300);
    expect(trillionCorridor.height).toBeCloseTo(3333333.333, 2);
  });

  it('preserves area identically between desktop and mobile layouts', () => {
    const dollars = 1_000_000_000;
    const canonicalArea = dollarsToArea(dollars);

    const desktop = areaToDesktopCorridor(canonicalArea);
    const mobile = areaToMobileCorridor(canonicalArea);

    expect(desktop.width * desktop.height).toBeCloseTo(canonicalArea, 2);
    expect(mobile.width * mobile.height).toBeCloseTo(canonicalArea, 2);
    expect(desktop.width * desktop.height).toBeCloseTo(mobile.width * mobile.height, 2);
  });

  it('calculates median US household income square dimensions ($83,730)', () => {
    const marker = getHouseholdMarkerDimensions();
    // Area = 83,730 / 1,000 = 83.73 px²
    // Side = sqrt(83.73) ≈ 9.1504... px
    expect(marker.area).toBe(83.73);
    expect(marker.width).toBeCloseTo(9.1504, 3);
    expect(marker.height).toBeCloseTo(9.1504, 3);
  });

  it('calculates 40 years of median household income ($3.35M)', () => {
    const annual = SNAPSHOT_DATA.usMedianHouseholdIncome.value;
    const career40 = annual * 40;
    expect(career40).toBe(3_349_200);
    expect(SNAPSHOT_DATA.usMedianHouseholdIncome40Years.value).toBe(3_349_200);
  });

  it('derives Forbes 400 remaining after reserving $1B per member', () => {
    const result = forbes400RemainingAfterOneBillionReserve();
    expect(result.totalReserved).toBe(400_000_000_000); // $400B
    expect(result.remainingAggregate).toBe(6_200_000_000_000); // $6.2T
    expect(result.percentageRemaining).toBeCloseTo(93.939, 2); // 93.9%
  });
});

describe('Coordinate Rebasing & Segment Math', () => {
  it('correctly maps coordinates into bounded segments under SEGMENT_MAX_PIXELS', () => {
    const pos = 1_250_000;
    const { segmentIndex, segmentOffset, segmentStartLogical } = logicalToSegmentCoordinate(
      pos,
      SEGMENT_MAX_PIXELS
    );

    expect(segmentIndex).toBe(2);
    expect(segmentOffset).toBe(250_000);
    expect(segmentStartLogical).toBe(1_000_000);
    expect(segmentToLogicalCoordinate(segmentIndex, segmentOffset, SEGMENT_MAX_PIXELS)).toBe(pos);
  });
});

describe('Currency Formatter', () => {
  it('formats large values in compact editorial style', () => {
    expect(formatCurrency(1_000, { compact: true })).toBe('$1,000');
    expect(formatCurrency(1_000_000, { compact: true })).toBe('$1 million');
    expect(formatCurrency(1_000_000_000, { compact: true })).toBe('$1 billion');
    expect(formatCurrency(1_000_000_000_000, { compact: true })).toBe('$1 trillion');
    expect(formatCurrency(6_600_000_000_000, { compact: true })).toBe('$6.6 trillion');
  });
});

describe('Story Milestones Definition', () => {
  it('contains the key canonical milestones with valid data', () => {
    expect(MILESTONES.unit.usdValue).toBe(1_000);
    expect(MILESTONES.medianIncome.usdValue).toBe(83_730);
    expect(MILESTONES.million.usdValue).toBe(1_000_000);
    expect(MILESTONES.billion.usdValue).toBe(1_000_000_000);
    expect(MILESTONES.career40Yr.usdValue).toBe(3_349_200);
    expect(MILESTONES.tenBillion.usdValue).toBe(10_000_000_000);
    expect(MILESTONES.trillion.usdValue).toBe(1_000_000_000_000);
    expect(MILESTONES.musk.usdValue).toBe(892_000_000_000);
    expect(MILESTONES.forbes400.usdValue).toBe(6_600_000_000_000);
  });
});
