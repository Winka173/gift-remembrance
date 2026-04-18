import React, { useEffect } from 'react';
import { View, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/constants/theme';
import { springs } from '@/constants/motion';
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

  const indicatorX = useSharedValue(value === 'given' ? 0 : 1);
  useEffect(() => {
    indicatorX.value = withSpring(value === 'given' ? 0 : 1, springs.chip);
  }, [value, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: `${indicatorX.value * 50}%`,
    backgroundColor:
      indicatorX.value < 0.5
        ? colors.direction.givenBg
        : colors.direction.receivedBg,
  }));

  const renderPill = (
    pill: 'given' | 'received',
    label: string,
    Icon: typeof ArrowUpRight,
  ) => {
    const selected = value === pill;
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
        position: 'relative',
        flexDirection: 'row',
        width: '100%',
        padding: spacing.xs,
        borderRadius: radius.full,
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.border.light,
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: spacing.xs,
            bottom: spacing.xs,
            width: '50%',
            borderRadius: radius.full,
          },
          indicatorStyle,
        ]}
      />
      {renderPill('given', 'Given', ArrowUpRight)}
      {renderPill('received', 'Received', ArrowDownLeft)}
    </View>
  );
}
