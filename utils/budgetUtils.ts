import { parseISO, getDayOfYear, getDaysInYear } from 'date-fns';
import type { Gift } from '@/types/gift';
import type { Person } from '@/types/person';
import type { CurrencyCode } from '@/constants/currencies';
import { CURRENCIES } from '@/constants/currencies';

export type BudgetStatus = 'under' | 'on_track' | 'over' | 'no_budget';

export function computeYearSpend(
  personId: string,
  gifts: Gift[],
  year: number,
): number {
  return gifts
    .filter(
      (g) =>
        g.direction === 'given' &&
        g.personIds.includes(personId) &&
        parseISO(g.date).getFullYear() === year &&
        g.price != null,
    )
    .reduce((sum, g) => sum + (g.price ?? 0), 0);
}

export function computeBudgetStatus(
  person: Person,
  ytdSpend: number,
): BudgetStatus {
  if (person.annualBudget === null || person.annualBudget === 0) return 'no_budget';

  const ratio = ytdSpend / person.annualBudget;
  const now = new Date();
  const yearProgress = getDayOfYear(now) / getDaysInYear(now);

  if (ratio > 1) return 'over';
  if (ratio > yearProgress + 0.15) return 'over';
  if (ratio < yearProgress - 0.15) return 'under';
  return 'on_track';
}

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const entry = CURRENCIES.find((c) => c.code === currency);
  const symbol = entry?.symbol ?? currency;
  const major = amount / 100;
  return `${symbol}${major.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
