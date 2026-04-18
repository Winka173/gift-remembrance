import { deletePersonThunk } from '../store/thunks/deletePersonThunk';

jest.mock('../utils/photoUtils', () => ({
  deleteFromAppDir: jest.fn().mockResolvedValue(undefined),
  ensureDir: jest.fn(),
  compressImage: jest.fn(),
  saveToAppDir: jest.fn(),
}));

jest.mock('../utils/notificationUtils', () => ({
  cancelForOccasion: jest.fn().mockResolvedValue(undefined),
  scheduleForOccasion: jest.fn(),
  requestPermissionIfNeeded: jest.fn(),
  rescheduleAll: jest.fn(),
}));

jest.mock('../utils/storage', () => ({
  saveSlice: jest.fn(),
  loadSlice: (_: string, fb: unknown) => fb,
}));

type AnyAction = { type: string; payload?: unknown };

function makeGetState(opts: {
  gifts: Record<string, { id: string; personIds: string[]; photoUri: string | null }>;
  occasions: Record<string, { id: string; personIds: string[]; notificationId: string | null }>;
  people?: Record<string, { id: string; avatarUri: string | null }>;
}) {
  const peopleById = opts.people ?? {
    p1: { id: 'p1', avatarUri: null },
    p2: { id: 'p2', avatarUri: null },
  };
  return () =>
    ({
      people: { byId: peopleById, allIds: Object.keys(peopleById) },
      gifts: {
        byId: opts.gifts,
        allIds: Object.keys(opts.gifts),
        byPersonId: {},
      },
      occasions: {
        byId: opts.occasions,
        allIds: Object.keys(opts.occasions),
        byPersonId: {},
      },
    }) as never;
}

function extractReducerActions(dispatch: jest.Mock): AnyAction[] {
  return dispatch.mock.calls
    .map((c) => c[0])
    .filter(
      (a): a is AnyAction =>
        !!a && typeof a === 'object' && typeof (a as AnyAction).type === 'string',
    );
}

describe('deletePersonThunk', () => {
  it('deletes a solely-owned gift', async () => {
    const dispatch = jest.fn();
    const getState = makeGetState({
      gifts: { g1: { id: 'g1', personIds: ['p1'], photoUri: null } },
      occasions: {},
    });
    await deletePersonThunk('p1')(dispatch, getState, undefined);
    const actions = extractReducerActions(dispatch);
    const deleteGiftAction = actions.find((a) => a.type === 'gifts/deleteGift');
    expect(deleteGiftAction).toBeDefined();
    expect(deleteGiftAction!.payload).toBe('g1');
  });

  it('updates a shared gift to keep the other person', async () => {
    const dispatch = jest.fn();
    const getState = makeGetState({
      gifts: { g2: { id: 'g2', personIds: ['p1', 'p2'], photoUri: null } },
      occasions: {},
    });
    await deletePersonThunk('p1')(dispatch, getState, undefined);
    const actions = extractReducerActions(dispatch);
    const updateGiftAction = actions.find((a) => a.type === 'gifts/updateGift');
    expect(updateGiftAction).toBeDefined();
    expect(updateGiftAction!.payload).toEqual({
      id: 'g2',
      changes: { personIds: ['p2'] },
    });
  });

  it('updates a shared occasion to keep the other person', async () => {
    const dispatch = jest.fn();
    const getState = makeGetState({
      gifts: {},
      occasions: {
        o1: { id: 'o1', personIds: ['p1', 'p2'], notificationId: null },
      },
    });
    await deletePersonThunk('p1')(dispatch, getState, undefined);
    const actions = extractReducerActions(dispatch);
    const updateOccasionAction = actions.find(
      (a) => a.type === 'occasions/updateOccasion',
    );
    expect(updateOccasionAction).toBeDefined();
    expect(updateOccasionAction!.payload).toEqual({
      id: 'o1',
      changes: { personIds: ['p2'] },
    });
  });

  it('deletes a solely-owned occasion and cancels its notification', async () => {
    const { cancelForOccasion } = jest.requireMock('../utils/notificationUtils') as {
      cancelForOccasion: jest.Mock;
    };
    cancelForOccasion.mockClear();

    const dispatch = jest.fn();
    const getState = makeGetState({
      gifts: {},
      occasions: {
        o2: { id: 'o2', personIds: ['p1'], notificationId: 'notif-1' },
      },
    });
    await deletePersonThunk('p1')(dispatch, getState, undefined);
    const actions = extractReducerActions(dispatch);
    const deleteOccasionAction = actions.find(
      (a) => a.type === 'occasions/deleteOccasion',
    );
    expect(deleteOccasionAction).toBeDefined();
    expect(deleteOccasionAction!.payload).toBe('o2');
    expect(cancelForOccasion).toHaveBeenCalledWith('notif-1');
  });
});
