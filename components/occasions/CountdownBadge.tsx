import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withRepeat,
  withTiming,
  withSequence,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';

interface CountdownBadgeProps {
  days: number;
}

export function CountdownBadge({ days }: CountdownBadgeProps) {
  const { colors, spacing, radius } = useTheme();

  const daysVal = useDerivedValue(() => days, [days]);

  const animatedBgStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      daysVal.value,
      [-1, 3, 7, 30, 60],
      [
        colors.countdown.imminent,
        colors.countdown.imminent,
        colors.countdown.soon,
        colors.countdown.near,
        colors.countdown.far,
      ],
    );
    return { backgroundColor: color + '22' };
  });

  const animatedTextColor = useAnimatedStyle(() => ({
    color: interpolateColor(
      daysVal.value,
      [-1, 3, 7, 30, 60],
      [
        colors.countdown.imminent,
        colors.countdown.imminent,
        colors.countdown.soon,
        colors.countdown.near,
        colors.countdown.far,
      ],
    ),
  }));

  const scale = useSharedValue(1);
  useEffect(() => {
    if (days >= 0 && days < 7) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, {
            duration: 600,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(1, {
            duration: 600,
            easing: Easing.inOut(Easing.quad),
          }),
        ),
        -1,
        false,
      );
    } else {
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [days, scale]);

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  let label = `${days} days`;
  if (days === 0) label = 'Today';
  else if (days === 1) label = 'Tomorrow';
  else if (days < 0) label = 'Past';

  return (
    <Animated.View
      style={[
        {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          borderRadius: radius.full,
          alignSelf: 'flex-start',
        },
        animatedBgStyle,
        animatedScale,
      ]}
    >
      <Animated.Text
        style={[
          typography.captionMedium,
          { fontVariant: ['tabular-nums'] },
          animatedTextColor,
        ]}
      >
        {label}
      </Animated.Text>
    </Animated.View>
  );
}
