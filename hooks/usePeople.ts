import { useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { createPersonThunk } from '@/store/thunks/createPersonThunk';
import { deletePersonThunk } from '@/store/thunks/deletePersonThunk';
import { updatePerson } from '@/store/slices/peopleSlice';
import type { Person } from '@/types/person';

export function usePeople() {
  const dispatch = useAppDispatch();
  const byId = useAppSelector((s) => s.people.byId);
  const allIds = useAppSelector((s) => s.people.allIds);
  const people = useMemo(() => allIds.map((id) => byId[id]), [byId, allIds]);

  return {
    people,
    createPerson: (input: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) =>
      dispatch(createPersonThunk(input)),
    updatePerson: (id: string, changes: Partial<Person>) =>
      dispatch(updatePerson({ id, changes })),
    deletePerson: (id: string) => dispatch(deletePersonThunk(id)),
  };
}
