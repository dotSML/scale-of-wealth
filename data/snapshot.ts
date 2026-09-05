/**
 * The Scale of Wealth - Frozen Data Snapshot
 * Assembled: 5 September 2026
 * 
 * Each metric retains its own observation date and cited source.
 * All arithmetic and geometry are derived deterministically in code.
 * No runtime APIs, external fetches, or database lookups.
 */

export interface SourceCitation {
  id: string;
  name: string;
  value: number; // Raw USD or count
  formattedValue: string;
  observationDate: string;
  periodLabel: string;
  publisher: string;
  url: string;
  notes: string;
  category: 'observed' | 'estimate' | 'hypothetical';
}

export const SNAPSHOT_DATE = '2026-09-05';

export const SNAPSHOT_DATA = {
  // Unit & Baseline
  unitDollar: {
    id: 'unit-dollar',
    name: 'Canonical unit: One thousand dollars',
    value: 1_000,
    formattedValue: '$1,000',
    observationDate: '2026-09-05',
    periodLabel: 'Canonical scale contract',
    publisher: 'The Scale of Wealth',
    url: '#scale',
    notes: 'The foundational geometric unit: 1 CSS px² represents exactly $1,000 USD.',
    category: 'observed',
  },

  // US Household Benchmarks
  usMedianHouseholdIncome: {
    id: 'us-median-household-income',
    name: 'US median household annual income',
    value: 83_730,
    formattedValue: '$83,730',
    observationDate: '2024',
    periodLabel: '2024 calendar year (released September 2025)',
    publisher: 'US Census Bureau',
    url: 'https://www.census.gov/library/publications/2025/demo/p60-286.html',
    notes: 'Current Population Survey Annual Social and Economic Supplement (CPS ASEC). Gross annual household income across all workers before taxes.',
    category: 'observed',
  },
  usMedianHouseholdIncome40Years: {
    id: 'us-median-household-income-40yr',
    name: '40 years of gross income at today’s median household income',
    value: 3_349_200,
    formattedValue: '$3.35 million',
    observationDate: '2024',
    periodLabel: '40 × 2024 median income ($83,730)',
    publisher: 'Derived from US Census Bureau',
    url: 'https://www.census.gov/library/publications/2025/demo/p60-286.html',
    notes: 'A simple, defensible human career earnings benchmark: exactly 40 years of income at the latest 2024 median US household income ($83,730 × 40 = $3,349,200).',
    category: 'observed',
  },

  // Scale Benchmarks
  oneMillion: {
    id: 'one-million',
    name: 'One million dollars',
    value: 1_000_000,
    formattedValue: '$1 million',
    observationDate: '2026-09-05',
    periodLabel: 'Mathematical benchmark',
    publisher: 'The Scale of Wealth',
    url: '#scale',
    notes: '1,000 units of $1,000. Exactly 1,000 px² of area (31.62px × 31.62px).',
    category: 'observed',
  },
  oneBillion: {
    id: 'one-billion',
    name: 'One billion dollars',
    value: 1_000_000_000,
    formattedValue: '$1 billion',
    observationDate: '2026-09-05',
    periodLabel: 'Mathematical benchmark',
    publisher: 'The Scale of Wealth',
    url: '#scale',
    notes: '1,000 units of $1 million. Exactly 1,000,000 px² of area (2,000px × 500px corridor).',
    category: 'observed',
  },
  tenBillion: {
    id: 'ten-billion',
    name: 'Ten billion dollars (1% of $1 trillion)',
    value: 10_000_000_000,
    formattedValue: '$10 billion',
    observationDate: '2026-09-05',
    periodLabel: '1% benchmark of $1T',
    publisher: 'The Scale of Wealth',
    url: '#scale',
    notes: 'One percent of one trillion dollars. Losing 99% of one trillion still leaves ten thousand million dollars.',
    category: 'observed',
  },
  oneTrillion: {
    id: 'one-trillion',
    name: 'One trillion dollars',
    value: 1_000_000_000_000,
    formattedValue: '$1 trillion',
    observationDate: '2026-09-05',
    periodLabel: 'Order of magnitude benchmark',
    publisher: 'The Scale of Wealth',
    url: '#scale',
    notes: '1,000 units of $1 billion. Exactly 1,000,000,000 px² of area (2,000,000px × 500px corridor). Clean symbolic benchmark for extreme modern fortunes.',
    category: 'observed',
  },

  // Billionaire Estimates
  muskNetWorth: {
    id: 'musk-net-worth',
    name: 'Elon Musk estimated net worth',
    value: 892_000_000_000,
    formattedValue: '$892 billion',
    observationDate: '2026-09-01',
    periodLabel: '1 September 2026 snapshot',
    publisher: 'Forbes',
    url: 'https://www.forbes.com/sites/forbeswealthteam/article/the-top-ten-richest-people-in-the-world/',
    notes: 'Forbes Real-Time Billionaires estimate. Asset valuation reflects public equity holdings (principally Tesla and SpaceX).',
    category: 'estimate',
  },

  // Collective Wealth Aggregates
  forbes400Wealth: {
    id: 'forbes-400-wealth',
    name: 'Combined wealth of the 400 richest Americans',
    value: 6_600_000_000_000,
    formattedValue: '$6.6 trillion',
    observationDate: '2025-09-09',
    periodLabel: '2025/2026 Forbes 400 list',
    publisher: 'Forbes',
    url: 'https://www.forbes.com/sites/chasewithorn/2025/09/09/the-2025-forbes-400-list-of-wealthiest-americans-facts-and-figures/',
    notes: 'Total aggregate net worth of the 400 richest Americans. Area: 6,600,000,000 px² (13,200,000px × 500px corridor).',
    category: 'estimate',
  },
  forbes400Reserved: {
    id: 'forbes-400-reserved',
    name: '400 members keeping $1 billion each',
    value: 400_000_000_000,
    formattedValue: '$400 billion',
    observationDate: '2026-09-05',
    periodLabel: '400 × $1B reservation',
    publisher: 'The Scale of Wealth Model',
    url: '#methodology',
    notes: 'Reserving $1 billion for every single member of the Forbes 400 totals $400 billion, or 6.06% of their collective wealth.',
    category: 'hypothetical',
  },
  forbes400Remainder: {
    id: 'forbes-400-remainder',
    name: 'Remainder after every member keeps $1 billion',
    value: 6_200_000_000_000,
    formattedValue: '$6.2 trillion',
    observationDate: '2026-09-05',
    periodLabel: 'Remainder ($6.6T - $400B)',
    publisher: 'The Scale of Wealth Model',
    url: '#methodology',
    notes: 'Even after leaving every one of the 400 members with a full billion dollars, $6.2 trillion (93.94%) remains.',
    category: 'hypothetical',
  },
} as const satisfies Record<string, SourceCitation>;

export type SnapshotKey = keyof typeof SNAPSHOT_DATA;

export const CANONICAL_DOLLARS_PER_PIXEL_SQ = 1_000;
