import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { X, Calendar as CalendarIcon } from '@/constants/icons';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { MonthView } from '@/components/calendar/MonthView';
import { OccasionCard } from '@/components/occasions/OccasionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { BannerAdSlot } from '@/components/ads/BannerAdSlot';
import { useAppSelector } from '@/store/hooks';
import { nextOccurrence } from '@/utils/dateUtils';

export default function CalendarScreen() {
  const { colors, spacing, radius, shadow } = useTheme();

  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth());
  const [showPast, setShowPast] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const allOccasions = useAppSelector((s) =>
    s.occasions.allIds.map((id) => s.occasions.byId[id]),
  );

  const displayedOccasions = useMemo(() => {
    if (showPast) return allOccasions;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return allOccasions.filter((o) => nextOccurrence(o, now) >= now);
  }, [allOccasions, showPast]);

  const dayOccasions = useMemo(() => {
    if (!selectedDay) return [];
    const parts = selectedDay.split('-');
    if (parts.length < 3) return [];
    const key = `${parts[1]}-${parts[2]}`;
    return allOccasions.filter((o) => {
      const p = o.date.split('-');
      if (p.length < 3) return false;
      return `${p[1]}-${p[2]}` === key;
    });
  }, [allOccasions, selectedDay]);

  const selectedLabel = useMemo(() => {
    if (!selectedDay) return '';
    const [y, m, d] = selectedDay.split('-').map((s) => parseInt(s, 10));
    const date = new Date(y, (m ?? 1) - 1, d ?? 1);
    return date.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDay]);

  const handleMonthChange = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg.screen }}
      edges={['top']}
    >
      <ScreenHeader title="Calendar" />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: spacing['3xl'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
          }}
        >
          <Text
            style={[typography.captionMedium, { color: colors.text.secondary }]}
          >
            Show past occasions
          </Text>
          <Switch
            value={showPast}
            onValueChange={setShowPast}
            trackColor={{
              false: colors.border.medium,
              true: colors.primary[500],
            }}
            thumbColor={colors.bg.card}
            accessibilityLabel="Show past occasions"
          />
        </View>

        <View
          style={{
            marginHorizontal: spacing.lg,
            marginTop: spacing.sm,
            paddingVertical: spacing.md,
            backgroundColor: colors.bg.card,
            borderRadius: radius.lg,
            ...shadow.card,
          }}
        >
          <MonthView
            year={year}
            month={month}
            occasions={displayedOccasions}
            onMonthChange={handleMonthChange}
            onDayPress={(iso) => setSelectedDay(iso)}
          />
        </View>
      </ScrollView>

      <BannerAdSlot />

      <Modal
        visible={selectedDay != null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDay(null)}
      >
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.bg.overlay },
          ]}
          onPress={() => setSelectedDay(null)}
        />
        <View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              maxHeight: '75%',
              backgroundColor: colors.bg.modal,
              borderTopLeftRadius: radius['2xl'],
              borderTopRightRadius: radius['2xl'],
              paddingHorizontal: spacing.xl,
              paddingTop: spacing.lg,
              paddingBottom: spacing['3xl'],
            },
            shadow.modal,
          ]}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: radius.full,
              backgroundColor: colors.border.medium,
              marginBottom: spacing.lg,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing.lg,
            }}
          >
            <Text style={[typography.h2, { color: colors.text.primary }]}>
              {selectedLabel}
            </Text>
            <Pressable
              onPress={() => setSelectedDay(null)}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
            >
              <X size={22} color={colors.text.primary} />
            </Pressable>
          </View>

          {dayOccasions.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title="No occasions"
              subtitle="Nothing scheduled for this day."
            />
          ) : (
            <ScrollView
              contentContainerStyle={{
                gap: spacing.sm,
                paddingBottom: spacing.lg,
              }}
              showsVerticalScrollIndicator={false}
            >
              {dayOccasions.map((o) => (
                <OccasionCard key={o.id} occasion={o} />
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
