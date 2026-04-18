import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { Lock } from '@/constants/icons';

interface Props {
  onUnlock: () => Promise<boolean>;
}

export function BiometricLockScreen({ onUnlock }: Props) {
  const { colors, spacing } = useTheme();

  useEffect(() => {
    onUnlock();
  }, [onUnlock]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg.screen,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.lg,
      }}
    >
      <Lock size={64} color={colors.primary[500]} />
      <Text style={[typography.h2, { color: colors.text.primary }]}>
        Gift Remembrance
      </Text>
      <Text style={[typography.body, { color: colors.text.muted }]}>
        Locked — tap to unlock
      </Text>
      <Pressable
        onPress={onUnlock}
        accessibilityRole="button"
        accessibilityLabel="Unlock app"
        style={{
          backgroundColor: colors.primary[500],
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          borderRadius: 9999,
        }}
      >
        <Text style={[typography.button, { color: colors.text.inverse }]}>
          Unlock
        </Text>
      </Pressable>
    </View>
  );
}
