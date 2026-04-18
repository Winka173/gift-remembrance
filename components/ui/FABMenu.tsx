import React, { useState } from 'react';
import { View, Text, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/constants/theme';
import { springs, duration } from '@/constants/motion';
import { typography } from '@/constants/typography';
import { Plus, Gift, Users, CalendarPlus } from '@/constants/icons';
import type { LucideIcon } from 'lucide-react-native';

interface FABMenuProps {
  onAddGift: () => void;
  onAddPerson: () => void;
  onAddOccasion: () => void;
}

interface ChildActionProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  progress: SharedValue<number>;
  index: number;
}

function ChildAction({
  icon: Icon,
  label,
  onPress,
  progress,
  index,
}: ChildActionProps) {
  const { colors, spacing, radius, shadow } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [0, -(64 * (index + 1))],
    );
    return {
      opacity: progress.value,
      transform: [{ translateY }],
    };
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: 'absolute',
          right: 0,
          bottom: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
        },
        animatedStyle,
      ]}
    >
      <View
        style={[
          {
            backgroundColor: colors.bg.card,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radius.full,
            marginRight: spacing.sm,
          },
          shadow.card,
        ]}
      >
        <Text
          style={[typography.captionMedium, { color: colors.text.primary }]}
        >
          {label}
        </Text>
      </View>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.bg.card,
            alignItems: 'center',
            justifyContent: 'center',
          },
          shadow.card,
        ]}
      >
        <Icon size={22} color={colors.primary[500]} />
      </Pressable>
    </Animated.View>
  );
}

export function FABMenu({
  onAddGift,
  onAddPerson,
  onAddOccasion,
}: FABMenuProps) {
  const { colors, spacing, shadow } = useTheme();
  const [open, setOpen] = useState(false);
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    progress.value = withTiming(next ? 1 : 0, { duration: duration.fast });
  };

  const handleChild = (fn: () => void) => () => {
    progress.value = withTiming(0, { duration: duration.fast });
    setOpen(false);
    fn();
  };

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${interpolate(progress.value, [0, 1], [0, 45])}deg` },
    ],
  }));

  const containerStyle: ViewStyle = {
    position: 'absolute',
    bottom: spacing['2xl'],
    right: spacing.xl,
    alignItems: 'flex-end',
  };

  return (
    <View style={containerStyle} pointerEvents="box-none">
      <ChildAction
        icon={Gift}
        label="Add Gift"
        onPress={handleChild(onAddGift)}
        progress={progress}
        index={0}
      />
      <ChildAction
        icon={Users}
        label="Add Person"
        onPress={handleChild(onAddPerson)}
        progress={progress}
        index={1}
      />
      <ChildAction
        icon={CalendarPlus}
        label="Add Occasion"
        onPress={handleChild(onAddOccasion)}
        progress={progress}
        index={2}
      />

      <Pressable
        onPress={toggle}
        onPressIn={() => {
          scale.value = withSpring(0.92, springs.fab);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, springs.fab);
        }}
        accessibilityRole="button"
        accessibilityLabel={open ? 'Close add menu' : 'Open add menu'}
        accessibilityState={{ expanded: open }}
      >
        <Animated.View
          style={[
            {
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.primary[500],
              alignItems: 'center',
              justifyContent: 'center',
            },
            shadow.fab,
            fabAnimatedStyle,
          ]}
        >
          <Plus size={28} color={colors.text.inverse} strokeWidth={2.5} />
        </Animated.View>
      </Pressable>
    </View>
  );
}
