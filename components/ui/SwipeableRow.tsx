import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@/constants/theme';
import { springs } from '@/constants/motion';
import { Trash2 } from '@/constants/icons';
import { haptic } from '@/utils/haptics';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  deleteThreshold?: number;
}

export function SwipeableRow({
  children,
  onDelete,
  deleteThreshold = 80,
}: SwipeableRowProps) {
  const { colors, spacing } = useTheme();
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      const next = startX.value + event.translationX;
      translateX.value = Math.min(0, next);
    })
    .onEnd(() => {
      if (-translateX.value >= deleteThreshold) {
        runOnJS(haptic.heavy)();
        runOnJS(onDelete)();
        translateX.value = withSpring(0, springs.row);
      } else {
        translateX.value = withSpring(0, springs.row);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backgroundOpacity = useAnimatedStyle(() => ({
    opacity: Math.min(1, -translateX.value / deleteThreshold),
  }));

  return (
    <View style={{ overflow: 'hidden' }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.semantic.error,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: spacing.xl,
          },
          backgroundOpacity,
        ]}
      >
        <Trash2 size={22} color={colors.text.inverse} />
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={rowStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}
