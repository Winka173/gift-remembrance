import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';

const FILTER_OPTIONS = ['All', 'Upcoming', 'Recent', 'Birthdays'];

export default function HomeScreen() {
  const { colors, spacing } = useTheme();
  const [selected, setSelected] = useState('All');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.screen }}>
      <ScreenHeader wordmark />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            typography.h1,
            { color: colors.text.primary, marginBottom: spacing.sm },
          ]}
        >
          Your people
        </Text>
        <Text
          style={[
            typography.body,
            { color: colors.text.secondary, marginBottom: spacing.xl },
          ]}
        >
          Track gifts and occasions for everyone you care about.
        </Text>

        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            flexWrap: 'wrap',
            marginBottom: spacing.xl,
          }}
        >
          {FILTER_OPTIONS.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={selected === option}
              onPress={() => setSelected(option)}
            />
          ))}
        </View>

        <Button
          label="Add person"
          onPress={() => {}}
          accessibilityLabel="Add new person"
          style={{ alignSelf: 'flex-start' }}
        />
      </ScrollView>
    </View>
  );
}
