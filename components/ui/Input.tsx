import React from 'react';
import {
  View,
  Text,
  TextInput,
  ViewStyle,
  KeyboardTypeOptions,
} from 'react-native';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
  multiline?: boolean;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoFocus?: boolean;
  style?: ViewStyle;
}

export function Input({
  label,
  value,
  onChangeText,
  error,
  maxLength,
  showCount = false,
  multiline = false,
  placeholder,
  keyboardType,
  autoCapitalize,
  autoFocus,
  style,
}: InputProps) {
  const { colors, spacing, radius } = useTheme();

  const containerStyle: ViewStyle = {
    marginBottom: spacing.md,
  };

  const inputStyle = {
    backgroundColor: colors.bg.input,
    borderRadius: radius.md,
    padding: 12,
    minHeight: multiline ? 96 : 48,
    textAlignVertical: multiline ? ('top' as const) : ('center' as const),
    borderWidth: 1,
    borderColor: error ? colors.semantic.error : 'transparent',
    color: colors.text.primary,
  };

  return (
    <View style={[containerStyle, style]}>
      {label != null && (
        <Text
          style={[
            typography.captionMedium,
            { color: colors.text.secondary, marginBottom: spacing.xs },
          ]}
        >
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.placeholder}
        maxLength={maxLength}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoFocus={autoFocus}
        style={[typography.body, inputStyle]}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: spacing.xs,
        }}
      >
        <Text
          style={[
            typography.caption,
            { color: colors.semantic.error, flex: 1 },
          ]}
        >
          {error ?? ''}
        </Text>
        {showCount && maxLength != null && (
          <Text style={[typography.caption, { color: colors.text.muted }]}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}
