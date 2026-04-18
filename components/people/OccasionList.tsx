import React from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Cake,
  HeartHandshake,
  Gift,
  Heart,
  Flower2,
  Award,
  CalendarPlus,
  Plus,
} from '@/constants/icons';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import type { Occasion, OccasionType } from '@/types/occasion';
import { nextOccurrence, daysUntil, formatDate } from '@/utils/dateUtils';
import { Button } from '@/components/ui/Button';

interface OccasionListProps {
  occasions: Occasion[];
  peopleById: Record<string, { name: string }>;
  currentPersonId: string;
  onEdit: (occasion: Occasion) => void;
  onAddOccasion: () => void;
}

const OCCASION_ICONS: Record<
  OccasionType,
  React.ComponentType<{ size?: number; color?: string }>
> = {
  birthday: Cake,
  anniversary: HeartHandshake,
  christmas: Gift,
  valentines: Heart,
  mothers_day: Flower2,
  fathers_day: Award,
  custom: CalendarPlus,
};

const OCCASION_LABELS: Record<OccasionType, string> = {
  birthday: 'Birthday',
  anniversary: 'Anniversary',
  christmas: 'Christmas',
  valentines: "Valentine's",
  mothers_day: "Mother's Day",
  fathers_day: "Father's Day",
  custom: 'Custom',
};

function countdownColor(
  days: number,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  if (days <= 3) return colors.countdown.imminent;
  if (days <= 7) return colors.countdown.soon;
  if (days <= 30) return colors.countdown.near;
  return colors.countdown.far;
}

export function OccasionList({
  occasions,
  peopleById,
  currentPersonId,
  onEdit,
  onAddOccasion,
}: OccasionListProps) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      {occasions.map((occ) => {
        const Icon = OCCASION_ICONS[occ.type];
        const iconColor = colors.occasion[occ.type];
        const label =
          occ.type === 'custom' && occ.customLabel
            ? occ.customLabel
            : OCCASION_LABELS[occ.type];
        const when = nextOccurrence(occ);
        const days = daysUntil(when);
        const badgeColor = countdownColor(days, colors);

        const others = occ.personIds
          .filter((id) => id !== currentPersonId)
          .map((id) => peopleById[id]?.name)
          .filter(Boolean) as string[];

        return (
          <Pressable
            key={occ.id}
            onPress={() => onEdit(occ)}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${label}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              padding: spacing.md,
              backgroundColor: colors.bg.card,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border.light,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.bg.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={20} color={iconColor} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={[typography.bodySemi, { color: colors.text.primary }]}
                numberOfLines={1}
              >
                {label}
              </Text>
              <Text
                style={[typography.caption, { color: colors.text.secondary }]}
                numberOfLines={1}
              >
                {formatDate(occ.date)}
                {others.length > 0 ? ` · with ${others.join(', ')}` : ''}
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: spacing.sm,
                paddingVertical: 4,
                borderRadius: radius.full,
                backgroundColor: badgeColor + '22',
              }}
            >
              <Text
                style={[
                  typography.captionMedium,
                  {
                    color: badgeColor,
                    fontVariant: ['tabular-nums'],
                  },
                ]}
              >
                {days === 0
                  ? 'today'
                  : days > 0
                  ? `${days}d`
                  : `${Math.abs(days)}d ago`}
              </Text>
            </View>
          </Pressable>
        );
      })}

      <View style={{ marginTop: spacing.sm }}>
        <Button
          label="Add occasion"
          onPress={onAddOccasion}
          variant="secondary"
          accessibilityLabel="Add occasion"
        />
      </View>

      {occasions.length === 0 && (
        <View
          style={{
            paddingVertical: spacing.lg,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: spacing.xs,
          }}
        >
          <Plus size={14} color={colors.text.muted} />
          <Text style={[typography.caption, { color: colors.text.muted }]}>
            No occasions yet
          </Text>
        </View>
      )}
    </View>
  );
}
