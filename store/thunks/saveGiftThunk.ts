import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Crypto from 'expo-crypto';
import type { Gift } from '@/types/gift';
import { addGift, updateGift } from '@/store/slices/giftsSlice';

type SaveGiftInput = Omit<Gift, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

export const saveGiftThunk = createAsyncThunk(
  'gifts/save',
  async (input: SaveGiftInput, { dispatch }) => {
    const now = Date.now();
    if (input.id) {
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
