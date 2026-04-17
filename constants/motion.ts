export const duration = {
  instant: 120,
  fast: 200,
  medium: 280,
  slow: 340,
  celebration: 480,
} as const;

export const springs = {
  button: { damping: 15, stiffness: 400 },
  row: { damping: 15, stiffness: 300 },
  chip: { damping: 12, stiffness: 500 },
  fab: { damping: 14, stiffness: 350 },
  iconButton: { damping: 12, stiffness: 500 },
  card: { damping: 18, stiffness: 300 },
} as const;

export const pressScale = {
  button: 0.95,
  row: 0.97,
  chip: 0.91,
  fab: 0.92,
  iconButton: 0.88,
  card: 0.98,
} as const;
