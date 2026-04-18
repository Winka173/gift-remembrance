import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/hooks/useSettings';

interface Slide {
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    title: 'Welcome to Gift Remembrance',
    subtitle: 'Never forget a birthday, anniversary, or gift again.',
  },
  {
    title: '100% private',
    subtitle:
      'Your data lives on your device. No accounts, no servers, no tracking.',
  },
  {
    title: "Let's start",
    subtitle: 'Add your first person to get going.',
  },
];

export default function OnboardingScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { updateSettings } = useSettings();
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;
  const isFirst = index === 0;
  const slide = SLIDES[index];

  const handleNext = () => {
    if (isLast) {
      updateSettings({ hasSeenOnboarding: true });
      router.replace('/');
      return;
    }
    setIndex((i) => i + 1);
  };

  const handleBack = () => {
    if (isFirst) return;
    setIndex((i) => i - 1);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg.screen }}
      edges={['top', 'bottom']}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.xl,
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: spacing.xs,
            paddingTop: spacing.lg,
          }}
          accessibilityRole="progressbar"
          accessibilityLabel={`Step ${index + 1} of ${SLIDES.length}`}
        >
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  i === index ? colors.primary[500] : colors.border.medium,
              }}
            />
          ))}
        </View>

        <View
          style={{
            alignItems: 'center',
            gap: spacing.lg,
            paddingHorizontal: spacing.md,
          }}
        >
          <Text
            style={[
              typography.h1,
              { color: colors.text.primary, textAlign: 'center' },
            ]}
          >
            {slide.title}
          </Text>
          <Text
            style={[
              typography.body,
              { color: colors.text.secondary, textAlign: 'center' },
            ]}
          >
            {slide.subtitle}
          </Text>
        </View>

        <View style={{ gap: spacing.md }}>
          <Button
            label={isLast ? 'Get Started' : 'Next'}
            onPress={handleNext}
            accessibilityLabel={isLast ? 'Get started' : 'Next slide'}
          />
          {!isFirst && (
            <Pressable
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Previous slide"
              hitSlop={8}
              style={{
                alignSelf: 'center',
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
              }}
            >
              <Text
                style={[typography.bodyMedium, { color: colors.text.muted }]}
              >
                Back
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
