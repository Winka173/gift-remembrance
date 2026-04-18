import React, { useMemo } from 'react';
import { Pressable, View, Text } from 'react-native';
import {
  format,
  getDaysInMonth,
  startOfMonth,
  getDay,
  parseISO,
  isValid,
} from 'date-fns';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { ChevronLeft, ChevronRight } from '@/constants/icons';
import type { Occasion } from '@/types/occasion';
import { OccasionDot } from './OccasionDot';

interface MonthViewProps {
  year: number;
  month: number;
  occasions: Occasion[];
  onDayPress?: (date: string) => void;
  onMonthChange: (year: number, month: number) => void;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

function addMonths(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const total = year * 12 + month + delta;
  return {
    year: Math.floor(total / 12),
    month: ((total % 12) + 12) % 12,
  };
}

export function MonthView({
  year,
  month,
  occasions,
  onDayPress,
  onMonthChange,
}: MonthViewProps) {
  const { colors, spacing, radius } = useTheme();

  const monthDate = new Date(year, month, 1);
  const daysInMonth = getDaysInMonth(monthDate);
  const leadingBlanks = getDay(startOfMonth(monthDate));

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();
  const isCurrentMonth = todayYear === year && todayMonth === month;

  const dotsByKey = useMemo(() => {
    const map: Record<string, Occasion[]> = {};
    for (const occ of occasions) {
      const parsed = parseISO(occ.date);
      if (!isValid(parsed)) continue;
      const key = `${pad2(parsed.getMonth() + 1)}-${pad2(parsed.getDate())}`;
      if (!map[key]) map[key] = [];
      map[key].push(occ);
    }
    return map;
  }, [occasions]);

  const cells: Array<{ day: number | null; key: string }> = [];
  for (let i = 0; i < leadingBlanks; i++) {
    cells.push({ day: null, key: `blank-${i}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, key: `day-${d}` });
  }

  const goPrev = () => {
    const next = addMonths(year, month, -1);
    onMonthChange(next.year, next.month);
  };
  const goNext = () => {
    const next = addMonths(year, month, 1);
    onMonthChange(next.year, next.month);
  };
  const goToday = () => {
    onMonthChange(todayYear, todayMonth);
  };

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        }}
      >
        <Pressable
          onPress={goPrev}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          style={{
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.full,
          }}
        >
          <ChevronLeft size={22} color={colors.text.primary} />
        </Pressable>

        <Text style={[typography.h3, { color: colors.text.primary }]}>
          {format(monthDate, 'MMMM yyyy')}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
          }}
        >
          {!isCurrentMonth && (
            <Pressable
              onPress={goToday}
              accessibilityRole="button"
              accessibilityLabel="Jump to today"
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                borderRadius: radius.full,
                backgroundColor: colors.bg.surface,
              }}
            >
              <Text
                style={[
                  typography.captionMedium,
                  { color: colors.text.primary },
                ]}
              >
                Today
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={goNext}
            accessibilityRole="button"
            accessibilityLabel="Next month"
            style={{
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radius.full,
            }}
          >
            <ChevronRight size={22} color={colors.text.primary} />
          </Pressable>
        </View>
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: spacing.sm }}>
        {WEEKDAY_LABELS.map((label) => (
          <View
            key={label}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: spacing.xs,
            }}
          >
            <Text
              style={[
                typography.caption,
                {
                  color: colors.text.muted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                },
              ]}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingHorizontal: spacing.sm,
        }}
      >
        {cells.map((cell) => {
          if (cell.day == null) {
            return (
              <View
                key={cell.key}
                style={{
                  width: `${100 / 7}%`,
                  aspectRatio: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            );
          }

          const dateStr = isoDate(year, month, cell.day);
          const isToday = isCurrentMonth && cell.day === todayDay;
          const key = `${pad2(month + 1)}-${pad2(cell.day)}`;
          const cellOccasions = dotsByKey[key] ?? [];
          const visibleDots = cellOccasions.slice(0, 3);

          return (
            <Pressable
              key={cell.key}
              onPress={() => onDayPress?.(dateStr)}
              accessibilityRole="button"
              accessibilityLabel={`Day ${cell.day}`}
              style={{
                width: `${100 / 7}%`,
                aspectRatio: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: radius.full,
                  borderWidth: isToday ? 2 : 0,
                  borderColor: isToday ? colors.primary[500] : 'transparent',
                }}
              >
                <Text
                  style={[
                    typography.caption,
                    {
                      color: isToday
                        ? colors.primary[500]
                        : colors.text.primary,
                      fontVariant: ['tabular-nums'],
                    },
                  ]}
                >
                  {cell.day}
                </Text>
              </View>
              {visibleDots.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 2,
                    marginTop: 2,
                  }}
                >
                  {visibleDots.map((occ) => (
                    <OccasionDot key={occ.id} type={occ.type} />
                  ))}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
