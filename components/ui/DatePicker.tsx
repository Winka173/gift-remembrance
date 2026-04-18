import React, { useState } from 'react';
import { View, Text, Pressable, Platform, ViewStyle } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { parseISO, format } from 'date-fns';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';

interface DatePickerProps {
  value: string;
  onChange: (iso: string) => void;
  label?: string;
  minDate?: string;
  maxDate?: string;
  mode?: 'date' | 'time';
  style?: ViewStyle;
}

export function DatePicker({
  value,
  onChange,
  label,
  minDate,
  maxDate,
  mode = 'date',
  style,
}: DatePickerProps) {
  const { colors, spacing, radius } = useTheme();
  const [androidOpen, setAndroidOpen] = useState(false);

  const parsedDate = value ? parseISO(value) : new Date();
  const displayFormat = mode === 'time' ? 'HH:mm' : 'MMM d, yyyy';
  const displayValue = value ? format(parsedDate, displayFormat) : '';

  const minimumDate = minDate ? parseISO(minDate) : undefined;
  const maximumDate = maxDate ? parseISO(maxDate) : undefined;

  const handleChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setAndroidOpen(false);
    }
    if (date) {
      const iso =
        mode === 'time' ? format(date, 'HH:mm') : format(date, 'yyyy-MM-dd');
      onChange(iso);
    }
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

      {Platform.OS === 'ios' ? (
        <View
          style={{
            backgroundColor: colors.bg.input,
            borderRadius: radius.md,
            padding: spacing.sm,
          }}
        >
          <DateTimePicker
            value={parsedDate}
            mode={mode}
            display="spinner"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleChange}
          />
        </View>
      ) : (
        <>
          <Pressable
            onPress={() => setAndroidOpen(true)}
            style={{
              backgroundColor: colors.bg.input,
              borderRadius: radius.md,
              padding: 12,
              minHeight: 48,
              justifyContent: 'center',
            }}
          >
            <Text
              style={[
                typography.body,
                {
                  color: value ? colors.text.primary : colors.text.placeholder,
                },
              ]}
            >
              {displayValue ||
                (mode === 'time' ? 'Select time' : 'Select date')}
            </Text>
          </Pressable>
          {androidOpen && (
            <DateTimePicker
              value={parsedDate}
              mode={mode}
              display="default"
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onChange={handleChange}
            />
          )}
        </>
      )}
    </View>
  );
}
