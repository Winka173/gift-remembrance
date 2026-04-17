export const OCCASION_TYPES = [
  {
    id: 'birthday' as const,
    label: 'Birthday',
    icon: 'Cake',
    defaultRecurring: true,
    allowsMulti: false,
  },
  {
    id: 'anniversary' as const,
    label: 'Anniversary',
    icon: 'HeartHandshake',
    defaultRecurring: true,
    allowsMulti: true,
  },
  {
    id: 'christmas' as const,
    label: 'Christmas',
    icon: 'TreePine',
    defaultRecurring: true,
    allowsMulti: true,
  },
  {
    id: 'valentines' as const,
    label: "Valentine's",
    icon: 'Heart',
    defaultRecurring: true,
    allowsMulti: true,
  },
  {
    id: 'mothers_day' as const,
    label: "Mother's Day",
    icon: 'Flower2',
    defaultRecurring: true,
    allowsMulti: true,
  },
  {
    id: 'fathers_day' as const,
    label: "Father's Day",
    icon: 'Award',
    defaultRecurring: true,
    allowsMulti: true,
  },
  {
    id: 'custom' as const,
    label: 'Custom',
    icon: 'CalendarPlus',
    defaultRecurring: false,
    allowsMulti: true,
  },
] as const;

export type OccasionTypeId = (typeof OCCASION_TYPES)[number]['id'];
