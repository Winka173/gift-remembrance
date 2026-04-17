import * as Contacts from 'expo-contacts';
import { format } from 'date-fns';
import type { Person } from '@/types/person';

export function mapContactToPerson(
  contact: Contacts.ExistingContact,
): { person: Partial<Person>; birthday?: string } {
  const person: Partial<Person> = {
    name: contact.name ?? 'Unknown',
    contactId: contact.id ?? null,
    avatarUri: null,
    relationship: null,
    annualBudget: null,
    notes: null,
  };

  let birthday: string | undefined;

  if (contact.birthday) {
    const { year, month, day } = contact.birthday;
    if (month != null && day != null) {
      const y = year ?? 1900;
      const date = new Date(y, month - 1, day);
      birthday = format(date, 'yyyy-MM-dd');
    }
  }

  return { person, birthday };
}
