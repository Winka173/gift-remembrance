import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Crypto from 'expo-crypto';
import type { Gift } from '@/types/gift';
import type { RootState } from '@/store';
import { addGift, updateGift } from '@/store/slices/giftsSlice';
import { deleteFromAppDir } from '@/utils/photoUtils';

type SaveGiftInput = Omit<Gift, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

export const saveGiftThunk = createAsyncThunk(
  'gifts/save',
  async (input: SaveGiftInput, { dispatch, getState }) => {
    const now = Date.now();
    if (input.id) {
      const prev = (getState() as RootState).gifts.byId[input.id];
      if (prev?.photoUri && prev.photoUri !== input.photoUri) {
        await deleteFromAppDir(prev.photoUri).catch(() => {});
      }
      const { id, ...changes } = input;
      dispatch(updateGift({ id, changes: { ...changes, updatedAt: now } }));
      return { ...input, id, createdAt: now, updatedAt: now } as Gift;
    }
    const gift: Gift = {
      ...input,
      id: await Crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    dispatch(addGift(gift));
    return gift;
  },
);
