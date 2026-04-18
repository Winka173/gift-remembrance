import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { Settings, Gift } from '@/constants/icons';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { FABMenu } from '@/components/ui/FABMenu';
import { OccasionCard } from '@/components/occasions/OccasionCard';
import { GiftCard } from '@/components/gifts/GiftCard';
import { BannerAdSlot } from '@/components/ads/BannerAdSlot';
import { usePeople } from '@/hooks/usePeople';
import { useGifts } from '@/hooks/useGifts';
import { useOccasions } from '@/hooks/useOccasions';
import { nextOccurrence, daysUntil } from '@/utils/dateUtils';

export default function HomeScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { people } = usePeople();
  const { gifts } = useGifts();
  const { occasions } = useOccasions();

  const upcomingOccasions = useMemo(() => {
    return occasions
      .map((o) => ({ occasion: o, days: daysUntil(nextOccurrence(o)) }))
      .filter((entry) => entry.days >= 0)
      .sort((a, b) => a.days - b.days)
      .slice(0, 5)
      .map((entry) => entry.occasion);
  }, [occasions]);

  const recentGifts = useMemo(() => {
    return [...gifts]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);
  }, [gifts]);

  const settingsButton = (
    <Pressable
      onPress={() => router.push('/settings')}
      accessibilityRole="button"
      accessibilityLabel="Open settings"
      hitSlop={8}
    >
      <Settings size={22} color={colors.text.primary} />
    </Pressable>
  );

  const isEmpty = people.length === 0;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg.screen }}
      edges={['top']}
    >
      <ScreenHeader wordmark right={settingsButton} />

      {isEmpty ? (
        <View style={{ flex: 1 }}>
          <EmptyState
            icon={Gift}
            title="Start remembering gifts"
            subtitle="Add someone to get started"
            actionLabel="Add Person"
            onAction={() => router.push('/add-person')}
          />
          <View
            style={{
              paddingHorizontal: spacing.xl,
              paddingBottom: spacing.xl,
              alignItems: 'center',
            }}
          >
            <Button
              label="Import Contacts"
              onPress={() => router.push('/contacts-import')}
              variant="secondary"
              accessibilityLabel="Import contacts"
            />
          </View>
          <BannerAdSlot />
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: spacing.lg,
              paddingBottom: spacing['3xl'] * 3,
              gap: spacing.xl,
            }}
            showsVerticalScrollIndicator={false}
          >
            {upcomingOccasions.length > 0 && (
              <View style={{ gap: spacing.md }}>
                <Text
                  style={[typography.h3, { color: colors.text.primary }]}
                >
                  Upcoming
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.lg }}
                >
                  {upcomingOccasions.map((o) => (
                    <View key={o.id} style={{ width: 280 }}>
                      <OccasionCard occasion={o} />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {recentGifts.length > 0 && (
              <View style={{ gap: spacing.md }}>
                <Text
                  style={[typography.h3, { color: colors.text.primary }]}
                >
                  Recent
                </Text>
                <View style={{ gap: spacing.sm }}>
                  {recentGifts.map((g) => (
                    <GiftCard key={g.id} gift={g} />
                  ))}
                </View>
              </View>
            )}

            <BannerAdSlot />
          </ScrollView>

          <FABMenu
            onAddGift={() => router.push('/add-gift')}
            onAddPerson={() => router.push('/add-person')}
            onAddOccasion={() => router.push('/add-occasion')}
          />
        </>
      )}
    </SafeAreaView>
  );
}
