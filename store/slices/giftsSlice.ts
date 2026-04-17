import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Gift } from '@/types/gift';
import { saveSlice, loadSlice } from '@/utils/storage';
import { addToMultiIndex, removeFromMultiIndex, updateMultiIndex } from '@/utils/indexUtils';

interface GiftsState {
  byId: Record<string, Gift>;
  allIds: string[];
  byPersonId: Record<string, string[]>;
}

const fallback: GiftsState = { byId: {}, allIds: [], byPersonId: {} };

const initialState: GiftsState = loadSlice<GiftsState>('gifts', fallback);

const giftsSlice = createSlice({
  name: 'gifts',
  initialState,
  reducers: {
    addGift(state, action: PayloadAction<Gift>) {
      const gift = action.payload;
      state.byId[gift.id] = gift;
      if (!state.allIds.includes(gift.id)) state.allIds.push(gift.id);
      state.byPersonId = addToMultiIndex(state.byPersonId, gift.personIds, gift.id);
      saveSlice('gifts', state);
    },
    updateGift(state, action: PayloadAction<{ id: string; changes: Partial<Gift> }>) {
      const { id, changes } = action.payload;
      if (!state.byId[id]) return;
      const prev = state.byId[id];
      const next = { ...prev, ...changes, updatedAt: Date.now() };
      state.byId[id] = next;
      if (changes.personIds) {
        state.byPersonId = updateMultiIndex(state.byPersonId, prev.personIds, next.personIds, id);
      }
      saveSlice('gifts', state);
    },
    deleteGift(state, action: PayloadAction<string>) {
      const id = action.payload;
      const gift = state.byId[id];
      if (!gift) return;
      state.byPersonId = removeFromMultiIndex(state.byPersonId, gift.personIds, id);
      delete state.byId[id];
      state.allIds = state.allIds.filter((i) => i !== id);
      saveSlice('gifts', state);
    },
    setGifts(state, action: PayloadAction<GiftsState>) {
      state.byId = action.payload.byId;
      state.allIds = action.payload.allIds;
      state.byPersonId = action.payload.byPersonId;
      saveSlice('gifts', state);
    },
    clearGifts(state) {
      state.byId = {};
      state.allIds = [];
      state.byPersonId = {};
      saveSlice('gifts', state);
    },
  },
});

export const { addGift, updateGift, deleteGift, setGifts, clearGifts } = giftsSlice.actions;
export default giftsSlice.reducer;
