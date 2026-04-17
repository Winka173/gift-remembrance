import type { Occasion } from './occasion';

export interface Person {
  id: string;
  name: string;
  relationship: string | null;
  avatarUri: string | null;
  annualBudget: number | null;
  notes: string | null;
  contactId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface PersonWithStats extends Person {
  giftCount: number;
  giftsGivenCount: number;
  giftsReceivedCount: number;
  totalGivenYTD: number;
  nextOccasion: Occasion | null;
  daysUntilNextOccasion: number | null;
}
