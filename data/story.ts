/**
 * The Scale of Wealth - Canonical Story & Milestone Specification
 * 
 * Sourced: 5 September 2026
 * 
 * Reduced, disciplined narrative:
 * 1. Intro
 * 2. $1,000 (1 px² = $1,000)
 * 3. US Median Household Income ($83,730)
 * 4. $1 Million (1,000 px²)
 * 5. $1 Billion (1,000,000 px² with $1M reference)
 * 6. $1 Trillion (Hero order of magnitude: $1B ref, 40-year median income, 1% / $10B, emptiness, Elon Musk $892B marker)
 * 7. Forbes 400 ($6.6T combined wealth)
 * 8. Finale: 400 × $1B reserved ($400B) vs the vast $6.2T remainder (93.9%)
 */

import { SNAPSHOT_DATA } from '@/data/snapshot';
import {
  DESKTOP_CORRIDOR_HEIGHT,
  MOBILE_CORRIDOR_WIDTH,
  dollarsToArea,
} from '@/lib/wealth-math';

export interface Milestone {
  id: string;
  title: string;
  subtitle?: string;
  usdValue: number;
  formattedUSD: string;
  observationNote?: string;
}

export const MILESTONES: Record<string, Milestone> = {
  unit: {
    id: 'unit',
    title: '$1,000',
    subtitle: '1 pixel of area represents $1,000',
    usdValue: SNAPSHOT_DATA.unitDollar.value,
    formattedUSD: '$1,000',
  },
  medianIncome: {
    id: 'median-income',
    title: '$83,730',
    subtitle: 'Median US household annual income',
    usdValue: SNAPSHOT_DATA.usMedianHouseholdIncome.value,
    formattedUSD: '$83,730',
    observationNote: 'US Census Bureau · 2024 calendar year',
  },
  million: {
    id: 'million',
    title: '$1 million',
    subtitle: '1,000 pixels of area',
    usdValue: SNAPSHOT_DATA.oneMillion.value,
    formattedUSD: '$1 million',
  },
  billion: {
    id: 'billion',
    title: '$1 billion',
    subtitle: '1,000,000 pixels of area',
    usdValue: SNAPSHOT_DATA.oneBillion.value,
    formattedUSD: '$1 billion',
  },
  career40Yr: {
    id: 'career-40yr',
    title: '$3.35 million',
    subtitle: '40 years of gross income at today’s median household income',
    usdValue: SNAPSHOT_DATA.usMedianHouseholdIncome40Years.value,
    formattedUSD: '$3.35 million',
    observationNote: '$83,730 × 40 years · US Census Bureau baseline',
  },
  tenBillion: {
    id: 'ten-billion',
    title: '$10 billion',
    subtitle: '1% of $1 trillion. Losing 99% still leaves ten thousand million dollars.',
    usdValue: SNAPSHOT_DATA.tenBillion.value,
    formattedUSD: '$10 billion',
  },
  trillion: {
    id: 'trillion',
    title: '$1 trillion',
    subtitle: 'A clean symbolic benchmark for modern extreme fortunes',
    usdValue: SNAPSHOT_DATA.oneTrillion.value,
    formattedUSD: '$1 trillion',
  },
  musk: {
    id: 'musk',
    title: '$892 billion',
    subtitle: 'Elon Musk estimated net worth',
    usdValue: SNAPSHOT_DATA.muskNetWorth.value,
    formattedUSD: '$892 billion',
    observationNote: 'Forbes Real-Time estimate · 1 Sept 2026',
  },
  forbes400: {
    id: 'forbes-400',
    title: '$6.6 trillion',
    subtitle: 'Combined wealth of the 400 richest Americans',
    usdValue: SNAPSHOT_DATA.forbes400Wealth.value,
    formattedUSD: '$6.6 trillion',
    observationNote: 'Forbes 400 list · 2025/2026',
  },
  forbes400Reserved: {
    id: 'forbes-400-reserved',
    title: 'Every one of the 400 keeps $1 billion',
    subtitle: '$400 billion reserved (6.1%)',
    usdValue: SNAPSHOT_DATA.forbes400Reserved.value,
    formattedUSD: '$400 billion',
  },
  forbes400Remainder: {
    id: 'forbes-400-remainder',
    title: 'This is what remains',
    subtitle: '$6.2 trillion (93.9%)',
    usdValue: SNAPSHOT_DATA.forbes400Remainder.value,
    formattedUSD: '$6.2 trillion',
  },
};
