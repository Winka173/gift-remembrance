import React, { useMemo } from 'react';
import { View, Text, Image, ViewStyle } from 'react-native';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';

export type PersonAvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface PersonAvatarProps {
  name: string;
  photoUri?: string | null;
  size?: PersonAvatarSize;
}

const SIZE_MAP: Record<PersonAvatarSize, number> = {
  sm: 32,
  md: 44,
  lg: 64,
  xl: 96,
};

const FONT_SIZE_MAP: Record<PersonAvatarSize, number> = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 34,
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function hashName(name: string): number {
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return sum;
}

export function PersonAvatar({
  name,
  photoUri,
  size = 'md',
}: PersonAvatarProps) {
  const { colors } = useTheme();
  const dimension = SIZE_MAP[size];
  const radius = dimension / 2;

  const palette = useMemo(
    () => [
      colors.primary[400],
      colors.accent[500],
      colors.occasion.birthday,
      colors.occasion.anniversary,
      colors.occasion.christmas,
      colors.occasion.valentines,
      colors.occasion.mothers_day,
      colors.occasion.fathers_day,
    ],
    [colors],
  );

  if (photoUri) {
    return (
      <Image
        source={{ uri: photoUri }}
        style={{
          width: dimension,
          height: dimension,
          borderRadius: radius,
          backgroundColor: colors.bg.surface,
        }}
        accessibilityIgnoresInvertColors
      />
    );
  }

  const bg = palette[hashName(name) % palette.length];
  const initials = getInitials(name);

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: radius,
    backgroundColor: bg,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <View style={containerStyle}>
      <Text
        style={[
          typography.body,
          {
            color: colors.text.inverse,
            fontSize: FONT_SIZE_MAP[size],
            lineHeight: FONT_SIZE_MAP[size] + 2,
            fontFamily: 'Inter_600SemiBold',
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}
