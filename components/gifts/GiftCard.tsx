import React from 'react';
import { Pressable, View, Text, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { springs, pressScale } from '@/constants/motion';
import { Gift as GiftIcon, ArrowUpRight, ArrowDownLeft } from '@/constants/icons';
import { OCCASION_TYPES } from '@/constants/occasionTypes';
import { useAppSelector } from '@/store/hooks';
import type { Gift } from '@/types/gift';
import { formatCurrency } from '@/utils/budgetUtils';
import { formatDate } from '@/utils/dateUtils';
import { SwipeableRow } from '@/components/ui/SwipeableRow';
import { PersonAvatarStack } from '@/components/people/PersonAvatarStack';

interface GiftCardProps {
  gift: Gift;
  currentPersonId?: string;
  onDelete?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GiftCard({ gift, currentPersonId, onDelete }: GiftCardProps) {
  const { colors, spacing, radius, shadow } = useTheme();
  const router = useRouter();
  const currency = useAppSelector((s) => s.settings.currency);
  const peopleById = useAppSelector((s) => s.people.byId);
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
    router.push(`/gift/${gift.id}`);
  };

  const isGiven = gift.direction === 'given';
  const directionColor = isGiven
    ? colors.direction.given
    : colors.direction.received;
  const directionBg = isGiven
    ? colors.direction.givenBg
    : colors.direction.receivedBg;
  const DirectionIcon = isGiven ? ArrowUpRight : ArrowDownLeft;
  const directionLabel = isGiven ? 'Given' : 'Received';

  const occasionLabel =
    gift.occasionType === 'custom' && gift.customOccasionLabel
      ? gift.customOccasionLabel
      : OCCASION_TYPES.find((o) => o.id === gift.occasionType)?.label ??
        'Just because';

  const subtitle = `${occasionLabel} · ${formatDate(gift.date)}`;

  const othersCount = gift.personIds.length - 1;
  const showOthersBadge =
    currentPersonId != null && gift.personIds.length > 1;

  const people = !currentPersonId
    ? gift.personIds
        .map((id) => peopleById[id])
        .filter((p): p is NonNullable<typeof p> => p != null)
        .map((p) => ({ id: p.id, name: p.name, avatarUri: p.avatarUri }))
    : [];

  const card = (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`Open gift ${gift.name}`}
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
      {gift.photoUri ? (
        <Image
          source={{ uri: gift.photoUri }}
          style={{
            width: 56,
            height: 56,
            borderRadius: radius.md,
            backgroundColor: colors.bg.surface,
          }}
        />
      ) : (
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: radius.md,
            backgroundColor: colors.bg.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GiftIcon size={24} color={colors.text.muted} />
        </View>
      )}

      {!currentPersonId && people.length > 0 && (
        <PersonAvatarStack people={people} size="sm" />
      )}

      <View style={{ flex: 1, gap: spacing.xs }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
          }}
        >
          <Text
            style={[
              typography.bodySemi,
              { color: colors.text.primary, flexShrink: 1 },
            ]}
            numberOfLines={1}
          >
            {gift.name}
          </Text>
          {showOthersBadge && (
            <View
              style={{
                paddingHorizontal: spacing.sm,
                paddingVertical: 2,
                borderRadius: radius.full,
                backgroundColor: colors.bg.surface,
              }}
            >
              <Text
                maxFontSizeMultiplier={1.3}
                style={[
                  typography.caption,
                  { color: colors.text.secondary },
                ]}
              >
                +{othersCount} {othersCount === 1 ? 'other' : 'others'}
              </Text>
            </View>
          )}
        </View>
        <Text
          maxFontSizeMultiplier={1.3}
          style={[typography.caption, { color: colors.text.muted }]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
        {gift.price != null && (
          <Text
            style={[
              typography.captionMedium,
              {
                color: colors.text.secondary,
                fontVariant: ['tabular-nums'],
              },
            ]}
          >
            {formatCurrency(gift.price, currency)}
          </Text>
        )}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: radius.full,
          backgroundColor: directionBg,
        }}
      >
        <DirectionIcon size={14} color={directionColor} />
        <Text
          style={[typography.captionMedium, { color: directionColor }]}
        >
          {directionLabel}
        </Text>
      </View>
    </AnimatedPressable>
  );

  if (onDelete) {
    return <SwipeableRow onDelete={onDelete}>{card}</SwipeableRow>;
  }
  return card;
}
