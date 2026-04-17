import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Person } from '@/types/person';
import { saveSlice, loadSlice } from '@/utils/storage';

interface PeopleState {
  byId: Record<string, Person>;
  allIds: string[];
}

const fallback: PeopleState = { byId: {}, allIds: [] };

const initialState: PeopleState = loadSlice<PeopleState>('people', fallback);

const peopleSlice = createSlice({
  name: 'people',
  initialState,
  reducers: {
    addPerson(state, action: PayloadAction<Person>) {
      const person = action.payload;
      state.byId[person.id] = person;
      if (!state.allIds.includes(person.id)) state.allIds.push(person.id);
      saveSlice('people', state);
    },
    updatePerson(state, action: PayloadAction<{ id: string; changes: Partial<Person> }>) {
      const { id, changes } = action.payload;
      if (state.byId[id]) {
        state.byId[id] = { ...state.byId[id], ...changes, updatedAt: Date.now() };
        saveSlice('people', state);
      }
    },
    deletePerson(state, action: PayloadAction<string>) {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter((i) => i !== id);
      saveSlice('people', state);
    },
    setPeople(state, action: PayloadAction<PeopleState>) {
      state.byId = action.payload.byId;
      state.allIds = action.payload.allIds;
      saveSlice('people', state);
    },
    clearPeople(state) {
      state.byId = {};
      state.allIds = [];
      saveSlice('people', state);
    },
  },
});

export const { addPerson, updatePerson, deletePerson, setPeople, clearPeople } = peopleSlice.actions;
export default peopleSlice.reducer;
