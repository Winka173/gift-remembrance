import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ViewStyle, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/constants/theme';
import { springs, duration } from '@/constants/motion';
import { typography } from '@/constants/typography';
import { Plus, Gift, Users, CalendarPlus } from '@/constants/icons';
import type { LucideIcon } from 'lucide-react-native';
import { haptic } from '@/utils/haptics';

interface FABMenuProps {
  onAddGift: () => void;
  onAddPerson: () => void;
  onAddOccasion: () => void;
}

interface ChildActionProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  open: SharedValue<number>;
  index: number;
}

function ChildAction({
  icon: Icon,
  label,
  onPress,
  open,
  index,
}: ChildActionProps) {
  const { colors, spacing, radius, shadow } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = -(64 * (index + 1)) * open.value;
    return {
      opacity: open.value,
      transform: [
        { translateY: translateY + (1 - open.value) * 20 },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      entering={FadeInDown.delay(index * 60).springify()}
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
  const openValue = useSharedValue(0);
  const scale = useSharedValue(1);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!open) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1400 }),
          withTiming(0, { duration: 0 }),
        ),
        -1,
        false,
      );
    } else {
      pulse.value = withTiming(0, { duration: duration.fast });
    }
  }, [open, pulse]);

  const toggle = () => {
    const next = !open;
    haptic.medium();
    setOpen(next);
    openValue.value = withSpring(next ? 1 : 0, springs.fab);
  };

  const close = () => {
    setOpen(false);
    openValue.value = withSpring(0, springs.fab);
  };

  const handleChild = (fn: () => void) => () => {
    openValue.value = withSpring(0, springs.fab);
    setOpen(false);
    fn();
  };

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${openValue.value * 45}deg` },
    ],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.3 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.2 }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: openValue.value * 0.4,
  }));

  const containerStyle: ViewStyle = {
    position: 'absolute',
    bottom: spacing['2xl'],
    right: spacing.xl,
    alignItems: 'flex-end',
  };

  return (
    <>
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.bg.overlay ?? '#000' },
          overlayStyle,
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Close add menu"
        />
      </Animated.View>

      <View style={containerStyle} pointerEvents="box-none">
        {open && (
          <>
            <ChildAction
              icon={Gift}
              label="Add Gift"
              onPress={handleChild(onAddGift)}
              open={openValue}
              index={0}
            />
            <ChildAction
              icon={Users}
              label="Add Person"
              onPress={handleChild(onAddPerson)}
              open={openValue}
              index={1}
            />
            <ChildAction
              icon={CalendarPlus}
              label="Add Occasion"
              onPress={handleChild(onAddOccasion)}
              open={openValue}
              index={2}
            />
          </>
        )}

        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.primary[500],
              right: 0,
              bottom: 0,
            },
            pulseStyle,
          ]}
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
    </>
  );
}
