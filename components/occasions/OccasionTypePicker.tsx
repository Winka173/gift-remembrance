import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import {
  Cake,
  HeartHandshake,
  Gift,
  Heart,
  Flower2,
  Award,
  CalendarPlus,
  TreePine,
} from '@/constants/icons';
import { OCCASION_TYPES } from '@/constants/occasionTypes';
import type { OccasionType } from '@/types/occasion';
import { Input } from '@/components/ui/Input';

interface OccasionTypePickerProps {
  value: OccasionType;
  customLabel?: string | null;
  onChange: (type: OccasionType, customLabel: string | null) => void;
}

const ICON_COMPONENTS: Record<
  string,
  React.ComponentType<{ size?: number; color?: string }>
> = {
  Cake,
  HeartHandshake,
  Gift,
  Heart,
  Flower2,
  Award,
  CalendarPlus,
  TreePine,
};

export function OccasionTypePicker({
  value,
  customLabel,
  onChange,
}: OccasionTypePickerProps) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginHorizontal: -spacing.xs,
        }}
      >
        {OCCASION_TYPES.map((option) => {
          const selected = value === option.id;
          const Icon = ICON_COMPONENTS[option.icon] ?? CalendarPlus;
          const bg = selected ? colors.primary[500] : colors.bg.surface;
          const fg = selected ? colors.text.inverse : colors.text.primary;

          return (
            <View
              key={option.id}
              style={{ width: '25%', padding: spacing.xs }}
            >
              <Pressable
                onPress={() =>
                  onChange(
                    option.id,
                    option.id === 'custom' ? customLabel ?? '' : null,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={`Select ${option.label}`}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.xs,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.sm,
                  backgroundColor: bg,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: selected
                    ? colors.primary[500]
                    : colors.border.light,
                }}
              >
                <Icon size={22} color={fg} />
                <Text
                  style={[
                    typography.captionMedium,
                    { color: fg, textAlign: 'center' },
                  ]}
                  numberOfLines={1}
                >
                  {option.label}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      {value === 'custom' && (
        <View style={{ marginTop: spacing.md }}>
          <Input
            label="Custom occasion name"
            value={customLabel ?? ''}
            onChangeText={(text) => onChange('custom', text)}
            maxLength={40}
            placeholder="e.g. Graduation"
          />
        </View>
      )}
    </View>
  );
}
