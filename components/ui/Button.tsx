import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/constants/theme';
import { springs, pressScale } from '@/constants/motion';
import { typography } from '@/constants/typography';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors, radius } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(pressScale.button, springs.button);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.button);
  };

  const containerStyle: ViewStyle = {
    backgroundColor:
      variant === 'primary'
        ? colors.primary[500]
        : variant === 'secondary'
        ? colors.bg.surface
        : 'transparent',
    borderRadius: radius.md,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.5 : 1,
  };

  const labelColor =
    variant === 'primary' ? colors.text.inverse : colors.text.primary;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, containerStyle, style]}
    >
      <Text style={[typography.button, { color: labelColor }, textStyle]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}
