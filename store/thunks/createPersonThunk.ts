import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Crypto from 'expo-crypto';
import type { Person } from '@/types/person';
import { addPerson } from '@/store/slices/peopleSlice';

export const createPersonThunk = createAsyncThunk(
  'people/create',
  async (input: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>, { dispatch }) => {
    const now = Date.now();
    const person: Person = {
      ...input,
      id: await Crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    dispatch(addPerson(person));
    return person;
  },
);
