import { fmtNumber } from './format';

export interface Slab {
  /** Lower bound of the slab, exclusive of the previous slab. */
  from: number;
  /** Upper bound, Infinity for the top slab. */
  to: number;
  rate: number;
}

export const TAX_YEAR_LABEL = '2026-27';

/**
 * Rates below follow the salaried and non-salaried schedules published with the
 * most recent Finance Act. Rates change every June, so the calculator shows a
 * "verify against the current Finance Act" note next to every result.
 */
export const SALARIED_SLABS: Slab[] = [
  { from: 0, to: 600_000, rate: 0 },
  { from: 600_000, to: 1_200_000, rate: 0.01 },
  { from: 1_200_000, to: 2_200_000, rate: 0.11 },
  { from: 2_200_000, to: 3_200_000, rate: 0.2 },
  { from: 3_200_000, to: 4_100_000, rate: 0.25 },
  { from: 4_100_000, to: 5_600_000, rate: 0.29 },
  { from: 5_600_000, to: 7_000_000, rate: 0.32 },
  { from: 7_000_000, to: Infinity, rate: 0.35 },
];

export const NON_SALARIED_SLABS: Slab[] = [
  { from: 0, to: 600_000, rate: 0 },
  { from: 600_000, to: 1_200_000, rate: 0.01 },
  { from: 1_200_000, to: 2_400_000, rate: 0.11 },
  { from: 2_400_000, to: 3_600_000, rate: 0.23 },
  { from: 3_600_000, to: 6_000_000, rate: 0.3 },
  { from: 6_000_000, to: 12_000_000, rate: 0.4 },
  { from: 12_000_000, to: Infinity, rate: 0.45 },
];

export interface SlabRow {
  label: string;
  rate: number;
  taxableInSlab: number;
  tax: number;
}

export interface TaxResult {
  income: number;
  tax: number;
  netIncome: number;
  effectiveRate: number;
  marginalRate: number;
  monthly: number;
  rows: SlabRow[];
}

function slabLabel(slab: Slab): string {
  if (slab.to === Infinity) return `Above Rs ${fmtNumber(slab.from)}`;
  if (slab.from === 0) return `Up to Rs ${fmtNumber(slab.to)}`;
  return `Rs ${fmtNumber(slab.from + 1)} to ${fmtNumber(slab.to)}`;
}

export function computeTax(income: number, slabs: Slab[]): TaxResult {
  const taxable = Math.max(0, Math.round(income || 0));
  let total = 0;
  let marginalRate = 0;

  const rows: SlabRow[] = slabs.map((slab) => {
    const upper = Math.min(taxable, slab.to);
    const taxableInSlab = Math.max(0, upper - slab.from);
    const tax = taxableInSlab * slab.rate;
    total += tax;
    if (taxableInSlab > 0) marginalRate = slab.rate;
    return { label: slabLabel(slab), rate: slab.rate, taxableInSlab, tax };
  });

  const tax = Math.round(total);
  return {
    income: taxable,
    tax,
    netIncome: taxable - tax,
    effectiveRate: taxable > 0 ? (tax / taxable) * 100 : 0,
    marginalRate: marginalRate * 100,
    monthly: Math.round(tax / 12),
    rows,
  };
}

export function slabsFor(type: 'salaried' | 'non-salaried'): Slab[] {
  return type === 'salaried' ? SALARIED_SLABS : NON_SALARIED_SLABS;
}

export interface Deadline {
  day: string;
  month: string;
  iso: string;
  title: string;
  tag: string;
}

/** Recurring FBR dates for the current filing cycle. */
export const DEADLINES: Deadline[] = [
  {
    day: '15',
    month: 'Sep',
    iso: '2026-09-15',
    title: 'Advance tax, first quarterly instalment under section 147',
    tag: 'Advance tax',
  },
  {
    day: '30',
    month: 'Sep',
    iso: '2026-09-30',
    title: `Last day to file the income tax return for tax year ${TAX_YEAR_LABEL} without a late filing surcharge`,
    tag: 'Annual return',
  },
  {
    day: '15',
    month: 'Oct',
    iso: '2026-10-15',
    title: 'Quarterly withholding statement for employers and collection agents',
    tag: 'Withholding',
  },
  {
    day: '15',
    month: 'Dec',
    iso: '2026-12-15',
    title: 'Advance tax, second quarterly instalment',
    tag: 'Advance tax',
  },
  {
    day: '15',
    month: 'Jan',
    iso: '2027-01-15',
    title: 'Quarterly withholding statement, second quarter',
    tag: 'Withholding',
  },
  {
    day: '15',
    month: 'Mar',
    iso: '2027-03-15',
    title: 'Advance tax, third quarterly instalment',
    tag: 'Advance tax',
  },
];
