export type GiftDirection = 'given' | 'received';

export type OccasionLinkType =
  | 'birthday'
  | 'anniversary'
  | 'christmas'
  | 'valentines'
  | 'mothers_day'
  | 'fathers_day'
  | 'just_because'
  | 'custom';

export interface Gift {
  id: string;
  personIds: string[];
  name: string;
  direction: GiftDirection;
  date: string;
  occasionType: OccasionLinkType;
  customOccasionLabel: string | null;
  price: number | null;
  photoUri: string | null;
  notes: string | null;
  createdAt: number;
  updatedAt: number;
}
