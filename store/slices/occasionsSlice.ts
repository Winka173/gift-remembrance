import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Occasion } from '@/types/occasion';
import { saveSlice, loadSlice } from '@/utils/storage';
import { addToMultiIndex, removeFromMultiIndex, updateMultiIndex } from '@/utils/indexUtils';

interface OccasionsState {
  byId: Record<string, Occasion>;
  allIds: string[];
  byPersonId: Record<string, string[]>;
}

const fallback: OccasionsState = { byId: {}, allIds: [], byPersonId: {} };

const initialState: OccasionsState = loadSlice<OccasionsState>('occasions', fallback);

const occasionsSlice = createSlice({
  name: 'occasions',
  initialState,
  reducers: {
    addOccasion(state, action: PayloadAction<Occasion>) {
      const occasion = action.payload;
      state.byId[occasion.id] = occasion;
      if (!state.allIds.includes(occasion.id)) state.allIds.push(occasion.id);
      state.byPersonId = addToMultiIndex(state.byPersonId, occasion.personIds, occasion.id);
      saveSlice('occasions', state);
    },
    updateOccasion(state, action: PayloadAction<{ id: string; changes: Partial<Occasion> }>) {
      const { id, changes } = action.payload;
      if (!state.byId[id]) return;
      const prev = state.byId[id];
      const next = { ...prev, ...changes, updatedAt: Date.now() };
      state.byId[id] = next;
      if (changes.personIds) {
        state.byPersonId = updateMultiIndex(state.byPersonId, prev.personIds, next.personIds, id);
      }
      saveSlice('occasions', state);
    },
    deleteOccasion(state, action: PayloadAction<string>) {
      const id = action.payload;
      const occasion = state.byId[id];
      if (!occasion) return;
      state.byPersonId = removeFromMultiIndex(state.byPersonId, occasion.personIds, id);
      delete state.byId[id];
      state.allIds = state.allIds.filter((i) => i !== id);
      saveSlice('occasions', state);
    },
    setOccasions(state, action: PayloadAction<OccasionsState>) {
      state.byId = action.payload.byId;
      state.allIds = action.payload.allIds;
      state.byPersonId = action.payload.byPersonId;
      saveSlice('occasions', state);
    },
    clearOccasions(state) {
      state.byId = {};
      state.allIds = [];
      state.byPersonId = {};
      saveSlice('occasions', state);
    },
  },
});

export const { addOccasion, updateOccasion, deleteOccasion, setOccasions, clearOccasions } =
  occasionsSlice.actions;
export default occasionsSlice.reducer;
