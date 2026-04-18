import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/constants/theme';
import type { OccasionType } from '@/types/occasion';

interface OccasionDotProps {
  type: OccasionType;
}

export function OccasionDot({ type }: OccasionDotProps) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.occasion[type],
      }}
    />
  );
}
