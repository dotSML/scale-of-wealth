/**
 * The Scale of Wealth - Continuous Geometry & Viewport Projection Engine
 * 
 * Sourced: 5 September 2026
 * 
 * Bounded Geometry Engine:
 * Exposes a single continuous logical coordinate space X (desktop horizontal)
 * or Y (mobile vertical) while bounding all rendered DOM elements strictly to
 * the visible viewport (< 2,000px). The visitor experiences an unbroken,
 * continuous visual journey without hitting browser layout engine limits.
 */

import { SNAPSHOT_DATA } from '@/data/snapshot';
import {
  dollarsToArea,
  DESKTOP_CORRIDOR_HEIGHT,
  MOBILE_CORRIDOR_WIDTH,
} from '@/lib/wealth-math';

export type LayoutOrientation = 'horizontal' | 'vertical';

export interface VisualLandmark {
  id: string;
  type: 'intro' | 'pixel' | 'square' | 'corridor-marker' | 'reference-block';
  usdValue: number;
  offsetPx: number; // Position along scroll axis
  lengthPx: number; // Length along scroll axis
  title: string;
  subtitle?: string;
  observationNote?: string;
  squareSize?: number; // width & height for square units
}

export interface CorridorSection {
  id: string;
  title: string;
  subtitle?: string;
  startUSD: number;
  totalUSD: number;
  startPx: number;
  endPx: number;
  lengthPx: number;
  crossDimensionPx: number; // 500 on desktop, 300 on mobile
  landmarks: VisualLandmark[];
}

export interface JourneyLayout {
  orientation: LayoutOrientation;
  totalLengthPx: number;
  crossDimensionPx: number;
  corridors: CorridorSection[];
  landmarks: VisualLandmark[];
}

// Module-level layout cache
const layoutCache = new Map<LayoutOrientation, JourneyLayout>();

/**
 * Builds the canonical linear journey layout.
 * Desktop: horizontal (height 500px).
 * Mobile: vertical (width 300px).
 */
export function getJourneyLayout(orientation: LayoutOrientation = 'horizontal'): JourneyLayout {
  const cached = layoutCache.get(orientation);
  if (cached) return cached;

  const isHorizontal = orientation === 'horizontal';
  const crossDimensionPx = isHorizontal ? DESKTOP_CORRIDOR_HEIGHT : MOBILE_CORRIDOR_WIDTH;

  // 1. Intro Screen
  const introStart = 0;
  const introLength = isHorizontal ? 1200 : 750;

  // 2. $1,000 Unit Pixel
  const unitStart = introStart + introLength;
  const unitLength = isHorizontal ? 400 : 300;

  // 3. Median US Household Income ($83,730)
  const medianStart = unitStart + unitLength;
  const medianLength = isHorizontal ? 500 : 350;
  const medianSide = Math.sqrt(dollarsToArea(SNAPSHOT_DATA.usMedianHouseholdIncome.value)); // ~9.15px

  // 4. $1 Million (1,000 px²)
  const millionStart = medianStart + medianLength;
  const millionLength = isHorizontal ? 600 : 400;
  const millionSide = Math.sqrt(dollarsToArea(SNAPSHOT_DATA.oneMillion.value)); // ~31.62px

  // 5. $1 Billion Corridor
  const billionStart = millionStart + millionLength + (isHorizontal ? 100 : 60);
  const billionUSD = SNAPSHOT_DATA.oneBillion.value;
  const billionLength = dollarsToArea(billionUSD) / crossDimensionPx; // 2,000px desktop, 3,333.33px mobile
  const billionEnd = billionStart + billionLength;

  // 6. $1 Trillion Corridor (Hero Stage)
  const trillionStart = billionEnd + (isHorizontal ? 200 : 120);
  const trillionUSD = SNAPSHOT_DATA.oneTrillion.value;
  const trillionLength = dollarsToArea(trillionUSD) / crossDimensionPx; // 2,000,000px desktop, 3,333,333.33px mobile
  const trillionEnd = trillionStart + trillionLength;

  // Trillion interior landmarks:
  // - 40 years of median household income ($3.35M)
  const career40USD = SNAPSHOT_DATA.usMedianHouseholdIncome40Years.value;
  const career40Offset = trillionStart + (dollarsToArea(career40USD) / crossDimensionPx);
  const career40Side = Math.sqrt(dollarsToArea(career40USD)); // ~57.87px

  // - 1% Benchmark ($10 billion)
  const tenBillionUSD = SNAPSHOT_DATA.tenBillion.value;
  const tenBillionOffset = trillionStart + (dollarsToArea(tenBillionUSD) / crossDimensionPx);

  // - Elon Musk Current-Snapshot Marker ($892B)
  const muskUSD = SNAPSHOT_DATA.muskNetWorth.value;
  const muskOffset = trillionStart + (dollarsToArea(muskUSD) / crossDimensionPx);

  // 7. Forbes 400 Combined Wealth ($6.6 Trillion)
  const forbesStart = trillionEnd + (isHorizontal ? 200 : 120);
  const forbesUSD = SNAPSHOT_DATA.forbes400Wealth.value;
  const forbesLength = dollarsToArea(forbesUSD) / crossDimensionPx; // 13,200,000px desktop, 22,000,000px mobile
  const forbesEnd = forbesStart + forbesLength;

  // Forbes 400 finale landmarks:
  // - 400 people × $1B each = $400B reserved
  const reservedUSD = SNAPSHOT_DATA.forbes400Reserved.value;
  const reservedLength = dollarsToArea(reservedUSD) / crossDimensionPx; // 800,000px desktop, 1,333,333.33px mobile
  const remainderOffset = forbesStart + reservedLength;

  const landmarks: VisualLandmark[] = [
    {
      id: 'intro',
      type: 'intro',
      usdValue: 0,
      offsetPx: introStart,
      lengthPx: introLength,
      title: 'Wealth, shown to scale',
      subtitle: 'Every pixel of area represents $1,000.',
    },
    {
      id: 'unit',
      type: 'pixel',
      usdValue: 1_000,
      offsetPx: unitStart + (isHorizontal ? 150 : 100),
      lengthPx: 1,
      title: '$1,000',
      subtitle: '1 px² = $1,000',
      squareSize: 1,
    },
    {
      id: 'median-income',
      type: 'square',
      usdValue: SNAPSHOT_DATA.usMedianHouseholdIncome.value,
      offsetPx: medianStart + (isHorizontal ? 150 : 100),
      lengthPx: medianSide,
      title: '$83,730',
      subtitle: 'Median US household annual income',
      observationNote: 'US Census Bureau · 2024 calendar year',
      squareSize: medianSide,
    },
    {
      id: 'million',
      type: 'square',
      usdValue: SNAPSHOT_DATA.oneMillion.value,
      offsetPx: millionStart + (isHorizontal ? 150 : 100),
      lengthPx: millionSide,
      title: '$1 million',
      subtitle: '1,000 pixels of area',
      squareSize: millionSide,
    },
    {
      id: 'billion-entrance',
      type: 'corridor-marker',
      usdValue: SNAPSHOT_DATA.oneBillion.value,
      offsetPx: billionStart,
      lengthPx: billionLength,
      title: '$1 billion',
      subtitle: 'One thousand million dollars',
    },
    {
      id: 'trillion-entrance',
      type: 'corridor-marker',
      usdValue: SNAPSHOT_DATA.oneTrillion.value,
      offsetPx: trillionStart,
      lengthPx: trillionLength,
      title: '$1 trillion',
      subtitle: 'A clean benchmark for modern extreme fortunes',
    },
    {
      id: 'career-40yr',
      type: 'square',
      usdValue: career40USD,
      offsetPx: career40Offset,
      lengthPx: career40Side,
      title: '$3.35 million',
      subtitle: '40 years of gross income at today’s median household income',
      observationNote: '$83,730 × 40 years · US Census Bureau baseline',
      squareSize: career40Side,
    },
    {
      id: 'ten-billion',
      type: 'corridor-marker',
      usdValue: tenBillionUSD,
      offsetPx: tenBillionOffset,
      lengthPx: 10,
      title: '$10 billion',
      subtitle: '1% of $1 trillion. Losing 99% still leaves ten thousand million dollars.',
    },
    {
      id: 'musk',
      type: 'corridor-marker',
      usdValue: muskUSD,
      offsetPx: muskOffset,
      lengthPx: 10,
      title: 'Elon Musk',
      subtitle: '$892B (Forbes estimate · Sept 2026)',
      observationNote: 'Proportional position: 89.2% of $1 trillion',
    },
    {
      id: 'forbes400-entrance',
      type: 'corridor-marker',
      usdValue: forbesUSD,
      offsetPx: forbesStart,
      lengthPx: forbesLength,
      title: '$6.6 trillion',
      subtitle: 'Combined wealth of the 400 richest Americans',
      observationNote: 'Forbes 400 list · 2025/2026',
    },
    {
      id: 'forbes400-reserved',
      type: 'corridor-marker',
      usdValue: reservedUSD,
      offsetPx: forbesStart,
      lengthPx: reservedLength,
      title: 'Every one of the 400 keeps $1 billion',
      subtitle: '$400 billion reserved (6.1%)',
    },
    {
      id: 'forbes400-remainder',
      type: 'corridor-marker',
      usdValue: SNAPSHOT_DATA.forbes400Remainder.value,
      offsetPx: remainderOffset,
      lengthPx: forbesLength - reservedLength,
      title: 'This is what remains',
      subtitle: '$6.2 trillion (93.9%)',
    },
  ];

  const corridors: CorridorSection[] = [
    {
      id: 'billion-corridor',
      title: '$1 billion',
      startUSD: 0,
      totalUSD: billionUSD,
      startPx: billionStart,
      endPx: billionEnd,
      lengthPx: billionLength,
      crossDimensionPx,
      landmarks: landmarks.filter((l) => l.offsetPx >= billionStart && l.offsetPx <= billionEnd),
    },
    {
      id: 'trillion-corridor',
      title: '$1 trillion',
      subtitle: 'A clean benchmark for modern extreme fortunes',
      startUSD: 0,
      totalUSD: trillionUSD,
      startPx: trillionStart,
      endPx: trillionEnd,
      lengthPx: trillionLength,
      crossDimensionPx,
      landmarks: landmarks.filter((l) => l.offsetPx >= trillionStart && l.offsetPx <= trillionEnd),
    },
    {
      id: 'forbes400-corridor',
      title: '$6.6 trillion',
      subtitle: 'Combined wealth of the 400 richest Americans',
      startUSD: 0,
      totalUSD: forbesUSD,
      startPx: forbesStart,
      endPx: forbesEnd,
      lengthPx: forbesLength,
      crossDimensionPx,
      landmarks: landmarks.filter((l) => l.offsetPx >= forbesStart && l.offsetPx <= forbesEnd),
    },
  ];

  const totalLengthPx = forbesEnd + (isHorizontal ? 1000 : 600);

  const layout: JourneyLayout = {
    orientation,
    totalLengthPx,
    crossDimensionPx,
    corridors,
    landmarks,
  };

  layoutCache.set(orientation, layout);
  return layout;
}

/**
 * Returns the distance to the next landmark ahead of the current scroll offset.
 * Used for conservative deceleration in long stretches of empty space.
 */
export function getDistanceToNextLandmark(
  scrollOffset: number,
  orientation: LayoutOrientation = 'horizontal'
): number {
  const layout = getJourneyLayout(orientation);
  for (const lm of layout.landmarks) {
    if (lm.offsetPx > scrollOffset + 80) {
      return lm.offsetPx - scrollOffset;
    }
  }
  return Infinity;
}

/**
 * Derives current USD at scroll position.
 */
export function scrollOffsetToUSD(
  scrollOffset: number,
  orientation: LayoutOrientation = 'horizontal'
): number {
  const layout = getJourneyLayout(orientation);
  for (const c of layout.corridors) {
    if (scrollOffset >= c.startPx && scrollOffset <= c.endPx) {
      const fraction = (scrollOffset - c.startPx) / c.lengthPx;
      return fraction * c.totalUSD;
    }
  }

  // Before corridors
  if (scrollOffset < layout.corridors[0].startPx) {
    const millionLM = layout.landmarks.find((l) => l.id === 'million');
    if (millionLM && scrollOffset >= millionLM.offsetPx) return 1_000_000;
    const medianLM = layout.landmarks.find((l) => l.id === 'median-income');
    if (medianLM && scrollOffset >= medianLM.offsetPx) return SNAPSHOT_DATA.usMedianHouseholdIncome.value;
    return 1_000;
  }

  return SNAPSHOT_DATA.forbes400Wealth.value;
}
