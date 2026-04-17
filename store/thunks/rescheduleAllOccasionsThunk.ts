import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { rescheduleAll } from '@/utils/notificationUtils';
import { updateOccasion } from '@/store/slices/occasionsSlice';

export const rescheduleAllOccasionsThunk = createAsyncThunk(
  'occasions/rescheduleAll',
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;
    const occasions = state.occasions.allIds.map((id) => state.occasions.byId[id]);
    const people = state.people.allIds.map((id) => state.people.byId[id]);
    const notificationMap = await rescheduleAll(occasions, people, state.settings);
    for (const [occasionId, notificationId] of notificationMap) {
      dispatch(updateOccasion({ id: occasionId, changes: { notificationId } }));
    }
  },
);
