import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { Occasion } from '@/types/occasion';
import type { Person } from '@/types/person';
import { OCCASION_TYPES } from '@/constants/occasionTypes';

function escapeIcs(text: string): string {
  return text.replace(/[\\;,]/g, (m) => '\\' + m).replace(/\n/g, '\\n');
}

function occasionLabel(occasion: Occasion): string {
  if (occasion.type === 'custom') return occasion.customLabel ?? 'Occasion';
  return OCCASION_TYPES.find((t) => t.id === occasion.type)?.label ?? 'Occasion';
}

function personNames(occasion: Occasion, peopleById: Record<string, Person>): string {
  const names = occasion.personIds.map((id) => peopleById[id]?.name ?? 'Someone');
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names[0]} and ${names.length - 1} others`;
}

export function buildIcs(
  occasions: Occasion[],
  peopleById: Record<string, Person>,
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gift Remembrance//EN',
    'CALSCALE:GREGORIAN',
  ];
  for (const o of occasions) {
    const dt = o.date.replace(/-/g, '');
    const uid = `${o.id}@giftremembrance.app`;
    const label = occasionLabel(o);
    const who = personNames(o, peopleById);
    const summary = escapeIcs(`${who}'s ${label}`);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`);
    lines.push(`DTSTART;VALUE=DATE:${dt}`);
    const next = new Date(o.date);
    next.setDate(next.getDate() + 1);
    const nextStr = next.toISOString().slice(0, 10).replace(/-/g, '');
    lines.push(`DTEND;VALUE=DATE:${nextStr}`);
    lines.push(`SUMMARY:${summary}`);
    if (o.recurring) lines.push('RRULE:FREQ=YEARLY');
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

const BASE = FileSystem.documentDirectory ?? '';

export async function exportIcs(
  occasions: Occasion[],
  peopleById: Record<string, Person>,
): Promise<void> {
  const ics = buildIcs(occasions, peopleById);
  const path = `${BASE}gift-remembrance-occasions.ics`;
  await FileSystem.writeAsStringAsync(path, ics);
  const available = await Sharing.isAvailableAsync();
  if (!available) return;
  await Sharing.shareAsync(path, {
    mimeType: 'text/calendar',
    dialogTitle: 'Export Gift Remembrance occasions',
    UTI: 'public.calendar-event',
  });
}
