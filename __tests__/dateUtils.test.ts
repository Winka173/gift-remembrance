import {
  nextOccurrence,
  daysUntil,
  formatRelative,
  formatDate,
} from '@/utils/dateUtils';
import type { Occasion } from '@/types/occasion';

function makeOccasion(overrides: Partial<Occasion> = {}): Occasion {
  return {
    id: 'occ1',
    personIds: ['p1'],
    type: 'birthday',
    customLabel: null,
    date: '1990-06-20',
    recurring: true,
    notificationId: null,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('nextOccurrence', () => {
  it('returns this year for a recurring birthday still ahead', () => {
    const from = new Date(2025, 5, 15); // Jun 15 2025
    const occ = makeOccasion({ date: '1990-06-20' });
    const result = nextOccurrence(occ, from);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(20);
  });

  it('returns next year for a recurring birthday already passed', () => {
    const from = new Date(2025, 5, 25); // Jun 25 2025
    const occ = makeOccasion({ date: '1990-06-20' });
    const result = nextOccurrence(occ, from);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(20);
  });

  it('falls back to Feb 28 for a Feb 29 birthday in a non-leap year', () => {
    const from = new Date(2025, 0, 10); // Jan 10 2025 (non-leap year)
    const occ = makeOccasion({ date: '2000-02-29' });
    const result = nextOccurrence(occ, from);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28);
  });

  it('returns the parsed date unchanged for a non-recurring occasion', () => {
    const occ = makeOccasion({ recurring: false, date: '2024-03-10' });
    const from = new Date(2025, 5, 15);
    const result = nextOccurrence(occ, from);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(10);
  });
});

describe('daysUntil', () => {
  it('returns 0 for today', () => {
    const now = new Date(2025, 5, 15);
    expect(daysUntil(new Date(2025, 5, 15), now)).toBe(0);
  });

  it('returns 1 for tomorrow', () => {
    const now = new Date(2025, 5, 15);
    expect(daysUntil(new Date(2025, 5, 16), now)).toBe(1);
  });

  it('returns -1 for yesterday', () => {
    const now = new Date(2025, 5, 15);
    expect(daysUntil(new Date(2025, 5, 14), now)).toBe(-1);
  });
});

describe('formatRelative', () => {
  const from = new Date(2025, 5, 15);

  it('returns "today" for same day', () => {
    expect(formatRelative(new Date(2025, 5, 15), from)).toBe('today');
  });

  it('returns "tomorrow" for next day', () => {
    expect(formatRelative(new Date(2025, 5, 16), from)).toBe('tomorrow');
  });

  it('returns "in N days" for future dates', () => {
    expect(formatRelative(new Date(2025, 5, 22), from)).toBe('in 7 days');
  });
});

describe('formatDate', () => {
  it('formats an ISO date into a readable month-day-year string', () => {
    const formatted = formatDate('2025-06-20');
    expect(formatted).toContain('2025');
    expect(formatted).toContain('20');
  });
});
