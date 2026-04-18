import React from 'react';
import { Pressable, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { springs, pressScale } from '@/constants/motion';
import {
  Cake,
  HeartHandshake,
  Gift,
  Heart,
  Flower2,
  Award,
  CalendarPlus,
} from '@/constants/icons';
import { OCCASION_TYPES } from '@/constants/occasionTypes';
import { useAppSelector } from '@/store/hooks';
import type { Occasion, OccasionType } from '@/types/occasion';
import type { Person } from '@/types/person';
import { nextOccurrence, daysUntil } from '@/utils/dateUtils';
import { PersonAvatarStack } from '@/components/people/PersonAvatarStack';
import { CountdownBadge } from './CountdownBadge';

interface OccasionCardProps {
  occasion: Occasion;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ICON_MAP: Record<
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

function joinNames(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  if (names.length === 3) return `${names[0]}, ${names[1]} & ${names[2]}`;
  const othersCount = names.length - 2;
  return `${names[0]}, ${names[1]} +${othersCount} others`;
}

export function OccasionCard({ occasion, onPress }: OccasionCardProps) {
  const { colors, spacing, radius, shadow } = useTheme();
  const router = useRouter();
  const scale = useSharedValue(1);

  const people = useAppSelector((s) =>
    occasion.personIds
      .map((id) => s.people.byId[id])
      .filter((p): p is Person => p != null),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(pressScale.card, springs.card);
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, springs.card);
  };
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    const firstId = occasion.personIds[0];
    if (firstId != null) {
      router.push(`/person/${firstId}`);
    }
  };

  const label =
    occasion.type === 'custom'
      ? occasion.customLabel ?? 'Custom'
      : OCCASION_TYPES.find((o) => o.id === occasion.type)?.label ?? 'Occasion';

  const Icon = ICON_MAP[occasion.type];
  const names = joinNames(people.map((p) => p.name));
  const days = daysUntil(nextOccurrence(occasion));

  const avatarPeople = people.map((p) => ({
    id: p.id,
    name: p.name,
    avatarUri: p.avatarUri,
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`${label} for ${names}`}
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
      <PersonAvatarStack people={avatarPeople} size="md" />

      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text
          style={[typography.bodySemi, { color: colors.text.primary }]}
          numberOfLines={1}
        >
          {names}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
          }}
        >
          <Icon size={14} color={colors.text.secondary} />
          <Text
            style={[typography.caption, { color: colors.text.secondary }]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      </View>

      <CountdownBadge days={days} />
    </AnimatedPressable>
  );
}
