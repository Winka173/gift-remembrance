import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/constants/theme';
import { springs, pressScale } from '@/constants/motion';
import { typography } from '@/constants/typography';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Chip({ label, selected = false, onPress, style }: ChipProps) {
  const { colors, radius, spacing } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(pressScale.chip, springs.chip);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.chip);
  };

  const containerStyle: ViewStyle = {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: selected ? colors.primary[500] : colors.bg.surface,
    borderWidth: 1,
    borderColor: selected ? colors.primary[500] : colors.border.light,
    alignSelf: 'flex-start',
  };

  const textColor = selected ? colors.text.inverse : colors.text.secondary;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, containerStyle, style]}
    >
      <Text style={[typography.captionMedium, { color: textColor }]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}
