import { useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { saveGiftThunk } from '@/store/thunks/saveGiftThunk';
import { deleteGift } from '@/store/slices/giftsSlice';
import type { Gift } from '@/types/gift';

export function useGifts(personId?: string) {
  const dispatch = useAppDispatch();
  const byId = useAppSelector((s) => s.gifts.byId);
  const allIds = useAppSelector((s) => s.gifts.allIds);
  const byPersonId = useAppSelector((s) => s.gifts.byPersonId);

  const gifts = useMemo(() => {
    const ids = personId ? (byPersonId[personId] ?? []) : allIds;
    return ids.map((id) => byId[id]).filter(Boolean) as Gift[];
  }, [byId, allIds, byPersonId, personId]);

  return {
    gifts,
    saveGift: (input: Parameters<typeof saveGiftThunk>[0]) => dispatch(saveGiftThunk(input)),
    deleteGift: (id: string) => dispatch(deleteGift(id)),
  };
}
