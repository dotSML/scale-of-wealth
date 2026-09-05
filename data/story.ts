/**
 * The Scale of Wealth - Narrative Story Specification
 * 
 * 30 Comparison Beats organized into coherent parent scenes.
 * Comparisons are placed INSIDE the fortunes being explored, rather than
 * forcing every comparison to be a separate detached rectangle.
 */

import { SNAPSHOT_DATA } from '@/data/snapshot';
import {
  dollarsToArea,
  areaToDesktopCorridor,
  areaToMobileCorridor,
  areaToSquareDimensions,
  yearsToAccumulate,
  dailySavingsOverYears,
  yearsToSpend,
  proportionalDonation,
  forbes400RemainingAfterOneBillionReserve,
  calculateFinalePackage,
  formatCurrency,
  DESKTOP_CORRIDOR_HEIGHT,
  MOBILE_CORRIDOR_WIDTH,
} from '@/lib/wealth-math';

export type SceneId = 
  | 'ordinary'
  | 'ladder'
  | 'musk'
  | 'forbes400'
  | 'global'
  | 'finale';

export interface BeatCitation {
  label: string;
  sourceText: string;
  url?: string;
  date: string;
  category: 'observed' | 'estimate' | 'hypothetical';
}

export interface StoryBeat {
  id: string; // e.g. 'beat-01'
  index: number; // 1 to 30
  chapter: number; // 1 to 5
  chapterTitle: string;
  title: string;
  headline: string;
  copy: string[];
  parentSceneId: SceneId;
  parentFortuneName: string;
  parentFortuneTotalUSD: number;
  
  // Position relative to parent fortune (in USD)
  offsetInParentUSD: number;
  
  // Direct monetary comparison value
  comparisonUSD?: number;
  comparisonLabel?: string;
  
  // Calculated metrics
  derivedMetric?: {
    label: string;
    valueString: string;
    calculationDetails: string;
  };

  citation: BeatCitation;
  editorialPlacementPx: number;
  visibleRangePx: [number, number];
  shortCaption: string;
  shapeType: 'pixel' | 'square' | 'corridor' | 'slice';
  shapeWidth: number;
  shapeHeight: number;
  shapeColor: string;
  referenceBeatIds?: string[];
}

export const SCENE_ORDER: SceneId[] = ['ordinary', 'ladder', 'musk', 'forbes400', 'global', 'finale'];

export interface SceneDefinition {
  id: SceneId;
  title: string;
  shortName: string;
  totalUSD: number;
  isCorridor: boolean; // true for long rectangles, false for small square sequences
  editorialLengthPx: number;
  description: string;
}

export const SCENES: Record<SceneId, SceneDefinition> = {
  ordinary: {
    id: 'ordinary',
    title: 'Ordinary Money',
    shortName: 'Household Scale',
    totalUSD: SNAPSHOT_DATA.usMedianHouseholdIncome.value * 40, // $3.35M
    isCorridor: false,
    editorialLengthPx: 6800,
    description: 'Human-scale finances: from a single thousand-dollar pixel to a forty-year career.',
  },
  ladder: {
    id: 'ladder',
    title: 'The Ladder',
    shortName: 'The Millionaire Gulf',
    totalUSD: SNAPSHOT_DATA.bezosNetWorth.value, // $268B
    isCorridor: false,
    editorialLengthPx: 13500,
    description: 'Stepping from one million to one billion, and into the modern centi-billionaire class.',
  },
  musk: {
    id: 'musk',
    title: 'Elon Musk’s Fortune',
    shortName: 'Musk ($892B)',
    totalUSD: SNAPSHOT_DATA.muskNetWorth.value, // $892B
    isCorridor: true,
    editorialLengthPx: 2230000,
    description: 'Walking the world’s largest individual fortune, with human lifetimes and public programs embedded within.',
  },
  forbes400: {
    id: 'forbes400',
    title: 'The Forbes 400',
    shortName: 'Forbes 400 ($6.6T)',
    totalUSD: SNAPSHOT_DATA.forbes400Wealth.value, // $6.6T
    isCorridor: true,
    editorialLengthPx: 16500000,
    description: 'The collective wealth of the four hundred richest Americans.',
  },
  global: {
    id: 'global',
    title: 'Worldwide Billionaires',
    shortName: 'Global Billionaires ($20.1T)',
    totalUSD: SNAPSHOT_DATA.worldwideBillionaireWealth.value, // $20.1T
    isCorridor: true,
    editorialLengthPx: 50250000,
    description: 'The aggregate wealth of all 3,428 billionaires on Earth.',
  },
  finale: {
    id: 'finale',
    title: 'The Carve-Out',
    shortName: 'The Finale Package',
    totalUSD: SNAPSHOT_DATA.forbes400Wealth.value, // $6.6T
    isCorridor: true,
    editorialLengthPx: 16500000,
    description: 'Carving a transformative $190 billion social investment out of the Forbes 400.',
  },
};

/**
 * Builds the complete list of 30 Story Beats with exact derived math and citations.
 */

export interface BeatVisualLayout {
  editorialPlacementPx: number;
  visibleRangePx: [number, number];
  shortCaption: string;
  shapeType: 'pixel' | 'square' | 'corridor' | 'slice';
  shapeWidth: number;
  shapeHeight: number;
  shapeColor: string;
  referenceBeatIds?: string[];
}

export const BEAT_LAYOUT_CONFIG: Record<string, BeatVisualLayout> = {
  'beat-01': {
    editorialPlacementPx: 450,
    visibleRangePx: [0, 900],
    shortCaption: 'One single square pixel ($1,000). Every comparison that follows preserves this exact physical scale contract.',
    shapeType: 'pixel',
    shapeWidth: 1,
    shapeHeight: 1,
    shapeColor: '#f59e0b',
  },
  'beat-02': {
    editorialPlacementPx: 1350,
    visibleRangePx: [900, 1800],
    shortCaption: 'Average annual cost of employer-sponsored family health insurance in the US ($26,993). Area: 27 px².',
    shapeType: 'square',
    shapeWidth: 5.2,
    shapeHeight: 5.2,
    shapeColor: '#38bdf8',
  },
  'beat-03': {
    editorialPlacementPx: 2250,
    visibleRangePx: [1800, 2700],
    shortCaption: 'Gross annual income of the median American household across all earners before taxes ($83,730).',
    shapeType: 'square',
    shapeWidth: 9.15,
    shapeHeight: 9.15,
    shapeColor: '#34d399',
  },
  'beat-04': {
    editorialPlacementPx: 3250,
    visibleRangePx: [2700, 3850],
    shortCaption: 'Total net worth of the median American family ($192,900)—everything owned minus all debt. Keep this in view.',
    shapeType: 'square',
    shapeWidth: 13.89,
    shapeHeight: 13.89,
    shapeColor: '#60a5fa',
  },
  'beat-05': {
    editorialPlacementPx: 4450,
    visibleRangePx: [3850, 5100],
    shortCaption: 'Purchase price of a modest family home ($300,000), typically requiring thirty years of monthly mortgage payments.',
    shapeType: 'square',
    shapeWidth: 17.32,
    shapeHeight: 17.32,
    shapeColor: '#fbbf24',
  },
  'beat-06': {
    editorialPlacementPx: 5750,
    visibleRangePx: [5100, 6800],
    shortCaption: 'Forty years of continuous labor earning the median household income ($3.35M cumulative gross earnings).',
    shapeType: 'square',
    shapeWidth: 57.87,
    shapeHeight: 57.87,
    shapeColor: '#818cf8',
    referenceBeatIds: ['beat-04'],
  },
  'beat-07': {
    editorialPlacementPx: 700,
    visibleRangePx: [0, 1500],
    shortCaption: 'One million dollars: 1,000 square pixels (31.6 × 31.6 px). A milestone providing lifelong security. Beside it sits median net worth ($193k).',
    shapeType: 'square',
    shapeWidth: 31.62,
    shapeHeight: 31.62,
    shapeColor: '#10b981',
    referenceBeatIds: ['beat-04'],
  },
  'beat-08': {
    editorialPlacementPx: 2200,
    visibleRangePx: [1500, 3100],
    shortCaption: 'Ten million dollars: 10,000 square pixels (100 × 100 px). Generational wealth, private investments, and high-tier estates.',
    shapeType: 'square',
    shapeWidth: 100,
    shapeHeight: 100,
    shapeColor: '#06b6d4',
    referenceBeatIds: ['beat-07'],
  },
  'beat-09': {
    editorialPlacementPx: 4100,
    visibleRangePx: [3100, 5500],
    shortCaption: 'One hundred million dollars: 100,000 square pixels. Private aircraft and family foundations. Still one-tenth of a billionaire.',
    shapeType: 'square',
    shapeWidth: 316.23,
    shapeHeight: 316.23,
    shapeColor: '#a855f7',
    referenceBeatIds: ['beat-07'],
  },
  'beat-10': {
    editorialPlacementPx: 6200,
    visibleRangePx: [5500, 9500],
    shortCaption: 'One billion is one thousand millionaires. At our scale, it stretches 2,500 pixels. Notice the tiny $1M square sitting right at the entrance.',
    shapeType: 'corridor',
    shapeWidth: 2500,
    shapeHeight: 400,
    shapeColor: '#f59e0b',
    referenceBeatIds: ['beat-07', 'beat-04'],
  },
  'beat-11': {
    editorialPlacementPx: 10500,
    visibleRangePx: [9500, 13500],
    shortCaption: 'Jeff Bezos’s estimated fortune ($268B) stretches 670,000 pixels long—the length of two football fields if printed on paper.',
    shapeType: 'corridor',
    shapeWidth: 670000,
    shapeHeight: 400,
    shapeColor: '#f59e0b',
  },
  'beat-12': {
    editorialPlacementPx: 0,
    visibleRangePx: [0, 2000],
    shortCaption: 'Elon Musk: $892 Billion. Richest individual recorded in history. This single rectangle stretches 2,230,000 pixels. Scroll to explore what fits inside.',
    shapeType: 'corridor',
    shapeWidth: 2230000,
    shapeHeight: 400,
    shapeColor: '#f59e0b',
  },
  'beat-13': {
    editorialPlacementPx: 25,
    visibleRangePx: [2000, 8000],
    shortCaption: 'Paid $1,000,000 every single year with zero taxes or expenses, you would need 892,000 years to reach this fortune—three human species lifespans.',
    shapeType: 'slice',
    shapeWidth: 25,
    shapeHeight: 400,
    shapeColor: '#38bdf8',
  },
  'beat-14': {
    editorialPlacementPx: 18262.5,
    visibleRangePx: [15000, 21000],
    shortCaption: 'Saving $10,000 every day since 26 AD totals $7.3 billion. Looking at the corridor ahead, that is less than 1% of Musk’s wealth.',
    shapeType: 'slice',
    shapeWidth: 18262.5,
    shapeHeight: 400,
    shapeColor: '#10b981',
  },
  'beat-16': {
    editorialPlacementPx: 22300,
    visibleRangePx: [21000, 23000],
    shortCaption: 'Just one single percent of Musk’s fortune is $8.92 billion—larger than the annual operating budgets of major world cities.',
    shapeType: 'slice',
    shapeWidth: 22300,
    shapeHeight: 400,
    shapeColor: '#eab308',
  },
  'beat-20': {
    editorialPlacementPx: 23250,
    visibleRangePx: [23000, 28000],
    shortCaption: 'WHO annual resource target to deploy bed nets, diagnostics, and treatments globally to eliminate malaria ($9.3B)—about 1% of Musk.',
    shapeType: 'slice',
    shapeWidth: 23250,
    shapeHeight: 400,
    shapeColor: '#ec4899',
  },
  'beat-19': {
    editorialPlacementPx: 32500,
    visibleRangePx: [28000, 50000],
    shortCaption: 'UN World Food Programme total 2026 requirement to deliver emergency nutrition to 110 million starving people: $13 billion (1.46% of Musk).',
    shapeType: 'slice',
    shapeWidth: 32500,
    shapeHeight: 400,
    shapeColor: '#ef4444',
  },
  'beat-21': {
    editorialPlacementPx: 75000,
    visibleRangePx: [65000, 100000],
    shortCaption: '$30 billion could build or purchase 100,000 permanent homes ($300k each). Notice how narrow this slice looks against the remainder.',
    shapeType: 'slice',
    shapeWidth: 75000,
    shapeHeight: 400,
    shapeColor: '#f59e0b',
  },
  'beat-23': {
    editorialPlacementPx: 125000,
    visibleRangePx: [110000, 160000],
    shortCaption: 'One million full-tuition higher education scholarships of $50,000 each: $50 billion (5.6% of Musk).',
    shapeType: 'slice',
    shapeWidth: 125000,
    shapeHeight: 400,
    shapeColor: '#a855f7',
  },
  'beat-22': {
    editorialPlacementPx: 250000,
    visibleRangePx: [230000, 290000],
    shortCaption: '$100 billion would fully fund 100,000 teachers ($100k/yr total employment cost) for an entire decade, educating millions of children.',
    shapeType: 'slice',
    shapeWidth: 250000,
    shapeHeight: 400,
    shapeColor: '#38bdf8',
  },
  'beat-18': {
    editorialPlacementPx: 350000,
    visibleRangePx: [330000, 380000],
    shortCaption: 'A headline-grabbing $100 million gift from Musk equals $22.42 for a family worth $200,000—the financial equivalent of buying a pizza.',
    shapeType: 'slice',
    shapeWidth: 250,
    shapeHeight: 400,
    shapeColor: '#06b6d4',
  },
  'beat-17': {
    editorialPlacementPx: 1500000,
    visibleRangePx: [1480000, 1530000],
    shortCaption: 'If Musk lost 99% of his entire fortune, he would still possess $8.92 billion—remaining among Earth’s richest people.',
    shapeType: 'slice',
    shapeWidth: 22300,
    shapeHeight: 400,
    shapeColor: '#ef4444',
  },
  'beat-15': {
    editorialPlacementPx: 2210000,
    visibleRangePx: [2180000, 2230000],
    shortCaption: 'Spending $1,000,000 cash under a mattress every single day with zero returns would take 2,442 years to exhaust Musk’s fortune.',
    shapeType: 'corridor',
    shapeWidth: 20000,
    shapeHeight: 400,
    shapeColor: '#f59e0b',
  },
  'beat-25': {
    editorialPlacementPx: 0,
    visibleRangePx: [0, 50000],
    shortCaption: 'The 400 richest Americans collectively hold $6.6 trillion—more wealth than the bottom 60% of the United States combined.',
    shapeType: 'corridor',
    shapeWidth: 16500000,
    shapeHeight: 400,
    shapeColor: '#f59e0b',
  },
  'beat-27': {
    editorialPlacementPx: 165000,
    visibleRangePx: [140000, 200000],
    shortCaption: 'One percent of the Forbes 400 is $66 billion—exceeding the annual defense or education budgets of many industrialized nations.',
    shapeType: 'slice',
    shapeWidth: 165000,
    shapeHeight: 400,
    shapeColor: '#eab308',
  },
  'beat-29': {
    editorialPlacementPx: 1000000,
    visibleRangePx: [900000, 1200000],
    shortCaption: 'Reserving $1,000,000,000 for each of the 400 members ($400B reserved) leaves $6.2 trillion (93.9%) remaining untouched.',
    shapeType: 'slice',
    shapeWidth: 1000000,
    shapeHeight: 400,
    shapeColor: '#10b981',
  },
  'beat-26': {
    editorialPlacementPx: 0,
    visibleRangePx: [0, 50000],
    shortCaption: '$20.1 trillion across all 3,428 billionaires on Earth. More economic value than the annual GDP of every nation except the US.',
    shapeType: 'corridor',
    shapeWidth: 50250000,
    shapeHeight: 400,
    shapeColor: '#f59e0b',
  },
  'beat-28': {
    editorialPlacementPx: 502500,
    visibleRangePx: [450000, 580000],
    shortCaption: 'A 1% contribution from global billionaires yields $201 billion—enough to end hunger, malaria, and build worldwide climate resilience.',
    shapeType: 'slice',
    shapeWidth: 502500,
    shapeHeight: 400,
    shapeColor: '#eab308',
  },
  'beat-24': {
    editorialPlacementPx: 25000,
    visibleRangePx: [20000, 35000],
    shortCaption: 'Direct $10,000 emergency cash grants to 1,000,000 families facing eviction or medical crisis: $10 billion.',
    shapeType: 'slice',
    shapeWidth: 25000,
    shapeHeight: 400,
    shapeColor: '#10b981',
  },
  'beat-30': {
    editorialPlacementPx: 0,
    visibleRangePx: [0, 500000],
    shortCaption: 'Combining 100k homes ($30B), 100k teachers ($100B), 1M scholarships ($50B), and 1M grants ($10B) equals $190B (2.9% of Forbes 400). $6.41T remains.',
    shapeType: 'corridor',
    shapeWidth: 16500000,
    shapeHeight: 400,
    shapeColor: '#f59e0b',
  },
};

export function getStoryBeats(): StoryBeat[] {
  const muskVal = SNAPSHOT_DATA.muskNetWorth.value; // $892B
  const bezosVal = SNAPSHOT_DATA.bezosNetWorth.value; // $268B
  const forbes400Val = SNAPSHOT_DATA.forbes400Wealth.value; // $6.6T
  const globalVal = SNAPSHOT_DATA.worldwideBillionaireWealth.value; // $20.1T
  const medIncome = SNAPSHOT_DATA.usMedianHouseholdIncome.value; // $83,730
  const medNetWorth = SNAPSHOT_DATA.usMedianFamilyNetWorth.value; // $192,900
  const insPremium = SNAPSHOT_DATA.familyHealthInsurancePremium.value; // $26,993
  const homeCost = SNAPSHOT_DATA.hypotheticalHomeCost.value; // $300,000

  // Derived values
  const fortyYearsEarnings = medIncome * 40; // $3,349,200
  const yearsToMuskAt1M = yearsToAccumulate(muskVal, 1_000_000); // 892,000 yrs
  const save10kDaily2000Yrs = dailySavingsOverYears(10_000, 2_000); // $7.305B
  const yearsToSpendMuskAt1MDaily = yearsToSpend(muskVal, 1_000_000); // ~2442.2 yrs
  const onePctMusk = muskVal * 0.01; // $8.92B
  const ninetyNinePctLossMusk = muskVal * 0.01; // $8.92B
  const beat18 = proportionalDonation(100_000_000, muskVal, 200_000); // $22.42
  const forbes1Pct = forbes400Val * 0.01; // $66B
  const global1Pct = globalVal * 0.01; // $201B
  const forbesReserve = forbes400RemainingAfterOneBillionReserve();
  const finale = calculateFinalePackage();
  type RawBeat = Omit<StoryBeat, keyof BeatVisualLayout>;
  const rawBeats: RawBeat[] = [
    // CHAPTER 1: ORDINARY MONEY (Beats 1-6)
    {
      id: 'beat-01',
      index: 1,
      chapter: 1,
      chapterTitle: 'Ordinary Money',
      title: 'One Thousand Dollars',
      headline: '$1,000 is one single pixel.',
      copy: [
        'This tiny square is one CSS pixel wide and one CSS pixel tall.',
        'At our scale, one pixel of area represents exactly one thousand dollars. Every rectangle that follows is drawn to this identical, unwavering physical proportion.',
      ],
      parentSceneId: 'ordinary',
      parentFortuneName: 'Human Scale Finances',
      parentFortuneTotalUSD: fortyYearsEarnings,
      offsetInParentUSD: 1_000,
      comparisonUSD: 1_000,
      comparisonLabel: '$1,000 (1 px²)',
      citation: {
        label: 'Scale Contract',
        sourceText: 'Canonical baseline: 1 CSS pixel² = $1,000 USD.',
        date: '2026-09-05',
        category: 'observed',
      },
    },
    {
      id: 'beat-02',
      index: 2,
      chapter: 1,
      chapterTitle: 'Ordinary Money',
      title: 'Family Health Insurance',
      headline: 'Annual premium: $26,993.',
      copy: [
        'The average annual cost of employer-sponsored family health insurance in the United States, combining employer and worker contributions.',
        'It occupies roughly 27 square pixels—about the size of a lowercase letter on your screen.',
      ],
      parentSceneId: 'ordinary',
      parentFortuneName: 'Human Scale Finances',
      parentFortuneTotalUSD: fortyYearsEarnings,
      offsetInParentUSD: insPremium,
      comparisonUSD: insPremium,
      comparisonLabel: '$26,993 / year',
      citation: {
        label: 'KFF Employer Health Benefits Survey',
        sourceText: 'Average annual employer-sponsored family coverage premium.',
        url: SNAPSHOT_DATA.familyHealthInsurancePremium.url,
        date: '2025',
        category: 'observed',
      },
    },
    {
      id: 'beat-03',
      index: 3,
      chapter: 1,
      chapterTitle: 'Ordinary Money',
      title: 'Median Household Income',
      headline: '$83,730 per year.',
      copy: [
        'The gross annual income of the median American household across all earners before taxes.',
        'Half of all households in the United States earn more than this in an entire year of labor; half earn less.',
      ],
      parentSceneId: 'ordinary',
      parentFortuneName: 'Human Scale Finances',
      parentFortuneTotalUSD: fortyYearsEarnings,
      offsetInParentUSD: medIncome,
      comparisonUSD: medIncome,
      comparisonLabel: '$83,730 annual income',
      citation: {
        label: 'US Census Bureau (CPS ASEC)',
        sourceText: 'Income in the United States: 2024.',
        url: SNAPSHOT_DATA.usMedianHouseholdIncome.url,
        date: '2024',
        category: 'observed',
      },
    },
    {
      id: 'beat-04',
      index: 4,
      chapter: 1,
      chapterTitle: 'Ordinary Money',
      title: 'Median Family Net Worth',
      headline: '$192,900 accumulated net worth.',
      copy: [
        'The total net worth of the median American family—everything they own (home equity, retirement accounts, vehicle, savings) minus all mortgages, student loans, and credit card debt.',
        'This 193-pixel square is our persistent scale marker. As you travel through billions and trillions, keep this square in view.',
      ],
      parentSceneId: 'ordinary',
      parentFortuneName: 'Human Scale Finances',
      parentFortuneTotalUSD: fortyYearsEarnings,
      offsetInParentUSD: medNetWorth,
      comparisonUSD: medNetWorth,
      comparisonLabel: '$192,900 total net worth',
      citation: {
        label: 'Federal Reserve Survey of Consumer Finances',
        sourceText: 'Survey of Consumer Finances (SCF) 2022 survey.',
        url: SNAPSHOT_DATA.usMedianFamilyNetWorth.url,
        date: '2022',
        category: 'observed',
      },
    },
    {
      id: 'beat-05',
      index: 5,
      chapter: 1,
      chapterTitle: 'Ordinary Money',
      title: 'A Modest Home',
      headline: 'A hypothetical $300,000 home.',
      copy: [
        'A 300-pixel square represents the purchase price of a modest single-family home or apartment.',
        'For most working families, purchasing this requires committing thirty years of monthly mortgage payments.',
      ],
      parentSceneId: 'ordinary',
      parentFortuneName: 'Human Scale Finances',
      parentFortuneTotalUSD: fortyYearsEarnings,
      offsetInParentUSD: homeCost,
      comparisonUSD: homeCost,
      comparisonLabel: '$300,000 home',
      citation: {
        label: 'Scale of Wealth Model Benchmark',
        sourceText: 'Hypothetical modest home unit acquisition cost.',
        date: '2026-09-05',
        category: 'hypothetical',
      },
    },
    {
      id: 'beat-06',
      index: 6,
      chapter: 1,
      chapterTitle: 'Ordinary Money',
      title: 'A 40-Year Working Career',
      headline: '$3,349,200: forty years of earnings.',
      copy: [
        'If an American household earned today’s median income ($83,730) every year without interruption for forty years, their cumulative gross earnings would total approximately $3.35 million.',
        'Note: this represents constant-income gross earnings over time, not observed lifetime earnings or accumulated net worth.',
      ],
      parentSceneId: 'ordinary',
      parentFortuneName: 'Human Scale Finances',
      parentFortuneTotalUSD: fortyYearsEarnings,
      offsetInParentUSD: fortyYearsEarnings,
      comparisonUSD: fortyYearsEarnings,
      comparisonLabel: '$3,349,200 (40 yrs median earnings)',
      derivedMetric: {
        label: 'Gross 40-Year Earnings',
        valueString: '$3,349,200',
        calculationDetails: '$83,730 × 40 years',
      },
      citation: {
        label: 'Derived Census Calculation',
        sourceText: '$83,730 median household income multiplied by 40 years.',
        date: '2026-09-05',
        category: 'hypothetical',
      },
    },

    // CHAPTER 2: THE LADDER (Beats 7-12)
    {
      id: 'beat-07',
      index: 7,
      chapter: 2,
      chapterTitle: 'The Ladder',
      title: 'One Million Dollars',
      headline: '$1,000,000: comfortable security.',
      copy: [
        'One million dollars is 1,000 square pixels—a neat square roughly 31.6 pixels on each side.',
        'It is a life-changing milestone for an ordinary person, providing financial independence and comfortable retirement.',
      ],
      parentSceneId: 'ladder',
      parentFortuneName: 'The Wealth Ladder',
      parentFortuneTotalUSD: bezosVal,
      offsetInParentUSD: 1_000_000,
      comparisonUSD: 1_000_000,
      comparisonLabel: '$1 Million',
      citation: {
        label: 'Scale Benchmark',
        sourceText: '$1,000,000 = 1,000 CSS px².',
        date: '2026-09-05',
        category: 'observed',
      },
    },
    {
      id: 'beat-08',
      index: 8,
      chapter: 2,
      chapterTitle: 'The Ladder',
      title: 'Ten Million Dollars',
      headline: '$10,000,000: generational wealth.',
      copy: [
        'Ten million dollars is 10,000 square pixels (100 pixels × 100 pixels).',
        'This is the realm of elite professionals, successful entrepreneurs, and high-tier private wealth.',
      ],
      parentSceneId: 'ladder',
      parentFortuneName: 'The Wealth Ladder',
      parentFortuneTotalUSD: bezosVal,
      offsetInParentUSD: 10_000_000,
      comparisonUSD: 10_000_000,
      comparisonLabel: '$10 Million',
      citation: {
        label: 'Scale Benchmark',
        sourceText: '$10,000,000 = 10,000 CSS px².',
        date: '2026-09-05',
        category: 'observed',
      },
    },
    {
      id: 'beat-09',
      index: 9,
      chapter: 2,
      chapterTitle: 'The Ladder',
      title: 'One Hundred Million Dollars',
      headline: '$100,000,000: ultra-high net worth.',
      copy: [
        'One hundred million dollars is 100,000 square pixels—a square over 316 pixels across.',
        'Private jets, multiple estates, and private foundations. Yet we have not reached a single billionaire.',
      ],
      parentSceneId: 'ladder',
      parentFortuneName: 'The Wealth Ladder',
      parentFortuneTotalUSD: bezosVal,
      offsetInParentUSD: 100_000_000,
      comparisonUSD: 100_000_000,
      comparisonLabel: '$100 Million',
      citation: {
        label: 'Scale Benchmark',
        sourceText: '$100,000,000 = 100,000 CSS px².',
        date: '2026-09-05',
        category: 'observed',
      },
    },
    {
      id: 'beat-10',
      index: 10,
      chapter: 2,
      chapterTitle: 'The Ladder',
      title: 'One Billion Dollars',
      headline: '$1,000,000,000: the gulf.',
      copy: [
        'The difference between a millionaire and a billionaire is not subtle: one billion is one thousand millionaires.',
        'At our scale, one billion dollars is 1,000,000 square pixels. As a 400-pixel-high bar, it stretches 2,500 pixels wide. You must scroll past several entire desktop screens just to cross a single billion.',
      ],
      parentSceneId: 'ladder',
      parentFortuneName: 'The Wealth Ladder',
      parentFortuneTotalUSD: bezosVal,
      offsetInParentUSD: 1_000_000_000,
      comparisonUSD: 1_000_000_000,
      comparisonLabel: '$1 Billion',
      derivedMetric: {
        label: 'Ratio to $1 Million',
        valueString: '1,000×',
        calculationDetails: '$1,000,000,000 ÷ $1,000,000',
      },
      citation: {
        label: 'Scale Benchmark',
        sourceText: '$1,000,000,000 = 1,000,000 CSS px².',
        date: '2026-09-05',
        category: 'observed',
      },
    },
    {
      id: 'beat-11',
      index: 11,
      chapter: 2,
      chapterTitle: 'The Ladder',
      title: 'Jeff Bezos',
      headline: '$268,000,000,000: a centi-billionaire.',
      copy: [
        'Jeff Bezos’s estimated net worth stood at $268 billion on 1 September 2026.',
        'At 400 pixels high, this single fortune is 670,000 pixels long. If printed at 96 DPI, this rectangle would stretch the length of two football fields.',
      ],
      parentSceneId: 'ladder',
      parentFortuneName: 'Jeff Bezos Net Worth',
      parentFortuneTotalUSD: bezosVal,
      offsetInParentUSD: bezosVal,
      comparisonUSD: bezosVal,
      comparisonLabel: 'Jeff Bezos ($268B)',
      citation: {
        label: 'Forbes Real-Time Billionaires',
        sourceText: 'Jeff Bezos estimated net worth, 1 September 2026.',
        url: SNAPSHOT_DATA.bezosNetWorth.url,
        date: '2026-09-01',
        category: 'estimate',
      },
    },
    {
      id: 'beat-12',
      index: 12,
      chapter: 2,
      chapterTitle: 'The Ladder',
      title: 'Elon Musk: The Peak',
      headline: 'Elon Musk: $892,000,000,000.',
      copy: [
        'The richest individual recorded in modern history, with an estimated net worth of $892 billion on 1 September 2026.',
        'This single rectangle is 2,230,000 pixels long. It would take over 25 minutes of continuous high-speed trackpad scrolling just to reach the other side. Let’s explore what fits inside.',
      ],
      parentSceneId: 'musk',
      parentFortuneName: 'Elon Musk Fortune',
      parentFortuneTotalUSD: muskVal,
      offsetInParentUSD: 0,
      comparisonUSD: muskVal,
      comparisonLabel: 'Elon Musk ($892B)',
      citation: {
        label: 'Forbes Real-Time Billionaires',
        sourceText: 'Elon Musk estimated net worth, 1 September 2026.',
        url: SNAPSHOT_DATA.muskNetWorth.url,
        date: '2026-09-01',
        category: 'estimate',
      },
    },

    // CHAPTER 3: BEYOND A LIFETIME (Beats 13-18, embedded inside Musk's fortune)
    {
      id: 'beat-13',
      index: 13,
      chapter: 3,
      chapterTitle: 'Beyond a Lifetime',
      title: 'Earning $1M Every Year',
      headline: '892,000 years to reach Musk.',
      copy: [
        'If you were paid an extraordinary salary of $1,000,000 every single year and spent zero pennies on food, taxes, or housing, you would need 892,000 years to accumulate this fortune.',
        'Anatomically modern humans have only existed on Earth for about 300,000 years. You would need to have worked three entire species lifespans.',
      ],
      parentSceneId: 'musk',
      parentFortuneName: 'Elon Musk Fortune',
      parentFortuneTotalUSD: muskVal,
      offsetInParentUSD: 10_000_000,
      derivedMetric: {
        label: 'Years at $1M / year',
        valueString: '892,000 years',
        calculationDetails: '$892,000,000,000 ÷ $1,000,000/yr',
      },
      citation: {
        label: 'Derived Calculation',
        sourceText: 'Assumes constant $1,000,000 annual income, no taxes, no expenses, no inflation.',
        date: '2026-09-05',
        category: 'hypothetical',
      },
    },
    {
      id: 'beat-14',
      index: 14,
      chapter: 3,
      chapterTitle: 'Beyond a Lifetime',
      title: 'Saving $10,000 Every Day for 2,000 Years',
      headline: '2,000 years of saving: $7.3 billion.',
      copy: [
        'Imagine saving $10,000 every single day since the year 26 AD—from the height of the Roman Empire, through the Middle Ages, the Renaissance, and the Industrial Revolution.',
        'After two millennia of relentless daily savings, you would have $7.305 billion. Looking at the corridor ahead, that is less than 1% of Musk’s rectangle.',
      ],
      parentSceneId: 'musk',
      parentFortuneName: 'Elon Musk Fortune',
      parentFortuneTotalUSD: muskVal,
      offsetInParentUSD: save10kDaily2000Yrs,
      comparisonUSD: save10kDaily2000Yrs,
      comparisonLabel: '$7.305B (2,000 yrs @ $10k/day)',
      derivedMetric: {
        label: 'Total Accumulated',
        valueString: '$7,305,000,000',
        calculationDetails: '$10,000/day × 2,000 years × 365.25 days/year',
      },
      citation: {
        label: 'Derived Calculation',
        sourceText: 'Calculated using 365.25 days per year, zero inflation, zero returns.',
        date: '2026-09-05',
        category: 'hypothetical',
      },
    },
    {
      id: 'beat-15',
      index: 15,
      chapter: 3,
      chapterTitle: 'Beyond a Lifetime',
      title: 'Spending $1M Every Day',
      headline: '2,442 years to spend it all.',
      copy: [
        'If Elon Musk put his entire wealth under a mattress with zero interest and spent $1,000,000 cash every day, it would take roughly 2,442 years to run out of money.',
        'If he had started spending one million dollars every day during the Roman Republic in 416 BC, he would still have money remaining today.',
      ],
      parentSceneId: 'musk',
      parentFortuneName: 'Elon Musk Fortune',
      parentFortuneTotalUSD: muskVal,
      offsetInParentUSD: muskVal - 50_000_000,
      derivedMetric: {
        label: 'Years to Exhaust Fortune',
        valueString: '2,442.2 years',
        calculationDetails: '$892,000,000,000 ÷ ($1,000,000 × 365.25 days)',
      },
      citation: {
        label: 'Derived Calculation',
        sourceText: 'Calculated using 365.25 days per year, zero investment returns.',
        date: '2026-09-05',
        category: 'hypothetical',
      },
    },
    {
      id: 'beat-16',
      index: 16,
      chapter: 3,
      chapterTitle: 'Beyond a Lifetime',
      title: 'What 1% Represents',
      headline: '1% of Musk’s wealth: $8.92 billion.',
      copy: [
        'A single percent of this fortune is $8.92 billion.',
        'This sliver is larger than the annual operating budgets of major world cities and thousands of entire lifetimes.',
      ],
      parentSceneId: 'musk',
      parentFortuneName: 'Elon Musk Fortune',
      parentFortuneTotalUSD: muskVal,
      offsetInParentUSD: onePctMusk,
      comparisonUSD: onePctMusk,
      comparisonLabel: '1% of Musk ($8.92B)',
      derivedMetric: {
        label: '1% Value',
        valueString: '$8,920,000,000',
        calculationDetails: '$892,000,000,000 × 0.01',
      },
      citation: {
        label: 'Derived Calculation',
        sourceText: '1% of Forbes 1 September 2026 estimate.',
        date: '2026-09-05',
        category: 'estimate',
      },
    },
    {
      id: 'beat-17',
      index: 17,
      chapter: 3,
      chapterTitle: 'Beyond a Lifetime',
      title: 'Losing 99% of Wealth',
      headline: 'After losing 99%: still $8.92 billion.',
      copy: [
        'If Elon Musk suffered a catastrophic market collapse and lost 99% of his total wealth, he would still possess $8.92 billion.',
        'He would remain comfortably in the top 0.0001% richest human beings on the planet, with more wealth than 99.999% of humans could earn in ten thousand years.',
      ],
      parentSceneId: 'musk',
      parentFortuneName: 'Elon Musk Fortune',
      parentFortuneTotalUSD: muskVal,
      offsetInParentUSD: ninetyNinePctLossMusk + 100_000_000,
      derivedMetric: {
        label: 'Remaining Fortune',
        valueString: '$8,920,000,000',
        calculationDetails: '$892,000,000,000 × (1 - 0.99)',
      },
      citation: {
        label: 'Derived Calculation',
        sourceText: 'Arithmetic remainder of $892B after 99% loss.',
        date: '2026-09-05',
        category: 'hypothetical',
      },
    },
    {
      id: 'beat-18',
      index: 18,
      chapter: 3,
      chapterTitle: 'Beyond a Lifetime',
      title: 'The Philanthropic Illusion',
      headline: 'A $100M gift = $22.42 to an ordinary family.',
      copy: [
        'When a billionaire announces a headline-grabbing $100 million philanthropic donation, it seems unfathomably generous.',
        `Expressed as a percentage of net worth ($100M ÷ $892B = ${beat18.percentage.toFixed(5)}%), for an ordinary American family worth the hypothetical $200,000 benchmark, the exact equivalent sacrifice is $${beat18.equivalentAmount.toFixed(2)}.`,
        'It is the financial equivalent of ordering a pizza or buying two cups of coffee.',
      ],
      parentSceneId: 'musk',
      parentFortuneName: 'Elon Musk Fortune',
      parentFortuneTotalUSD: muskVal,
      offsetInParentUSD: 100_000_000,
      comparisonUSD: 100_000_000,
      comparisonLabel: '$100M donation',
      derivedMetric: {
        label: 'Equivalent for $200k Household',
        valueString: `$${beat18.equivalentAmount.toFixed(2)}`,
        calculationDetails: `($100,000,000 ÷ $892,000,000,000) × $200,000 = $${beat18.equivalentAmount.toFixed(2)}`,
      },
      citation: {
        label: 'Derived Proportional Calculation',
        sourceText: 'Derived against the hypothetical $200,000 household net worth reference.',
        date: '2026-09-05',
        category: 'hypothetical',
      },
    },

    // CHAPTER 4: AMOUNTS THAT CHANGE LIVES (Beats 19-24, embedded along Musk's fortune)
    {
      id: 'beat-19',
      index: 19,
      chapter: 4,
      chapterTitle: 'Amounts That Change Lives',
      title: 'UN World Food Programme',
      headline: 'WFP operational need: $13 billion.',
      copy: [
        'The United Nations World Food Programme’s total operational requirement for 2026 to deliver emergency nutrition assistance to 110 million people facing acute food insecurity.',
        'This essential humanitarian lifeline represents just 1.46% of Musk’s single personal fortune.',
      ],
      parentSceneId: 'musk',
      parentFortuneName: 'Elon Musk Fortune',
      parentFortuneTotalUSD: muskVal,
      offsetInParentUSD: SNAPSHOT_DATA.wfpRequirement.value,
      comparisonUSD: SNAPSHOT_DATA.wfpRequirement.value,
      comparisonLabel: 'WFP Requirement ($13B)',
      derivedMetric: {
        label: 'Share of Musk’s Fortune',
        valueString: `${((SNAPSHOT_DATA.wfpRequirement.value / muskVal) * 100).toFixed(2)}%`,
        calculationDetails: '$13,000,000,000 ÷ $892,000,000,000',
      },
      citation: {
        label: 'WFP Operational Plan',
        sourceText: 'WFP at a Glance 2026 operational requirement ($13B to target 110 million people).',
        url: SNAPSHOT_DATA.wfpRequirement.url,
        date: '2026',
        category: 'observed',
      },
    },
    {
      id: 'beat-20',
      index: 20,
      chapter: 4,
      chapterTitle: 'Amounts That Change Lives',
      title: 'Global Malaria Eradication',
      headline: 'Annual malaria target: $9.3 billion.',
      copy: [
        'The World Health Organization’s annual global funding target for malaria response—deploying bed nets, rapid diagnostic tests, artemisinin combination therapies, and vaccines to save hundreds of thousands of children’s lives.',
        'Fully funding the global malaria response for an entire year equals roughly 1.04% of Musk’s net worth.',
      ],
      parentSceneId: 'musk',
      parentFortuneName: 'Elon Musk Fortune',
      parentFortuneTotalUSD: muskVal,
      offsetInParentUSD: SNAPSHOT_DATA.malariaFundingTarget.value,
      comparisonUSD: SNAPSHOT_DATA.malariaFundingTarget.value,
      comparisonLabel: 'WHO Malaria Target ($9.3B)',
      derivedMetric: {
        label: 'Share of Musk’s Fortune',
        valueString: `${((SNAPSHOT_DATA.malariaFundingTarget.value / muskVal) * 100).toFixed(2)}%`,
        calculationDetails: '$9,300,000,000 ÷ $892,000,000,000',
      },
      citation: {
        label: 'WHO Global Malaria Report',
        sourceText: 'WHO annual resource mobilization target for 2025.',
        url: SNAPSHOT_DATA.malariaFundingTarget.url,
        date: '2025',
        category: 'observed',
      },
    },
    {
      id: 'beat-21',
      index: 21,
      chapter: 4,
      chapterTitle: 'Amounts That Change Lives',
      title: '100,000 Permanent Homes',
      headline: '$30 billion: 100,000 homes.',
      copy: [
        'At an assumed $300,000 per home, $30 billion could build or acquire 100,000 permanent homes, transforming entire regional housing crises.',
        'Notice how narrow this slice looks against the remaining $862 billion corridor stretching ahead.',
      ],
      parentSceneId: 'musk',
      parentFortuneName: 'Elon Musk Fortune',
      parentFortuneTotalUSD: muskVal,
      offsetInParentUSD: 30_000_000_000,
      comparisonUSD: 30_000_000_000,
      comparisonLabel: '100,000 Homes ($30B)',
      derivedMetric: {
        label: 'Unit Calculation',
        valueString: '$30,000,000,000',
        calculationDetails: '100,000 homes × $300,000 each',
      },
      citation: {
        label: 'Hypothetical Benchmark',
        sourceText: 'Assumes $300,000 average modest home cost.',
        date: '2026-09-05',
        category: 'hypothetical',
      },
    },
    {
      id: 'beat-22',
      index: 22,
      chapter: 4,
      chapterTitle: 'Amounts That Change Lives',
      title: '100,000 Teachers for a Decade',
      headline: '$100 billion: 100,000 teachers for 10 years.',
      copy: [
        'Assuming a comprehensive $100,000 annual total employment cost (salary, pension, healthcare, and taxes), $100 billion would fully fund 100,000 teachers for an entire decade.',
        'This would permanently educate millions of children across hundreds of school districts.',
      ],
      parentSceneId: 'musk',
      parentFortuneName: 'Elon Musk Fortune',
      parentFortuneTotalUSD: muskVal,
      offsetInParentUSD: 100_000_000_000,
      comparisonUSD: 100_000_000_000,
      comparisonLabel: '100k Teachers × 10 Yrs ($100B)',
      derivedMetric: {
        label: 'Total Program Cost',
        valueString: '$100,000,000,000',
        calculationDetails: '100,000 teachers × $100,000/yr × 10 years',
      },
      citation: {
        label: 'Hypothetical Benchmark',
        sourceText: 'Assumes $100,000 annual total employment cost per teacher.',
        date: '2026-09-05',
        category: 'hypothetical',
      },
    },
    {
      id: 'beat-23',
      index: 23,
      chapter: 4,
      chapterTitle: 'Amounts That Change Lives',
      title: 'One Million College Scholarships',
      headline: '$50 billion: 1,000,000 scholarships.',
      copy: [
        'One million full-tuition or substantial higher education scholarships of $50,000 each.',
        'A transformative investment that would eliminate generational student debt for an entire cohort of young people.',
      ],
      parentSceneId: 'musk',
      parentFortuneName: 'Elon Musk Fortune',
      parentFortuneTotalUSD: muskVal,
      offsetInParentUSD: 50_000_000_000,
      comparisonUSD: 50_000_000_000,
      comparisonLabel: '1M Scholarships ($50B)',
      derivedMetric: {
        label: 'Total Scholarship Fund',
        valueString: '$50,000,000,000',
        calculationDetails: '1,000,000 students × $50,000 grant',
      },
      citation: {
        label: 'Hypothetical Benchmark',
        sourceText: 'Assumes $50,000 scholarship per recipient.',
        date: '2026-09-05',
        category: 'hypothetical',
      },
    },
    {
      id: 'beat-24',
      index: 24,
      chapter: 4,
      chapterTitle: 'Amounts That Change Lives',
      title: 'One Million Household Emergency Grants',
      headline: '$10 billion: 1,000,000 grants of $10,000.',
      copy: [
        'Direct, unconditional emergency cash grants of $10,000 to one million families facing eviction, medical crises, or job loss.',
        'Yet $10 billion takes up barely 1.1% of the Musk fortune.',
      ],
      parentSceneId: 'musk',
      parentFortuneName: 'Elon Musk Fortune',
      parentFortuneTotalUSD: muskVal,
      offsetInParentUSD: 10_000_000_000,
      comparisonUSD: 10_000_000_000,
      comparisonLabel: '1M Grants @ $10k ($10B)',
      derivedMetric: {
        label: 'Total Grants Fund',
        valueString: '$10,000,000,000',
        calculationDetails: '1,000,000 grants × $10,000',
      },
      citation: {
        label: 'Hypothetical Benchmark',
        sourceText: 'Assumes $10,000 direct cash transfer per household.',
        date: '2026-09-05',
        category: 'hypothetical',
      },
    },

    // CHAPTER 5: COLLECTIVE SCALE (Beats 25-30)
    {
      id: 'beat-25',
      index: 25,
      chapter: 5,
      chapterTitle: 'Collective Scale',
      title: 'The Forbes 400',
      headline: '$6.6 trillion: 400 individuals.',
      copy: [
        'The four hundred richest Americans collectively hold $6.6 trillion in wealth.',
        'At 400 pixels high, this corridor is 16.5 million pixels long. These 400 individuals hold more wealth than the bottom 60% of the entire United States population combined.',
      ],
      parentSceneId: 'forbes400',
      parentFortuneName: 'Forbes 400 Collective Wealth',
      parentFortuneTotalUSD: forbes400Val,
      offsetInParentUSD: 0,
      comparisonUSD: forbes400Val,
      comparisonLabel: 'Forbes 400 ($6.6T)',
      citation: {
        label: 'Forbes 400 List',
        sourceText: 'The 2025 Forbes 400 list of wealthiest Americans.',
        url: SNAPSHOT_DATA.forbes400Wealth.url,
        date: '2025-09-09',
        category: 'estimate',
      },
    },
    {
      id: 'beat-26',
      index: 26,
      chapter: 5,
      chapterTitle: 'Collective Scale',
      title: 'Worldwide Billionaire Wealth',
      headline: '$20.1 trillion: 3,428 people.',
      copy: [
        'The aggregate wealth of every billionaire on planet Earth: $20.1 trillion across 3,428 people.',
        'This rectangle is over 50.25 million pixels long—surpassing the physical coordinate limits of modern web browsers. It represents more economic value than the annual GDP of every nation on Earth except the United States.',
      ],
      parentSceneId: 'global',
      parentFortuneName: 'Worldwide Billionaires',
      parentFortuneTotalUSD: globalVal,
      offsetInParentUSD: 0,
      comparisonUSD: globalVal,
      comparisonLabel: 'Worldwide Billionaires ($20.1T)',
      citation: {
        label: 'Forbes World’s Billionaires List',
        sourceText: 'Forbes 40th annual World’s Billionaires list (1 March 2026 snapshot).',
        url: SNAPSHOT_DATA.worldwideBillionaireWealth.url,
        date: '2026-03-01',
        category: 'estimate',
      },
    },
    {
      id: 'beat-27',
      index: 27,
      chapter: 5,
      chapterTitle: 'Collective Scale',
      title: '1% of the Forbes 400',
      headline: '1% of Forbes 400: $66 billion.',
      copy: [
        'One percent of the Forbes 400 aggregate wealth is $66 billion.',
        'This single slice alone exceeds the annual defense or education budgets of many industrialized countries.',
      ],
      parentSceneId: 'forbes400',
      parentFortuneName: 'Forbes 400 Collective Wealth',
      parentFortuneTotalUSD: forbes400Val,
      offsetInParentUSD: forbes1Pct,
      comparisonUSD: forbes1Pct,
      comparisonLabel: '1% of Forbes 400 ($66B)',
      derivedMetric: {
        label: '1% Value',
        valueString: '$66,000,000,000',
        calculationDetails: '$6,600,000,000,000 × 0.01',
      },
      citation: {
        label: 'Derived Calculation',
        sourceText: '1% of Forbes 400 aggregate wealth.',
        date: '2026-09-05',
        category: 'estimate',
      },
    },
    {
      id: 'beat-28',
      index: 28,
      chapter: 5,
      chapterTitle: 'Collective Scale',
      title: '1% of Worldwide Billionaire Wealth',
      headline: '1% of global billionaires: $201 billion.',
      copy: [
        'One percent of global billionaire wealth represents $201 billion.',
        'A single 1% tax on this cohort would easily fund the World Food Programme, eradicate malaria, and leave over $178 billion for global climate resilience.',
      ],
      parentSceneId: 'global',
      parentFortuneName: 'Worldwide Billionaires',
      parentFortuneTotalUSD: globalVal,
      offsetInParentUSD: global1Pct,
      comparisonUSD: global1Pct,
      comparisonLabel: '1% of Global Billionaires ($201B)',
      derivedMetric: {
        label: '1% Value',
        valueString: '$201,000,000,000',
        calculationDetails: '$20,100,000,000,000 × 0.01',
      },
      citation: {
        label: 'Derived Calculation',
        sourceText: '1% of worldwide billionaire wealth.',
        date: '2026-09-05',
        category: 'estimate',
      },
    },
    {
      id: 'beat-29',
      index: 29,
      chapter: 5,
      chapterTitle: 'Collective Scale',
      title: 'Guaranteeing $1B per Person',
      headline: 'Reserve $1B each: $6.2 trillion remains.',
      copy: [
        'Suppose we guaranteed that every single member of the Forbes 400 kept a personal fortune of exactly $1,000,000,000—ensuring lavish private estates, private aircraft, and generational luxury forever.',
        'Reserving $400 billion for them leaves $6,200,000,000,000 ($6.2 trillion) in aggregate wealth remaining (93.9% of the total).',
      ],
      parentSceneId: 'forbes400',
      parentFortuneName: 'Forbes 400 Collective Wealth',
      parentFortuneTotalUSD: forbes400Val,
      offsetInParentUSD: forbesReserve.totalReserved,
      derivedMetric: {
        label: 'Remaining Aggregate',
        valueString: '$6,200,000,000,000',
        calculationDetails: '$6.6T - (400 × $1B) = $6.2T remaining (93.9%)',
      },
      citation: {
        label: 'Derived Calculation',
        sourceText: 'Forbes 400 aggregate minus $1B per member reserve.',
        date: '2026-09-05',
        category: 'hypothetical',
      },
    },
    {
      id: 'beat-30',
      index: 30,
      chapter: 5,
      chapterTitle: 'Collective Scale',
      title: 'The Grand Finale: The Carve-Out',
      headline: '$190 billion: only 2.9% of the Forbes 400.',
      copy: [
        'What if we combined every major public investment we explored? 100,000 homes ($30B), 100,000 teachers for a decade ($100B), one million college scholarships ($50B), and one million household emergency grants ($10B).',
        `The entire combined package totals $190 billion—just ${finale.packagePercentage.toFixed(1)}% of the Forbes 400’s wealth.`,
        `Carving this massive social package out of the front of the rectangle leaves an incomprehensible $${(finale.remainderAggregate / 1_000_000_000_000).toFixed(2)} trillion (97.1%) untouched behind it.`,
      ],
      parentSceneId: 'finale',
      parentFortuneName: 'Forbes 400 Finale Carve-Out',
      parentFortuneTotalUSD: forbes400Val,
      offsetInParentUSD: finale.packageTotal,
      comparisonUSD: finale.packageTotal,
      comparisonLabel: 'Combined Social Package ($190B)',
      derivedMetric: {
        label: 'Package vs Remainder',
        valueString: `$190B (2.9%) vs $6.41T (97.1%)`,
        calculationDetails: '$30B homes + $100B teachers + $50B scholarships + $10B grants = $190B. Forbes 400 remainder: $6.41 trillion.',
      },
      citation: {
        label: 'Combined Model Finale',
        sourceText: 'Derived totals: $190B package is 2.88% of Forbes 400 ($6.6T), leaving $6.41T.',
        date: '2026-09-05',
        category: 'hypothetical',
      },
    },
  ];

  return rawBeats.map((b) => {
    const config = BEAT_LAYOUT_CONFIG[b.id];
    if (config) {
      return { ...b, ...config };
    }
    return {
      ...b,
      editorialPlacementPx: 0,
      visibleRangePx: [0, 1000] as [number, number],
      shortCaption: b.headline,
      shapeType: 'square' as const,
      shapeWidth: 10,
      shapeHeight: 10,
      shapeColor: '#f59e0b',
    };
  });
}
