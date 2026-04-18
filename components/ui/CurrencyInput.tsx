import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ViewStyle } from 'react-native';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useAppSelector } from '@/store/hooks';
import { CURRENCIES } from '@/constants/currencies';

interface CurrencyInputProps {
  value: number | null;
  onChange: (cents: number | null) => void;
  label?: string;
  placeholder?: string;
  style?: ViewStyle;
}

function centsToDisplay(cents: number | null): string {
  if (cents == null) return '';
  return (cents / 100).toFixed(2);
}

function displayToCents(display: string): number | null {
  const trimmed = display.trim();
  if (trimmed === '') return null;
  const normalized = trimmed.replace(',', '.');
  const parsed = parseFloat(normalized);
  if (Number.isNaN(parsed)) return null;
  return Math.round(parsed * 100);
}

export function CurrencyInput({
  value,
  onChange,
  label,
  placeholder,
  style,
}: CurrencyInputProps) {
  const { colors, spacing, radius } = useTheme();
  const currencyCode = useAppSelector((s) => s.settings.currency);
  const currency =
    CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0];

  const [display, setDisplay] = useState<string>(centsToDisplay(value));

  useEffect(() => {
    setDisplay(centsToDisplay(value));
  }, [value]);

  const handleChangeText = (text: string) => {
    const sanitized = text.replace(/[^0-9.,]/g, '');
    setDisplay(sanitized);
    const cents = displayToCents(sanitized);
    onChange(cents);
  };

  const handleBlur = () => {
    if (display.trim() === '') {
      onChange(null);
      setDisplay('');
      return;
    }
    const cents = displayToCents(display);
    if (cents == null) {
      setDisplay('');
      onChange(null);
      return;
    }
    setDisplay((cents / 100).toFixed(2));
    onChange(cents);
  };

  return (
    <View style={[{ marginBottom: spacing.md }, style]}>
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
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.bg.input,
          borderRadius: radius.md,
          paddingHorizontal: 12,
          minHeight: 48,
        }}
      >
        <Text
          style={[
            typography.bodySemi,
            { color: colors.text.secondary, marginRight: spacing.sm },
          ]}
        >
          {currency.symbol}
        </Text>
        <TextInput
          value={display}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          placeholder={placeholder ?? '0.00'}
          placeholderTextColor={colors.text.placeholder}
          keyboardType="decimal-pad"
          style={[
            typography.body,
            {
              flex: 1,
              color: colors.text.primary,
              fontVariant: ['tabular-nums'],
              paddingVertical: 12,
            },
          ]}
        />
      </View>
    </View>
  );
}
