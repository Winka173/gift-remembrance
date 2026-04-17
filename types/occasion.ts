export type OccasionType =
  | 'birthday'
  | 'anniversary'
  | 'christmas'
  | 'valentines'
  | 'mothers_day'
  | 'fathers_day'
  | 'custom';

export type ReminderDays = 1 | 3 | 7 | 14;

export interface Occasion {
  id: string;
  personIds: string[];
  type: OccasionType;
  customLabel: string | null;
  date: string;
  recurring: boolean;
  notificationId: string | null;
  createdAt: number;
  updatedAt: number;
}
