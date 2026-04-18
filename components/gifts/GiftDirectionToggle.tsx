import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { ArrowUpRight, ArrowDownLeft } from '@/constants/icons';

interface GiftDirectionToggleProps {
  value: 'given' | 'received';
  onChange: (v: 'given' | 'received') => void;
}

export function GiftDirectionToggle({
  value,
  onChange,
}: GiftDirectionToggleProps) {
  const { colors, spacing, radius } = useTheme();

  const renderPill = (
    pill: 'given' | 'received',
    label: string,
    Icon: typeof ArrowUpRight,
  ) => {
    const selected = value === pill;
    const bg = selected
      ? pill === 'given'
        ? colors.direction.givenBg
        : colors.direction.receivedBg
      : 'transparent';
    const fg = selected
      ? pill === 'given'
        ? colors.direction.given
        : colors.direction.received
      : colors.text.muted;

    return (
      <Pressable
        onPress={() => onChange(pill)}
        accessibilityRole="button"
        accessibilityLabel={`Mark as ${label}`}
        accessibilityState={{ selected }}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.xs,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderRadius: radius.full,
          backgroundColor: bg,
        }}
      >
        <Icon size={16} color={fg} />
        <Text style={[typography.bodyMedium, { color: fg }]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: spacing.xs,
        padding: spacing.xs,
        borderRadius: radius.full,
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.border.light,
      }}
    >
      {renderPill('given', 'Given', ArrowUpRight)}
      {renderPill('received', 'Received', ArrowDownLeft)}
    </View>
  );
}
