import reducer, { addPerson, updatePerson, deletePerson, clearPeople } from '../store/slices/peopleSlice';

jest.mock('../utils/storage', () => ({
  saveSlice: jest.fn(),
  loadSlice: (_: string, fallback: unknown) => fallback,
}));

const base = (overrides = {}) => ({
  id: 'p1',
  name: 'Alice',
  relationship: null,
  avatarUri: null,
  annualBudget: null,
  notes: null,
  contactId: null,
  createdAt: 1000,
  updatedAt: 1000,
  ...overrides,
});

describe('peopleSlice', () => {
  it('adds a person', () => {
    const state = reducer(undefined, addPerson(base()));
    expect(state.allIds).toEqual(['p1']);
    expect(state.byId['p1']!.name).toBe('Alice');
  });

  it('updates a person (bumps updatedAt)', () => {
    const before = reducer(undefined, addPerson(base()));
    const after = reducer(before, updatePerson({ id: 'p1', changes: { name: 'Ally' } }));
    expect(after.byId['p1']!.name).toBe('Ally');
    expect(after.byId['p1']!.updatedAt).toBeGreaterThanOrEqual(before.byId['p1']!.updatedAt);
  });

  it('deletes a person', () => {
    const before = reducer(undefined, addPerson(base()));
    const after = reducer(before, deletePerson('p1'));
    expect(after.byId['p1']).toBeUndefined();
    expect(after.allIds).toEqual([]);
  });

  it('clearPeople wipes state', () => {
    let state = reducer(undefined, addPerson(base()));
    state = reducer(state, addPerson(base({ id: 'p2', name: 'Bob' })));
    state = reducer(state, clearPeople());
    expect(state.allIds).toEqual([]);
    expect(state.byId).toEqual({});
  });
});
