import { createMMKV } from 'react-native-mmkv';

export const mmkv = createMMKV();

const debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

export function saveSlice(key: string, value: unknown, debounceMs = 500): void {
  if (debounceTimers[key]) {
    clearTimeout(debounceTimers[key]);
  }
  debounceTimers[key] = setTimeout(() => {
    try {
      mmkv.set(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[storage] Failed to save key "${key}":`, e);
    }
    delete debounceTimers[key];
  }, debounceMs);
}

export function loadSlice<T>(key: string, fallback: T): T {
  try {
    const raw = mmkv.getString(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`[storage] Failed to load key "${key}":`, e);
    return fallback;
  }
}
