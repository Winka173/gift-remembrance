import * as Notifications from 'expo-notifications';
import type { Occasion } from '@/types/occasion';
import type { Person } from '@/types/person';
import type { SettingsState } from '@/types/settings';
import { nextOccurrence } from './dateUtils';

const WINDOW_DAYS = 60;

export async function requestPermissionIfNeeded(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

function formatOccasionTitle(occasion: Occasion, people: Person[]): string {
  const names = occasion.personIds
    .map((id) => people.find((p) => p.id === id)?.name ?? 'Someone');

  let display: string;
  if (names.length === 1) display = names[0];
  else if (names.length === 2) display = `${names[0]} & ${names[1]}`;
  else display = `${names[0]} and ${names.length - 1} others`;

  const label =
    occasion.type === 'custom'
      ? (occasion.customLabel ?? 'Occasion')
      : occasion.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return `${display}'s ${label}`;
}

export async function scheduleForOccasion(
  occasion: Occasion,
  people: Person[],
  settings: SettingsState,
): Promise<string | null> {
  const next = nextOccurrence(occasion);
  const now = new Date();
  const daysUntil = (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (daysUntil > WINDOW_DAYS || daysUntil < 0) return null;

  const [hour, minute] = settings.reminderTimeOfDay.split(':').map(Number);
  const trigger = new Date(next);
  trigger.setDate(trigger.getDate() - settings.reminderDaysBefore);
  trigger.setHours(hour, minute, 0, 0);

  if (trigger <= now) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: formatOccasionTitle(occasion, people),
      body: `Coming up in ${settings.reminderDaysBefore} day${settings.reminderDaysBefore === 1 ? '' : 's'}`,
      data: { occasionId: occasion.id, personId: occasion.personIds[0] },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
  });

  return id;
}

export async function cancelForOccasion(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function rescheduleAll(
  occasions: Occasion[],
  people: Person[],
  settings: SettingsState,
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  for (const occasion of occasions) {
    if (occasion.notificationId) {
      await cancelForOccasion(occasion.notificationId).catch(() => {});
    }
    const id = await scheduleForOccasion(occasion, people, settings);
    if (id) result.set(occasion.id, id);
  }
  return result;
}
