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
  // Billionaire Estimates
  muskNetWorth: {
    id: 'musk-net-worth',
    name: 'Elon Musk estimated net worth',
    value: 892_000_000_000,
    formattedValue: '$892 billion',
    observationDate: '2026-09-01',
    periodLabel: '1 September 2026',
    publisher: 'Forbes',
    url: 'https://www.forbes.com/sites/forbeswealthteam/article/the-top-ten-richest-people-in-the-world/',
    notes: 'Forbes Real-Time Billionaires estimate. Net worth reflects asset equity valuations (primarily Tesla and SpaceX) and is not a liquid cash balance.',
    category: 'estimate',
  },
  bezosNetWorth: {
    id: 'bezos-net-worth',
    name: 'Jeff Bezos estimated net worth',
    value: 268_000_000_000,
    formattedValue: '$268 billion',
    observationDate: '2026-09-01',
    periodLabel: '1 September 2026',
    publisher: 'Forbes',
    url: 'https://www.forbes.com/sites/forbeswealthteam/article/the-top-ten-richest-people-in-the-world/',
    notes: 'Forbes Real-Time Billionaires estimate.',
    category: 'estimate',
  },

  // US Household Benchmarks
  usMedianHouseholdIncome: {
    id: 'us-median-household-income',
    name: 'US median household annual income',
    value: 83_730,
    formattedValue: '$83,730',
    observationDate: '2024',
    periodLabel: '2024 calendar year',
    publisher: 'US Census Bureau',
    url: 'https://www.census.gov/library/publications/2025/demo/p60-286.html',
    notes: 'Current Population Survey Annual Social and Economic Supplement (CPS ASEC). Gross household income across all workers in the household before taxes.',
    category: 'observed',
  },
  usMedianFamilyNetWorth: {
    id: 'us-median-family-net-worth',
    name: 'US median family net worth',
    value: 192_900,
    formattedValue: '$192,900',
    observationDate: '2022',
    periodLabel: '2022 survey',
    publisher: 'Federal Reserve',
    url: 'https://www.federalreserve.gov/publications/files/scf23.pdf',
    notes: 'Survey of Consumer Finances (SCF). The middle family: half of US families have more, half have less. Value represents total assets minus total debts.',
    category: 'observed',
  },
  familyHealthInsurancePremium: {
    id: 'family-health-insurance-premium',
    name: 'Average annual employer-sponsored family health insurance premium',
    value: 26_993,
    formattedValue: '$26,993',
    observationDate: '2025',
    periodLabel: '2025',
    publisher: 'KFF (Kaiser Family Foundation)',
    url: 'https://www.kff.org/health-costs/2025-employer-health-benefits-survey/',
    notes: 'Employer Health Benefits Survey. Combines both employer and worker premium contributions for family coverage.',
    category: 'observed',
  },

  // Collective Wealth Aggregates
  forbes400Wealth: {
    id: 'forbes-400-wealth',
    name: 'Wealth of 400 richest Americans',
    value: 6_600_000_000_000,
    formattedValue: '$6.6 trillion',
    observationDate: '2025-09-09',
    periodLabel: '2025 Forbes 400 list',
    publisher: 'Forbes',
    url: 'https://www.forbes.com/sites/chasewithorn/2025/09/09/the-2025-forbes-400-list-of-wealthiest-americans-facts-and-figures/',
    notes: 'Total aggregate net worth of the 400 richest Americans on the 2025 annual list. Overlaps with individual US billionaire figures; cannot be added together.',
    category: 'estimate',
  },
  worldwideBillionaireWealth: {
    id: 'worldwide-billionaire-wealth',
    name: 'Worldwide billionaire wealth',
    value: 20_100_000_000_000,
    formattedValue: '$20.1 trillion',
    observationDate: '2026-03-01',
    periodLabel: '1 March 2026 snapshot (3,428 individuals)',
    publisher: 'Forbes',
    url: 'https://www.forbes.com/sites/pr/2026/03/10/forbes-40th-annual-worlds-billionaires-list-elon-musk-is-worlds-richest-person-ever-recorded/',
    notes: 'Forbes 40th annual World’s Billionaires list aggregate. Encompasses 3,428 billionaires globally.',
    category: 'estimate',
  },

  // Public Need & Global Programs
  wfpRequirement: {
    id: 'wfp-operational-requirement',
    name: 'UN World Food Programme (WFP) 2026 operational requirement',
    value: 13_000_000_000,
    formattedValue: '$13 billion',
    observationDate: '2026',
    periodLabel: '2026 operational requirement',
    publisher: 'WFP',
    url: 'https://www.wfp.org/stories/wfp-glance',
    notes: 'Funds needed to deliver emergency and nutrition assistance targeting 110 million people in acute hunger crisis. An annual operational requirement, not a one-time permanent solution to global poverty.',
    category: 'observed',
  },
  malariaFundingTarget: {
    id: 'malaria-funding-target',
    name: 'Global malaria-response annual funding target',
    value: 9_300_000_000,
    formattedValue: '$9.3 billion',
    observationDate: '2025',
    periodLabel: '2025 target',
    publisher: 'World Health Organization (WHO)',
    url: 'https://www.who.int/news/item/04-12-2025-new-tools-saved-a-million-lives-from-malaria-last-year-but-progress-under-threat-as-drug-resistance-rises',
    notes: 'Annual resource mobilization target for vector control, diagnostics, treatments, and vaccine rollout to protect vulnerable populations globally.',
    category: 'observed',
  },

  // Hypothetical Reference Amounts & Unit Costs
  hypotheticalHomeCost: {
    id: 'hypothetical-home-cost',
    name: 'Hypothetical modest home unit cost',
    value: 300_000,
    formattedValue: '$300,000',
    observationDate: '2026-09-05',
    periodLabel: 'Hypothetical benchmark',
    publisher: 'Scale of Wealth Model',
    url: '#methodology',
    notes: 'Assumed average unit construction/acquisition cost for a modest single-family home or apartment.',
    category: 'hypothetical',
  },
  teacherEmploymentCostAnnual: {
    id: 'teacher-employment-cost-annual',
    name: 'Assumed annual teacher total employment cost',
    value: 100_000,
    formattedValue: '$100,000 / year',
    observationDate: '2026-09-05',
    periodLabel: 'Hypothetical benchmark',
    publisher: 'Scale of Wealth Model',
    url: '#methodology',
    notes: 'Total employment cost including salary, pension, health benefits, and payroll taxes for 1 full-time educator.',
    category: 'hypothetical',
  },
  hypotheticalScholarshipAmount: {
    id: 'hypothetical-scholarship-amount',
    name: 'College scholarship grant unit cost',
    value: 50_000,
    formattedValue: '$50,000',
    observationDate: '2026-09-05',
    periodLabel: 'Hypothetical benchmark',
    publisher: 'Scale of Wealth Model',
    url: '#methodology',
    notes: 'Substantial multi-year or full undergraduate tuition scholarship.',
    category: 'hypothetical',
  },
  hypotheticalHouseholdGrantAmount: {
    id: 'hypothetical-household-grant-amount',
    name: 'Direct household emergency grant unit cost',
    value: 10_000,
    formattedValue: '$10,000',
    observationDate: '2026-09-05',
    periodLabel: 'Hypothetical benchmark',
    publisher: 'Scale of Wealth Model',
    url: '#methodology',
    notes: 'Direct unconditional cash grant to an economically vulnerable household.',
    category: 'hypothetical',
  },
  hypotheticalHouseholdNetWorthReference: {
    id: 'hypothetical-household-net-worth-ref',
    name: 'Hypothetical household net worth reference (Beat 18)',
    value: 200_000,
    formattedValue: '$200,000',
    observationDate: '2026-09-05',
    periodLabel: 'Hypothetical benchmark',
    publisher: 'Scale of Wealth Model',
    url: '#methodology',
    notes: 'A typical homeowner household with approximately $200,000 in home equity and retirement savings, closely matching the US median family net worth.',
    category: 'hypothetical',
  },
} as const satisfies Record<string, SourceCitation>;

export type SnapshotKey = keyof typeof SNAPSHOT_DATA;

export const DAYS_PER_YEAR = 365.25;
export const CANONICAL_DOLLARS_PER_PIXEL_SQ = 1_000;
