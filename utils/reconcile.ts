import * as FileSystem from 'expo-file-system/legacy';
import type { RootState, AppDispatch } from '@/types/store';
import { updatePerson } from '@/store/slices/peopleSlice';
import { updateGift, deleteGift } from '@/store/slices/giftsSlice';
import { deleteOccasion } from '@/store/slices/occasionsSlice';

async function fileExists(uri: string): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists;
  } catch {
    return false;
  }
}

export async function runReconciliation(
  state: RootState,
  dispatch: AppDispatch,
): Promise<void> {
  // 1. Null out missing avatar URIs
  for (const id of state.people.allIds) {
    const person = state.people.byId[id];
    if (person.avatarUri && !(await fileExists(person.avatarUri))) {
      dispatch(updatePerson({ id, changes: { avatarUri: null } }));
    }
  }

  // 2. Null out missing gift photo URIs
  for (const id of state.gifts.allIds) {
    const gift = state.gifts.byId[id];
    if (gift.photoUri && !(await fileExists(gift.photoUri))) {
      dispatch(updateGift({ id, changes: { photoUri: null } }));
    }
  }

  // 3. Reference integrity: remove dangling personIds from gifts
  const personIds = new Set(state.people.allIds);
  for (const id of state.gifts.allIds) {
    const gift = state.gifts.byId[id];
    const validIds = gift.personIds.filter((pid) => personIds.has(pid));
    if (validIds.length === 0) {
      dispatch(deleteGift(id));
    } else if (validIds.length !== gift.personIds.length) {
      dispatch(updateGift({ id, changes: { personIds: validIds } }));
    }
  }

  // 4. Reference integrity: remove dangling personIds from occasions
  for (const id of state.occasions.allIds) {
    const occasion = state.occasions.byId[id];
    const validIds = occasion.personIds.filter((pid) => personIds.has(pid));
    if (validIds.length === 0) {
      dispatch(deleteOccasion(id));
    }
  }
}
