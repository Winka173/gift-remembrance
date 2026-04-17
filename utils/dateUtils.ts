import {
  parseISO,
  differenceInCalendarDays,
  addYears,
  isValid,
  format,
} from 'date-fns';
import type { Occasion } from '@/types/occasion';

export function nextOccurrence(occasion: Occasion, from: Date = new Date()): Date {
  if (!occasion.recurring) {
    return parseISO(occasion.date);
  }

  const anchor = parseISO(occasion.date);
  const month = anchor.getMonth();
  const day = anchor.getDate();
  const thisYear = from.getFullYear();

  for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
    const year = thisYear + yearOffset;
    let candidate = new Date(year, month, day);

    // Leap-day fallback: Feb 29 in non-leap year → Feb 28
    if (!isValid(candidate) || candidate.getMonth() !== month) {
      candidate = new Date(year, month, 28);
    }

    if (differenceInCalendarDays(candidate, from) >= 0) {
      return candidate;
    }
  }

  return addYears(parseISO(occasion.date), 1);
}

export function daysUntil(date: Date, from: Date = new Date()): number {
  return differenceInCalendarDays(date, from);
}

export function formatRelative(date: Date, from: Date = new Date()): string {
  const days = differenceInCalendarDays(date, from);
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  if (days > 0) return `in ${days} days`;
  return `${Math.abs(days)} days ago`;
}

export function formatDate(iso: string, _locale?: string): string {
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return iso;
  }
}
