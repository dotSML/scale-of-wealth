/**
 * Pure Mathematical and Geometric Engine for The Scale of Wealth
 * 
 * Canonical Scale Contract:
 * 1 CSS px² = $1,000 USD
 * Area (px²) = Dollars / 1,000
 * Dollars = Area (px²) * 1,000
 * 
 * Area is preserved identically across desktop and mobile layouts.
 */

import {
  SNAPSHOT_DATA,
  CANONICAL_DOLLARS_PER_PIXEL_SQ,
} from '@/data/snapshot';

export const DESKTOP_CORRIDOR_HEIGHT = 500; // Canonical CSS px
export const MOBILE_CORRIDOR_WIDTH = 300;   // Canonical mobile CSS px
export const SEGMENT_MAX_PIXELS = 500_000;  // Safe boundary for native browser layout
export const DAYS_PER_YEAR = 365.25;

export interface RectangleDimensions {
  width: number;
  height: number;
  area: number;
}

/**
 * Converts a dollar amount into canonical area in CSS px².
 */
export function dollarsToArea(dollars: number): number {
  if (dollars < 0) throw new Error('Dollar amount cannot be negative');
  return dollars / CANONICAL_DOLLARS_PER_PIXEL_SQ;
}

/**
 * Converts canonical area in CSS px² back to dollars.
 */
export function areaToDollars(area: number): number {
  if (area < 0) throw new Error('Area cannot be negative');
  return area * CANONICAL_DOLLARS_PER_PIXEL_SQ;
}

/**
 * Returns dimensions of a square representing the given area.
 * w = h = sqrt(area)
 */
export function areaToSquareDimensions(area: number): RectangleDimensions {
  const side = Math.sqrt(area);
  return {
    width: side,
    height: side,
    area,
  };
}

/**
 * Returns dimensions of a desktop horizontal corridor rectangle for a given area.
 * Height is fixed to corridorHeight; width = area / corridorHeight.
 */
export function areaToDesktopCorridor(
  area: number,
  corridorHeight = DESKTOP_CORRIDOR_HEIGHT
): RectangleDimensions {
  if (corridorHeight <= 0) throw new Error('Corridor height must be positive');
  const width = area / corridorHeight;
  return {
    width,
    height: corridorHeight,
    area,
  };
}

/**
 * Returns dimensions of a mobile vertical corridor rectangle for a given area.
 * Width is fixed to corridorWidth; height = area / corridorWidth.
 */
export function areaToMobileCorridor(
  area: number,
  corridorWidth = MOBILE_CORRIDOR_WIDTH
): RectangleDimensions {
  if (corridorWidth <= 0) throw new Error('Corridor width must be positive');
  const height = area / corridorWidth;
  return {
    width: corridorWidth,
    height,
    area,
  };
}

/**
 * Shared function to calculate the household reference marker dimensions.
 * Based on US Median Household Income ($83,730 from US Census Bureau).
 * Area = 83,730 / 1,000 = 83.73 px².
 * Dimensions = sqrt(83.73) ≈ 9.15px square.
 */
export function getHouseholdMarkerDimensions(): RectangleDimensions {
  const medianIncome = SNAPSHOT_DATA.usMedianHouseholdIncome.value;
  const area = dollarsToArea(medianIncome);
  return areaToSquareDimensions(area);
}

/**
 * Calculates years to accumulate a target fortune given an annual income,
 * assuming zero spending, taxes, or returns.
 */
export function yearsToAccumulate(targetWealth: number, annualIncome: number): number {
  if (annualIncome <= 0) throw new Error('Annual income must be positive');
  return targetWealth / annualIncome;
}

/**
 * Calculates total savings from saving a fixed daily amount over a number of years,
 * using 365.25 days per year, with no inflation or returns.
 */
export function dailySavingsOverYears(
  dailySavings: number,
  years: number,
  daysPerYear = DAYS_PER_YEAR
): number {
  return dailySavings * years * daysPerYear;
}

/**
 * Calculates years to completely exhaust a fortune spending a fixed amount daily,
 * using 365.25 days per year, assuming zero returns or other expenses.
 */
export function yearsToSpend(
  fortune: number,
  dailySpending: number,
  daysPerYear = DAYS_PER_YEAR
): number {
  if (dailySpending <= 0) throw new Error('Daily spending must be positive');
  return fortune / (dailySpending * daysPerYear);
}

/**
 * Calculates the percentage that a part represents of a whole.
 */
export function percentageOf(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

/**
 * Calculates the wealth remaining after losing a specified fraction.
 */
export function wealthRemainingAfterLoss(fortune: number, lossFraction: number): number {
  return fortune * (1 - lossFraction);
}

/**
 * Forbes 400 aggregate wealth remaining after reserving $1 billion per person.
 */
export function forbes400RemainingAfterOneBillionReserve(
  forbes400Total = SNAPSHOT_DATA.forbes400Wealth.value,
  memberCount = 400,
  reservePerPerson = 1_000_000_000
): {
  totalReserved: number;
  remainingAggregate: number;
  percentageRemaining: number;
} {
  const totalReserved = memberCount * reservePerPerson;
  const remainingAggregate = forbes400Total - totalReserved;
  const percentageRemaining = (remainingAggregate / forbes400Total) * 100;
  return {
    totalReserved,
    remainingAggregate,
    percentageRemaining,
  };
}

/**
 * Bounded Segment Coordinate Rebasing:
 * Converts a continuous logical coordinate into a discrete segment index
 * and an in-segment offset bounded within [0, SEGMENT_MAX_PIXELS].
 */
export function logicalToSegmentCoordinate(
  logicalPos: number,
  segmentSize = SEGMENT_MAX_PIXELS
): {
  segmentIndex: number;
  segmentOffset: number;
  segmentStartLogical: number;
} {
  const safePos = Math.max(0, logicalPos);
  const segmentIndex = Math.floor(safePos / segmentSize);
  const segmentOffset = safePos % segmentSize;
  const segmentStartLogical = segmentIndex * segmentSize;
  return {
    segmentIndex,
    segmentOffset,
    segmentStartLogical,
  };
}

/**
 * Reconstructs continuous logical coordinate from segment coordinates.
 */
export function segmentToLogicalCoordinate(
  segmentIndex: number,
  segmentOffset: number,
  segmentSize = SEGMENT_MAX_PIXELS
): number {
  return segmentIndex * segmentSize + segmentOffset;
}

/**
 * Formats a currency value cleanly for editorial display.
 */
export function formatCurrency(
  amount: number,
  options?: {
    compact?: boolean;
    precision?: number;
  }
): string {
  const { compact = false, precision } = options || {};

  if (compact) {
    if (amount >= 1_000_000_000_000) {
      const val = amount / 1_000_000_000_000;
      const digits = precision ?? (val % 1 === 0 ? 0 : (Number.isInteger(val * 10) ? 1 : 2));
      return `$${val.toFixed(digits)} trillion`;
    }
    if (amount >= 1_000_000_000) {
      const val = amount / 1_000_000_000;
      const digits = precision ?? (val % 1 === 0 ? 0 : 1);
      return `$${val.toFixed(digits)} billion`;
    }
    if (amount >= 1_000_000) {
      const val = amount / 1_000_000;
      const digits = precision ?? (val % 1 === 0 ? 0 : 1);
      return `$${val.toFixed(digits)} million`;
    }
    if (amount >= 1_000) {
      return `$${Math.round(amount).toLocaleString('en-US')}`;
    }
    return `$${amount.toFixed(precision ?? 2)}`;
  }

  if (Number.isInteger(amount)) {
    return `$${amount.toLocaleString('en-US')}`;
  }
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
