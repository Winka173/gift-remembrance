import { createAsyncThunk } from '@reduxjs/toolkit';
import { unzipAndValidate, applyManifest } from '@/utils/backupUtils';
import { setPeople } from '@/store/slices/peopleSlice';
import { setGifts } from '@/store/slices/giftsSlice';
import { setOccasions } from '@/store/slices/occasionsSlice';
import { updateSettings } from '@/store/slices/settingsSlice';

function buildByPersonId(items: Array<{ id: string; personIds: string[] }>): Record<string, string[]> {
  const index: Record<string, string[]> = {};
  for (const item of items) {
    for (const pid of item.personIds) {
      index[pid] = [...(index[pid] ?? []), item.id];
    }
  }
  return index;
}

export const restoreThunk = createAsyncThunk(
  'settings/restore',
  async (zipPath: string, { dispatch }) => {
    const { manifest, tempDir } = await unzipAndValidate(zipPath);
    await applyManifest(manifest, tempDir);

    const { people, gifts, occasions, settings } = manifest.data;

    dispatch(setPeople({
      byId: Object.fromEntries(people.map((p) => [p.id, p])),
      allIds: people.map((p) => p.id),
    }));
    dispatch(setGifts({
      byId: Object.fromEntries(gifts.map((g) => [g.id, g])),
      allIds: gifts.map((g) => g.id),
      byPersonId: buildByPersonId(gifts),
    }));
    dispatch(setOccasions({
      byId: Object.fromEntries(occasions.map((o) => [o.id, o])),
      allIds: occasions.map((o) => o.id),
      byPersonId: buildByPersonId(occasions),
    }));
    dispatch(updateSettings(settings));
  },
);
