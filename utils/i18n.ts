import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';

export const translations = {
  en: {
    common: {
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
    },
    home: {
      title: 'Gift Remembrance',
      upcoming: 'Upcoming',
      recent: 'Recent',
      emptyTitle: 'Start remembering gifts',
      emptySubtitle: 'Add someone to get started',
      addPerson: 'Add Person',
      importContacts: 'Import Contacts',
    },
    people: {
      title: 'People',
      searchPlaceholder: 'Search people…',
      deleteConfirm: 'Delete {{name}}? Their gifts and occasions will be removed (shared items will be kept for other people).',
    },
  },
};

export const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = 'en';
i18n.locale = getLocales()[0]?.languageCode ?? 'en';

export function t(key: string, opts?: Record<string, unknown>): string {
  return i18n.t(key, opts);
}

export function setLocale(locale: string): void {
  i18n.locale = locale;
}
