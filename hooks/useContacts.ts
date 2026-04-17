import { useState, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { importContactsThunk } from '@/store/thunks/importContactsThunk';

export function useContacts() {
  const dispatch = useAppDispatch();
  const [importing, setImporting] = useState(false);

  const importContacts = useCallback(
    async (contactIds: string[]) => {
      setImporting(true);
      try {
        return await dispatch(importContactsThunk(contactIds));
      } finally {
        setImporting(false);
      }
    },
    [dispatch],
  );

  return { importing, importContacts };
}
