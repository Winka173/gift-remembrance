import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Contacts from 'expo-contacts';
import * as Crypto from 'expo-crypto';
import type { RootState } from '@/store';
import { addPerson } from '@/store/slices/peopleSlice';
import { addOccasion } from '@/store/slices/occasionsSlice';
import { mapContactToPerson } from '@/utils/contactMapper';

export const importContactsThunk = createAsyncThunk(
  'people/importContacts',
  async (contactIds: string[], { dispatch, getState }) => {
    const state = getState() as RootState;
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') throw new Error('Contacts permission denied');

    const imported: string[] = [];

    for (const contactId of contactIds) {
      const contact = await Contacts.getContactByIdAsync(contactId);
      if (!contact) continue;

      const alreadyExists = state.people.allIds.some(
        (id) => state.people.byId[id].contactId === contactId,
      );
      if (alreadyExists) continue;

      const { person: partial, birthday } = mapContactToPerson(contact);
      const now = Date.now();
      const person = {
        id: await Crypto.randomUUID(),
        name: partial.name ?? 'Unknown',
        relationship: partial.relationship ?? null,
        avatarUri: null,
        annualBudget: null,
        notes: null,
        contactId,
        createdAt: now,
        updatedAt: now,
      };
      dispatch(addPerson(person));

      if (birthday) {
        const occasion = {
          id: await Crypto.randomUUID(),
          personIds: [person.id],
          type: 'birthday' as const,
          customLabel: null,
          date: birthday,
          recurring: true,
          notificationId: null,
          createdAt: now,
          updatedAt: now,
        };
        dispatch(addOccasion(occasion));
      }

      imported.push(person.id);
    }

    return imported;
  },
);
