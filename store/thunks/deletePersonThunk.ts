import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { deletePerson } from '@/store/slices/peopleSlice';
import { deleteGift } from '@/store/slices/giftsSlice';
import { deleteOccasion } from '@/store/slices/occasionsSlice';
import { cancelForOccasion } from '@/utils/notificationUtils';

export const deletePersonThunk = createAsyncThunk(
  'people/delete',
  async (personId: string, { dispatch, getState }) => {
    const state = getState() as RootState;

    for (const id of state.gifts.allIds) {
      const gift = state.gifts.byId[id];
      if (gift.personIds.includes(personId)) {
        dispatch(deleteGift(id));
      }
    }

    for (const id of state.occasions.allIds) {
      const occasion = state.occasions.byId[id];
      if (occasion.personIds.includes(personId)) {
        if (occasion.notificationId) {
          await cancelForOccasion(occasion.notificationId).catch(() => {});
        }
        dispatch(deleteOccasion(id));
      }
    }

    dispatch(deletePerson(personId));
  },
);
