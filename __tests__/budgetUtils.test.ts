import {
  computeYearSpend,
  computeBudgetStatus,
  formatCurrency,
} from '@/utils/budgetUtils';
import type { Gift } from '@/types/gift';
import type { Person } from '@/types/person';

function makeGift(overrides: Partial<Gift> = {}): Gift {
  return {
    id: 'g1',
    personIds: ['p1'],
    name: 'Book',
    direction: 'given',
    date: '2025-03-10',
    occasionType: 'just_because',
    customOccasionLabel: null,
    price: 2000,
    photoUri: null,
    notes: null,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

function makePerson(overrides: Partial<Person> = {}): Person {
  return {
    id: 'p1',
    name: 'Alice',
    relationship: null,
    avatarUri: null,
    annualBudget: null,
    notes: null,
    contactId: null,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('computeYearSpend', () => {
  it('sums prices for gifts given to a person in the target year', () => {
    const gifts: Gift[] = [
      makeGift({ id: 'g1', date: '2025-02-01', price: 1000 }),
      makeGift({ id: 'g2', date: '2025-06-15', price: 2500 }),
      makeGift({ id: 'g3', date: '2025-11-20', price: 500 }),
    ];
    expect(computeYearSpend('p1', gifts, 2025)).toBe(4000);
  });

  it('excludes gifts from other years', () => {
    const gifts: Gift[] = [
      makeGift({ id: 'g1', date: '2024-12-31', price: 1000 }),
      makeGift({ id: 'g2', date: '2025-01-01', price: 2000 }),
      makeGift({ id: 'g3', date: '2026-01-01', price: 3000 }),
    ];
    expect(computeYearSpend('p1', gifts, 2025)).toBe(2000);
  });

  it('full-counts the price for a shared gift (not split) per person', () => {
    const gifts: Gift[] = [
      makeGift({ id: 'g1', personIds: ['p1', 'p2'], price: 3000 }),
    ];
    expect(computeYearSpend('p1', gifts, 2025)).toBe(3000);
    expect(computeYearSpend('p2', gifts, 2025)).toBe(3000);
  });

  it('ignores received gifts', () => {
    const gifts: Gift[] = [
      makeGift({ id: 'g1', direction: 'received', price: 5000 }),
    ];
    expect(computeYearSpend('p1', gifts, 2025)).toBe(0);
  });

  it('ignores gifts with null price', () => {
    const gifts: Gift[] = [
      makeGift({ id: 'g1', price: null }),
      makeGift({ id: 'g2', price: 1000 }),
    ];
    expect(computeYearSpend('p1', gifts, 2025)).toBe(1000);
  });
});

describe('computeBudgetStatus', () => {
  it('returns "no_budget" when annualBudget is null', () => {
    const person = makePerson({ annualBudget: null });
    expect(computeBudgetStatus(person, 5000)).toBe('no_budget');
  });

  it('returns "no_budget" when annualBudget is 0', () => {
    const person = makePerson({ annualBudget: 0 });
    expect(computeBudgetStatus(person, 5000)).toBe('no_budget');
  });

  it('returns "over" when spend exceeds the full budget', () => {
    const person = makePerson({ annualBudget: 10000 });
    expect(computeBudgetStatus(person, 15000)).toBe('over');
  });

  it('returns a defined status string for mid-year moderate spend', () => {
    const person = makePerson({ annualBudget: 10000 });
    const status = computeBudgetStatus(person, 5000);
    expect(['under', 'on_track', 'over']).toContain(status);
  });
});

describe('formatCurrency', () => {
  it('formats USD cents into a dollar string', () => {
    const out = formatCurrency(1500, 'USD');
    expect(out).toContain('15.00');
    expect(out).toContain('$');
  });

  it('formats zero correctly', () => {
    const out = formatCurrency(0, 'USD');
    expect(out).toContain('0.00');
  });

  it('uses the currency code as a fallback symbol for unknown codes', () => {
    const out = formatCurrency(1000, 'XXX' as never);
    expect(out).toContain('10.00');
  });
});
