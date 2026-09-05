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
  proportionalDonation,
  forbes400RemainingAfterOneBillionReserve,
  calculateFinalePackage,
  logicalToSegmentCoordinate,
  segmentToLogicalCoordinate,
} from '../lib/wealth-math';
import { SNAPSHOT_DATA } from '../data/snapshot';

describe('Canonical Scale Math', () => {
  it('converts $1,000 to exactly 1 CSS px²', () => {
    expect(dollarsToArea(1_000)).toBe(1);
    expect(areaToDollars(1)).toBe(1_000);
  });

  it('converts $1,000,000 to 1,000 CSS px²', () => {
    expect(dollarsToArea(1_000_000)).toBe(1_000);
  });

  it('converts $1,000,000,000 ($1B) to 1,000,000 CSS px²', () => {
    expect(dollarsToArea(1_000_000_000)).toBe(1_000_000);
  });

  it('converts Musk $892B to 892,000,000 CSS px²', () => {
    expect(dollarsToArea(892_000_000_000)).toBe(892_000_000);
  });

  it('converts Forbes 400 $6.6T to 6,600,000,000 CSS px²', () => {
    expect(dollarsToArea(6_600_000_000_000)).toBe(6_600_000_000);
  });

  it('converts Worldwide Billionaires $20.1T to 20,100,000,000 CSS px²', () => {
    expect(dollarsToArea(20_100_000_000_000)).toBe(20_100_000_000);
  });
});

describe('Geometric Area Invariants', () => {
  const testAmounts = [
    1_000,
    83_730,
    192_900,
    1_000_000,
    1_000_000_000,
    268_000_000_000,
    892_000_000_000,
    6_600_000_000_000,
    20_100_000_000_000,
  ];

  testAmounts.forEach((amount) => {
    it(`preserves mathematical area between desktop and mobile for $${amount}`, () => {
      const area = dollarsToArea(amount);
      const desktop = areaToDesktopCorridor(area, 400);
      const mobile = areaToMobileCorridor(area, 300);

      const desktopArea = desktop.width * desktop.height;
      const mobileArea = mobile.width * mobile.height;

      expect(desktopArea).toBeCloseTo(area, 5);
      expect(mobileArea).toBeCloseTo(area, 5);
      expect(desktopArea).toBeCloseTo(mobileArea, 5);
    });
  });

  it('derives household reference marker dimensions from math function', () => {
    const marker = getHouseholdMarkerDimensions();
    const expectedArea = 192_900 / 1_000; // 192.9 px²
    expect(marker.area).toBe(expectedArea);
    expect(marker.width).toBeCloseTo(Math.sqrt(expectedArea), 6);
    expect(marker.height).toBeCloseTo(Math.sqrt(expectedArea), 6);
    // Specifically verify it is ~13.8888, not hardcoded
    expect(marker.width).toBeGreaterThan(13.88);
    expect(marker.width).toBeLessThan(13.89);
  });
});

describe('Derived Story Arithmetic', () => {
  it('derives years to reach Musk earning $1M annually (Beat 13)', () => {
    const years = yearsToAccumulate(SNAPSHOT_DATA.muskNetWorth.value, 1_000_000);
    expect(years).toBe(892_000);
  });

  it('derives saving $10,000 daily for 2,000 years (Beat 14)', () => {
    const total = dailySavingsOverYears(10_000, 2_000);
    expect(total).toBe(7_305_000_000); // $7.305B
  });

  it('derives years to spend Musk fortune at $1M daily (Beat 15)', () => {
    const years = yearsToSpend(SNAPSHOT_DATA.muskNetWorth.value, 1_000_000);
    expect(years).toBeCloseTo(2442.1629, 3);
  });

  it('derives 1% of Musk fortune (Beat 16) and 99% loss remainder (Beat 17)', () => {
    const onePercent = percentageOf(1, 100) * (SNAPSHOT_DATA.muskNetWorth.value / 100);
    expect(onePercent).toBe(8_920_000_000); // $8.92B

    const remainder = wealthRemainingAfterLoss(SNAPSHOT_DATA.muskNetWorth.value, 0.99);
    expect(remainder).toBeCloseTo(8_920_000_000, 2); // $8.92B
  });

  it('derives Beat 18: $100M donation as % of wealth for $200,000 reference', () => {
    const donation = 100_000_000;
    const musk = SNAPSHOT_DATA.muskNetWorth.value; // $892B
    const householdRef = 200_000; // As specified by user

    const result = proportionalDonation(donation, musk, householdRef);
    expect(result.percentage).toBeCloseTo(0.01121076, 6);
    expect(result.equivalentAmount).toBeCloseTo(22.4215, 3);
    // Explicitly verify $22.42
    expect(result.equivalentAmount.toFixed(2)).toBe('22.42');
  });

  it('derives Forbes 400 remaining after $1B reserve per person (Beat 29)', () => {
    const result = forbes400RemainingAfterOneBillionReserve();
    expect(result.totalReserved).toBe(400_000_000_000); // $400B
    expect(result.remainingAggregate).toBe(6_200_000_000_000); // $6.2T
    expect(result.percentageRemaining).toBeCloseTo(93.939, 2);
  });

  it('derives Grand Finale package and remainder (Beat 30)', () => {
    const finale = calculateFinalePackage();
    expect(finale.packageTotal).toBe(190_000_000_000); // $190B
    expect(finale.forbes400Total).toBe(6_600_000_000_000); // $6.6T
    expect(finale.packagePercentage).toBeCloseTo(2.878787, 4); // ~2.88% or ~2.9%
    expect(finale.remainderAggregate).toBe(6_410_000_000_000); // $6.41T
    expect(finale.remainderPercentage).toBeCloseTo(97.121212, 4); // ~97.1%
  });
});

describe('Story Beats Definition', () => {
  it('generates all 30 beats with valid data and citations', async () => {
    const { getStoryBeats } = await import('../data/story');
    const beats = getStoryBeats();
    expect(beats.length).toBe(30);

    beats.forEach((beat, i) => {
      expect(beat.index).toBe(i + 1);
      expect(beat.id).toBe(`beat-${String(i + 1).padStart(2, '0')}`);
      expect(beat.title).toBeTruthy();
      expect(beat.headline).toBeTruthy();
      expect(beat.copy.length).toBeGreaterThan(0);
      expect(beat.citation.label).toBeTruthy();
      expect(beat.parentFortuneTotalUSD).toBeGreaterThan(0);
      expect(Number.isFinite(beat.offsetInParentUSD)).toBe(true);
    });

    // Beat 18 checks
    const beat18 = beats.find((b) => b.id === 'beat-18')!;
    expect(beat18.headline).toContain('$22.42');
    expect(beat18.derivedMetric?.valueString).toBe('$22.42');

    // Beat 30 checks
    const beat30 = beats.find((b) => b.id === 'beat-30')!;
    expect(beat30.derivedMetric?.valueString).toContain('$190B');
    expect(beat30.derivedMetric?.valueString).toContain('$6.41T');
  });
});

