import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';

interface CountdownBadgeProps {
  days: number;
}

export function CountdownBadge({ days }: CountdownBadgeProps) {
  const { colors, spacing, radius } = useTheme();

  let color = colors.countdown.far;
  if (days <= 3) color = colors.countdown.imminent;
  else if (days <= 7) color = colors.countdown.soon;
  else if (days <= 30) color = colors.countdown.near;

  let label = `${days} days`;
  if (days === 0) label = 'Today';
  else if (days === 1) label = 'Tomorrow';
  else if (days < 0) label = 'Past';

  return (
    <View
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        backgroundColor: color + '22',
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={[
          typography.captionMedium,
          { color, fontVariant: ['tabular-nums'] },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}
