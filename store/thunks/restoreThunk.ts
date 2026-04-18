import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { unzipAndValidate, applyManifest } from '@/utils/backupUtils';
import { setPeople } from '@/store/slices/peopleSlice';
import { setGifts } from '@/store/slices/giftsSlice';
import { setOccasions } from '@/store/slices/occasionsSlice';
import { updateSettings } from '@/store/slices/settingsSlice';
import { rescheduleAllOccasionsThunk } from '@/store/thunks/rescheduleAllOccasionsThunk';
import * as FileSystem from 'expo-file-system/legacy';

export type RestoreMode = 'replace' | 'merge';

const BASE = FileSystem.documentDirectory ?? '';

function buildByPersonId(items: Array<{ id: string; personIds: string[] }>): Record<string, string[]> {
  const index: Record<string, string[]> = {};
  for (const item of items) {
    for (const pid of item.personIds) {
      index[pid] = [...(index[pid] ?? []), item.id];
    }
  }
  return index;
}

async function fileExists(uri: string): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists;
  } catch {
    return false;
  }
}

export const restoreThunk = createAsyncThunk(
  'settings/restore',
  async (
    arg: { zipPath: string; mode: RestoreMode },
    { dispatch, getState },
  ) => {
    const { manifest, tempDir } = await unzipAndValidate(arg.zipPath);
    await applyManifest(manifest, tempDir);

    const peopleIn = await Promise.all(
      manifest.data.people.map(async (p) => {
        const candidate = `${BASE}avatars/${p.id}.jpg`;
        const exists = await fileExists(candidate);
        return { ...p, avatarUri: exists ? candidate : null };
      }),
    );
    const giftsIn = await Promise.all(
      manifest.data.gifts.map(async (g) => {
        const candidate = `${BASE}photos/${g.id}.jpg`;
        const exists = await fileExists(candidate);
        return { ...g, photoUri: exists ? candidate : null };
      }),
    );
    const occasionsIn = manifest.data.occasions;

    if (arg.mode === 'replace') {
      dispatch(setPeople({
        byId: Object.fromEntries(peopleIn.map((p) => [p.id, p])),
        allIds: peopleIn.map((p) => p.id),
      }));
      dispatch(setGifts({
        byId: Object.fromEntries(giftsIn.map((g) => [g.id, g])),
        allIds: giftsIn.map((g) => g.id),
        byPersonId: buildByPersonId(giftsIn),
      }));
      dispatch(setOccasions({
        byId: Object.fromEntries(occasionsIn.map((o) => [o.id, o])),
        allIds: occasionsIn.map((o) => o.id),
        byPersonId: buildByPersonId(occasionsIn),
      }));
      dispatch(updateSettings(manifest.data.settings));
    } else {
      const state = getState() as RootState;
      const mergedPeople = { ...state.people.byId };
      for (const p of peopleIn) {
        if (!mergedPeople[p.id]) mergedPeople[p.id] = p;
      }
      const mergedGifts = { ...state.gifts.byId };
      for (const g of giftsIn) {
        if (!mergedGifts[g.id]) mergedGifts[g.id] = g;
      }
      const mergedOccasions = { ...state.occasions.byId };
      for (const o of occasionsIn) {
        if (!mergedOccasions[o.id]) mergedOccasions[o.id] = o;
      }
      const mergedPeopleList = Object.values(mergedPeople);
      const mergedGiftsList = Object.values(mergedGifts);
      const mergedOccasionsList = Object.values(mergedOccasions);

      dispatch(setPeople({
        byId: mergedPeople,
        allIds: mergedPeopleList.map((p) => p.id),
      }));
      dispatch(setGifts({
        byId: mergedGifts,
        allIds: mergedGiftsList.map((g) => g.id),
        byPersonId: buildByPersonId(mergedGiftsList),
      }));
      dispatch(setOccasions({
        byId: mergedOccasions,
        allIds: mergedOccasionsList.map((o) => o.id),
        byPersonId: buildByPersonId(mergedOccasionsList),
      }));
    }

    dispatch(rescheduleAllOccasionsThunk());
  },
);
