import { useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { saveOccasionThunk } from '@/store/thunks/saveOccasionThunk';
import { deleteOccasion } from '@/store/slices/occasionsSlice';
import type { Occasion } from '@/types/occasion';

export function useOccasions(personId?: string) {
  const dispatch = useAppDispatch();
  const byId = useAppSelector((s) => s.occasions.byId);
  const allIds = useAppSelector((s) => s.occasions.allIds);
  const byPersonId = useAppSelector((s) => s.occasions.byPersonId);

  const occasions = useMemo(() => {
    const ids = personId ? (byPersonId[personId] ?? []) : allIds;
    return ids.map((id) => byId[id]).filter(Boolean) as Occasion[];
  }, [byId, allIds, byPersonId, personId]);

  return {
    occasions,
    saveOccasion: (input: Parameters<typeof saveOccasionThunk>[0]) =>
      dispatch(saveOccasionThunk(input)),
    deleteOccasion: (id: string) => dispatch(deleteOccasion(id)),
  };
}
