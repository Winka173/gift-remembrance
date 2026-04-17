import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Crypto from 'expo-crypto';
import type { Occasion } from '@/types/occasion';
import type { RootState } from '@/store';
import { addOccasion, updateOccasion } from '@/store/slices/occasionsSlice';
import { scheduleForOccasion, cancelForOccasion } from '@/utils/notificationUtils';

type SaveOccasionInput = Omit<Occasion, 'id' | 'createdAt' | 'updatedAt' | 'notificationId'> & { id?: string };

export const saveOccasionThunk = createAsyncThunk(
  'occasions/save',
  async (input: SaveOccasionInput, { dispatch, getState }) => {
    const state = getState() as RootState;
    const now = Date.now();
    const people = state.people.allIds.map((id) => state.people.byId[id]);

    if (input.id) {
      const existing = state.occasions.byId[input.id];
      if (existing?.notificationId) {
        await cancelForOccasion(existing.notificationId).catch(() => {});
      }
      const updated = { ...existing, ...input, updatedAt: now };
      const notificationId = await scheduleForOccasion(updated as Occasion, people, state.settings).catch(() => null);
      dispatch(updateOccasion({ id: input.id, changes: { ...input, notificationId, updatedAt: now } }));
      return updated as Occasion;
    }

    const occasion: Occasion = {
      ...input,
      id: await Crypto.randomUUID(),
      notificationId: null,
      createdAt: now,
      updatedAt: now,
    };
    const notificationId = await scheduleForOccasion(occasion, people, state.settings).catch(() => null);
    const final = { ...occasion, notificationId };
    dispatch(addOccasion(final));
    return final;
  },
);
