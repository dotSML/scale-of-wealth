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
  DAYS_PER_YEAR,
} from '@/data/snapshot';

export const DESKTOP_CORRIDOR_HEIGHT = 400; // CSS px
export const MOBILE_CORRIDOR_WIDTH = 300;   // CSS px
export const SEGMENT_MAX_PIXELS = 500_000;  // Safe boundary for native browser layout

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
 * Based on US Median Family Net Worth ($192,900 from Federal Reserve SCF).
 * Area = 192,900 / 1,000 = 192.9 px².
 * Dimensions = sqrt(192.9) ≈ 13.8888... px square.
 */
export function getHouseholdMarkerDimensions(): RectangleDimensions {
  const medianNetWorth = SNAPSHOT_DATA.usMedianFamilyNetWorth.value;
  const area = dollarsToArea(medianNetWorth);
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
 * Beat 18 Derivation:
 * A hypothetical donation from a billionaire expressed as the exact same percentage
 * of net worth for a reference household.
 * 
 * (donation / donorNetWorth) * householdNetWorth
 */
export function proportionalDonation(
  donation: number,
  donorNetWorth: number,
  householdNetWorth: number
): {
  percentage: number;
  equivalentAmount: number;
} {
  if (donorNetWorth <= 0) throw new Error('Donor net worth must be positive');
  const fraction = donation / donorNetWorth;
  const percentage = fraction * 100;
  const equivalentAmount = fraction * householdNetWorth;
  return {
    percentage,
    equivalentAmount,
  };
}

/**
 * Beat 29:
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

export interface FinalePackageItem {
  id: string;
  name: string;
  unitCost: number;
  quantity: number;
  totalCost: number;
  color: string;
}

/**
 * Beat 30:
 * The Grand Finale combined hypothetical social package carved out of the Forbes 400.
 * 
 * - 100,000 homes at $300,000 = $30B
 * - 100,000 teaching positions for 10 years at $100,000/yr = $100B
 * - 1,000,000 college scholarships at $50,000 = $50B
 * - 1,000,000 household grants at $10,000 = $10B
 * Total = $190B
 */
export function calculateFinalePackage(
  forbes400Total = SNAPSHOT_DATA.forbes400Wealth.value
): {
  items: FinalePackageItem[];
  packageTotal: number;
  forbes400Total: number;
  packagePercentage: number;
  remainderAggregate: number;
  remainderPercentage: number;
} {
  const items: FinalePackageItem[] = [
    {
      id: 'homes',
      name: '100,000 homes ($300k each)',
      unitCost: SNAPSHOT_DATA.hypotheticalHomeCost.value,
      quantity: 100_000,
      totalCost: 100_000 * SNAPSHOT_DATA.hypotheticalHomeCost.value, // $30B
      color: '#f59e0b', // amber
    },
    {
      id: 'teachers',
      name: '100,000 teachers for 10 years ($100k/yr)',
      unitCost: SNAPSHOT_DATA.teacherEmploymentCostAnnual.value * 10,
      quantity: 100_000,
      totalCost: 100_000 * (SNAPSHOT_DATA.teacherEmploymentCostAnnual.value * 10), // $100B
      color: '#38bdf8', // sky blue
    },
    {
      id: 'scholarships',
      name: '1,000,000 scholarships ($50k each)',
      unitCost: SNAPSHOT_DATA.hypotheticalScholarshipAmount.value,
      quantity: 1_000_000,
      totalCost: 1_000_000 * SNAPSHOT_DATA.hypotheticalScholarshipAmount.value, // $50B
      color: '#a855f7', // purple
    },
    {
      id: 'grants',
      name: '1,000,000 direct household grants ($10k each)',
      unitCost: SNAPSHOT_DATA.hypotheticalHouseholdGrantAmount.value,
      quantity: 1_000_000,
      totalCost: 1_000_000 * SNAPSHOT_DATA.hypotheticalHouseholdGrantAmount.value, // $10B
      color: '#10b981', // emerald
    },
  ];

  const packageTotal = items.reduce((sum, item) => sum + item.totalCost, 0); // $190B
  const packagePercentage = (packageTotal / forbes400Total) * 100; // ~2.878788%
  const remainderAggregate = forbes400Total - packageTotal; // $6.41T
  const remainderPercentage = (remainderAggregate / forbes400Total) * 100; // ~97.1212%

  return {
    items,
    packageTotal,
    forbes400Total,
    packagePercentage,
    remainderAggregate,
    remainderPercentage,
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
      const digits = precision ?? (val % 1 === 0 ? 0 : 2);
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
