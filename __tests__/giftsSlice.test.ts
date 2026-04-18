import reducer, { addGift, updateGift, deleteGift } from '../store/slices/giftsSlice';

jest.mock('../utils/storage', () => ({
  saveSlice: jest.fn(),
  loadSlice: (_: string, fallback: unknown) => fallback,
}));

const base = (overrides = {}) => ({
  id: 'g1',
  personIds: ['a'],
  name: 'Book',
  direction: 'given' as const,
  date: '2025-01-01',
  occasionType: 'just_because' as const,
  customOccasionLabel: null,
  price: 1000,
  photoUri: null,
  notes: null,
  createdAt: 1000,
  updatedAt: 1000,
  ...overrides,
});

describe('giftsSlice byPersonId multi-index', () => {
  it('addGift with multiple personIds populates all keys', () => {
    const state = reducer(undefined, addGift(base({ personIds: ['a', 'b'] })));
    expect(state.byPersonId['a']).toContain('g1');
    expect(state.byPersonId['b']).toContain('g1');
    expect(state.allIds).toEqual(['g1']);
  });

  it('updateGift replacing personIds updates multi-index (a loses, b keeps, c gains)', () => {
    const before = reducer(undefined, addGift(base({ personIds: ['a', 'b'] })));
    const after = reducer(
      before,
      updateGift({ id: 'g1', changes: { personIds: ['b', 'c'] } }),
    );
    expect(after.byPersonId['a'] ?? []).not.toContain('g1');
    expect(after.byPersonId['b']).toContain('g1');
    expect(after.byPersonId['c']).toContain('g1');
  });

  it('deleteGift removes id from all personId keys', () => {
    const before = reducer(undefined, addGift(base({ personIds: ['a', 'b'] })));
    const after = reducer(before, deleteGift('g1'));
    expect(after.byPersonId['a'] ?? []).not.toContain('g1');
    expect(after.byPersonId['b'] ?? []).not.toContain('g1');
    expect(after.byId['g1']).toBeUndefined();
    expect(after.allIds).toEqual([]);
  });

  it('two shared gifts for same people accumulate under the person key', () => {
    let state = reducer(undefined, addGift(base({ id: 'g1', personIds: ['a', 'b'] })));
    state = reducer(state, addGift(base({ id: 'g2', personIds: ['a', 'b'] })));
    expect(state.byPersonId['a']).toEqual(expect.arrayContaining(['g1', 'g2']));
    expect(state.byPersonId['b']).toEqual(expect.arrayContaining(['g1', 'g2']));
  });
});
