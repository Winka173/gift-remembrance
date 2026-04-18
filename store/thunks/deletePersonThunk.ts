import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { deletePerson } from '@/store/slices/peopleSlice';
import { deleteGift, updateGift } from '@/store/slices/giftsSlice';
import { deleteOccasion, updateOccasion } from '@/store/slices/occasionsSlice';
import { cancelForOccasion } from '@/utils/notificationUtils';
import { deleteFromAppDir } from '@/utils/photoUtils';

export const deletePersonThunk = createAsyncThunk(
  'people/delete',
  async (personId: string, { dispatch, getState }) => {
    const state = getState() as RootState;
    const person = state.people.byId[personId];

    for (const id of state.gifts.allIds) {
      const gift = state.gifts.byId[id];
      if (!gift.personIds.includes(personId)) continue;
      if (gift.personIds.length === 1) {
        if (gift.photoUri) await deleteFromAppDir(gift.photoUri).catch(() => {});
        dispatch(deleteGift(id));
      } else {
        const remaining = gift.personIds.filter((pid) => pid !== personId);
        dispatch(updateGift({ id, changes: { personIds: remaining } }));
      }
    }

    for (const id of state.occasions.allIds) {
      const occasion = state.occasions.byId[id];
      if (!occasion.personIds.includes(personId)) continue;
      if (occasion.personIds.length === 1) {
        if (occasion.notificationId) {
          await cancelForOccasion(occasion.notificationId).catch(() => {});
        }
        dispatch(deleteOccasion(id));
      } else {
        const remaining = occasion.personIds.filter((pid) => pid !== personId);
        dispatch(updateOccasion({ id, changes: { personIds: remaining } }));
      }
    }

    if (person?.avatarUri) {
      await deleteFromAppDir(person.avatarUri).catch(() => {});
    }

    dispatch(deletePerson(personId));
  },
);
