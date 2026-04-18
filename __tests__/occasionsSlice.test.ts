import reducer, { addOccasion, updateOccasion, deleteOccasion } from '../store/slices/occasionsSlice';

jest.mock('../utils/storage', () => ({
  saveSlice: jest.fn(),
  loadSlice: (_: string, fallback: unknown) => fallback,
}));

const base = (overrides = {}) => ({
  id: 'o1',
  personIds: ['m', 'd'],
  type: 'anniversary' as const,
  customLabel: null,
  date: '2000-06-15',
  recurring: true,
  notificationId: null,
  createdAt: 1000,
  updatedAt: 1000,
  ...overrides,
});

describe('occasionsSlice byPersonId multi-index', () => {
  it('addOccasion with shared personIds populates all keys', () => {
    const state = reducer(undefined, addOccasion(base()));
    expect(state.byPersonId['m']).toContain('o1');
    expect(state.byPersonId['d']).toContain('o1');
    expect(state.allIds).toEqual(['o1']);
  });

  it('updateOccasion replacing personIds updates multi-index', () => {
    const before = reducer(undefined, addOccasion(base()));
    const after = reducer(
      before,
      updateOccasion({ id: 'o1', changes: { personIds: ['d', 'x'] } }),
    );
    expect(after.byPersonId['m'] ?? []).not.toContain('o1');
    expect(after.byPersonId['d']).toContain('o1');
    expect(after.byPersonId['x']).toContain('o1');
  });

  it('deleteOccasion removes id from all personId keys', () => {
    const before = reducer(undefined, addOccasion(base()));
    const after = reducer(before, deleteOccasion('o1'));
    expect(after.byPersonId['m'] ?? []).not.toContain('o1');
    expect(after.byPersonId['d'] ?? []).not.toContain('o1');
    expect(after.byId['o1']).toBeUndefined();
    expect(after.allIds).toEqual([]);
  });
});
