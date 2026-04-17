import type { Person } from './person';
import type { Gift } from './gift';
import type { Occasion } from './occasion';
import type { SettingsState } from './settings';

export type BackupDestination = 'icloud' | 'saf' | 'none';

export interface BackupManifest {
  version: 2;
  createdAt: number;
  appVersion: string;
  deviceOs: 'ios' | 'android';
  data: {
    people: Person[];
    gifts: Gift[];
    occasions: Occasion[];
    settings: Partial<SettingsState>;
  };
}
