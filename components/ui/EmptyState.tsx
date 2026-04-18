import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const { colors, spacing } = useTheme();

  return (
    <View
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing['3xl'],
        },
        style,
      ]}
    >
      {Icon != null && (
        <View style={{ marginBottom: spacing.lg }}>
          <Icon size={48} color={colors.text.muted} strokeWidth={1.5} />
        </View>
      )}
      <Text
        style={[
          typography.h3,
          {
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing.sm,
          },
        ]}
      >
        {title}
      </Text>
      {subtitle != null && (
        <Text
          style={[
            typography.body,
            {
              color: colors.text.muted,
              textAlign: 'center',
              marginBottom: spacing.xl,
            },
          ]}
        >
          {subtitle}
        </Text>
      )}
      {actionLabel != null && onAction != null && (
        <Button
          label={actionLabel}
          onPress={onAction}
          accessibilityLabel={actionLabel}
        />
      )}
    </View>
  );
}
