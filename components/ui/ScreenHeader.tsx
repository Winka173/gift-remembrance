import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';

interface ScreenHeaderProps {
  title?: string;
  wordmark?: boolean;
  right?: React.ReactNode;
  style?: ViewStyle;
}

export function ScreenHeader({
  title,
  wordmark = false,
  right,
  style,
}: ScreenHeaderProps) {
  const { colors, spacing } = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          backgroundColor: colors.bg.screen,
        },
        style,
      ]}
    >
      {wordmark ? (
        <Text style={[typography.h2, { color: colors.primary[500] }]}>
          Gift Remembrance
        </Text>
      ) : (
        <Text style={[typography.h2, { color: colors.text.primary }]}>
          {title}
        </Text>
      )}
      {right != null && <View>{right}</View>}
    </View>
  );
}
