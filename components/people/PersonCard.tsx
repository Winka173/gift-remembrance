import React from 'react';
import { Pressable, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { parseISO } from 'date-fns';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { springs, pressScale } from '@/constants/motion';
import { useAppSelector } from '@/store/hooks';
import type { Person } from '@/types/person';
import type { Occasion } from '@/types/occasion';
import { nextOccurrence, formatRelative } from '@/utils/dateUtils';
import { computeBudgetStatus, formatCurrency } from '@/utils/budgetUtils';
import { SwipeableRow } from '@/components/ui/SwipeableRow';
import { PersonAvatar } from './PersonAvatar';

interface PersonCardProps {
  person: Person;
  nextOccasion?: Occasion | null;
  totalGivenYTD: number;
  annualBudget: number | null;
  onDelete?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PersonCard({
  person,
  nextOccasion,
  totalGivenYTD,
  annualBudget,
  onDelete,
}: PersonCardProps) {
  const { colors, spacing, radius, shadow } = useTheme();
  const router = useRouter();
  const currency = useAppSelector((s) => s.settings.currency);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(pressScale.row, springs.card);
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, springs.card);
  };
  const handlePress = () => {
    router.push(`/person/${person.id}`);
  };

  const status = computeBudgetStatus(person, totalGivenYTD);
  const barColor =
    status === 'under'
      ? colors.budget.under
      : status === 'over'
      ? colors.budget.over
      : status === 'on_track'
      ? colors.budget.onTrack
      : colors.text.muted;

  const ratio =
    annualBudget && annualBudget > 0
      ? Math.min(1, Math.max(0, totalGivenYTD / annualBudget))
      : 0;

  let subtitle: string | null = null;
  let nextWhen: Date | null = null;
  if (nextOccasion) {
    nextWhen = nextOccasion.recurring
      ? nextOccurrence(nextOccasion)
      : parseISO(nextOccasion.date);
    subtitle = formatRelative(nextWhen);
  }

  const a11y = `${person.name}${
    nextWhen ? `, next: ${formatRelative(nextWhen)}` : ''
  }`;

  const card = (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={[
        animatedStyle,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          padding: spacing.lg,
          backgroundColor: colors.bg.card,
          borderRadius: radius.lg,
          ...shadow.card,
        },
      ]}
    >
      <PersonAvatar
        name={person.name}
        photoUri={person.avatarUri}
        size="lg"
      />
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text
          style={[typography.h3, { color: colors.text.primary }]}
          numberOfLines={1}
        >
          {person.name}
        </Text>
        {subtitle != null && (
          <Text
            style={[typography.caption, { color: colors.text.secondary }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            marginTop: spacing.xs,
          }}
        >
          <View
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.bg.surface,
              overflow: 'hidden',
            }}
          >
            {annualBudget != null && annualBudget > 0 && (
              <View
                style={{
                  width: `${ratio * 100}%`,
                  height: '100%',
                  backgroundColor: barColor,
                  borderRadius: 3,
                }}
              />
            )}
          </View>
          <Text
            style={[
              typography.caption,
              {
                color: colors.text.muted,
                fontVariant: ['tabular-nums'],
              },
            ]}
          >
            {annualBudget != null && annualBudget > 0
              ? `${formatCurrency(totalGivenYTD, currency)} / ${formatCurrency(
                  annualBudget,
                  currency,
                )}`
              : '—'}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );

  if (onDelete) {
    return <SwipeableRow onDelete={onDelete}>{card}</SwipeableRow>;
  }
  return card;
}
