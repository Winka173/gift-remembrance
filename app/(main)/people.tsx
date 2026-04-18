import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { Search, Users } from '@/constants/icons';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Input } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { PersonCard } from '@/components/people/PersonCard';
import { BannerAdSlot } from '@/components/ads/BannerAdSlot';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { usePeople } from '@/hooks/usePeople';
import { useGifts } from '@/hooks/useGifts';
import { deletePersonThunk } from '@/store/thunks/deletePersonThunk';
import { nextOccurrence, daysUntil } from '@/utils/dateUtils';
import { computeYearSpend } from '@/utils/budgetUtils';
import type { Person } from '@/types/person';
import type { Occasion } from '@/types/occasion';

type SortKey = 'name' | 'nextOccasion' | 'recent';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'nextOccasion', label: 'Next Occasion' },
  { key: 'recent', label: 'Recent Activity' },
];

export default function PeopleScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { people } = usePeople();
  const { gifts } = useGifts();
  const occasionsById = useAppSelector((s) => s.occasions.byId);
  const occasionsByPersonId = useAppSelector((s) => s.occasions.byPersonId);

  const [searchVisible, setSearchVisible] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [pendingDelete, setPendingDelete] = useState<Person | null>(null);

  const currentYear = new Date().getFullYear();

  const nextOccasionByPerson = useMemo(() => {
    const map: Record<string, Occasion | null> = {};
    for (const person of people) {
      const ids = occasionsByPersonId[person.id] ?? [];
      const entries = ids
        .map((id) => occasionsById[id])
        .filter((o): o is Occasion => o != null)
        .map((o) => ({ occasion: o, days: daysUntil(nextOccurrence(o)) }))
        .filter((entry) => entry.days >= 0)
        .sort((a, b) => a.days - b.days);
      map[person.id] = entries[0]?.occasion ?? null;
    }
    return map;
  }, [people, occasionsById, occasionsByPersonId]);

  const lastGiftDateByPerson = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (const person of people) {
      let latest: string | null = null;
      for (const gift of gifts) {
        if (!gift.personIds.includes(person.id)) continue;
        if (latest == null || gift.date > latest) {
          latest = gift.date;
        }
      }
      map[person.id] = latest;
    }
    return map;
  }, [people, gifts]);

  const visiblePeople = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? people.filter((p) => p.name.toLowerCase().includes(needle))
      : people;

    const sorted = [...filtered];
    if (sortKey === 'name') {
      sorted.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
      );
    } else if (sortKey === 'nextOccasion') {
      sorted.sort((a, b) => {
        const aOcc = nextOccasionByPerson[a.id];
        const bOcc = nextOccasionByPerson[b.id];
        const aDays = aOcc ? daysUntil(nextOccurrence(aOcc)) : Infinity;
        const bDays = bOcc ? daysUntil(nextOccurrence(bOcc)) : Infinity;
        return aDays - bDays;
      });
    } else {
      sorted.sort((a, b) => {
        const aDate = lastGiftDateByPerson[a.id];
        const bDate = lastGiftDateByPerson[b.id];
        if (aDate == null && bDate == null) return 0;
        if (aDate == null) return 1;
        if (bDate == null) return -1;
        return bDate.localeCompare(aDate);
      });
    }

    return sorted;
  }, [people, query, sortKey, nextOccasionByPerson, lastGiftDateByPerson]);

  const handleConfirmDelete = () => {
    if (pendingDelete != null) {
      dispatch(deletePersonThunk(pendingDelete.id));
    }
    setPendingDelete(null);
  };

  const searchButton = (
    <Pressable
      onPress={() => setSearchVisible((v) => !v)}
      accessibilityRole="button"
      accessibilityLabel={searchVisible ? 'Hide search' : 'Show search'}
      hitSlop={8}
    >
      <Search size={22} color={colors.text.primary} />
    </Pressable>
  );

  const isEmpty = people.length === 0;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg.screen }}
      edges={['top']}
    >
      <ScreenHeader title="People" right={searchButton} />

      {isEmpty ? (
        <View style={{ flex: 1 }}>
          <EmptyState
            icon={Users}
            title="No people yet."
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
          {searchVisible && (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <Input
                value={query}
                onChangeText={setQuery}
                placeholder="Search people…"
                autoCapitalize="none"
                autoFocus
              />
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              gap: spacing.sm,
              paddingHorizontal: spacing.lg,
              paddingBottom: spacing.md,
              flexWrap: 'wrap',
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <Chip
                key={option.key}
                label={option.label}
                selected={sortKey === option.key}
                onPress={() => setSortKey(option.key)}
              />
            ))}
          </View>

          <FlatList
            data={visiblePeople}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: spacing.lg,
              paddingBottom: spacing['3xl'],
              gap: spacing.sm,
            }}
            ListEmptyComponent={
              <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                <Text
                  style={[typography.body, { color: colors.text.muted }]}
                >
                  No matches.
                </Text>
              </View>
            }
            renderItem={({ item, index }) => {
              const totalGivenYTD = computeYearSpend(
                item.id,
                gifts,
                currentYear,
              );
              return (
                <Animated.View
                  entering={FadeInDown.delay(index * 40).springify().damping(18)}
                >
                  <PersonCard
                    person={item}
                    nextOccasion={nextOccasionByPerson[item.id]}
                    totalGivenYTD={totalGivenYTD}
                    annualBudget={item.annualBudget}
                    onDelete={() => setPendingDelete(item)}
                  />
                </Animated.View>
              );
            }}
          />

          <BannerAdSlot />
        </>
      )}

      <ConfirmSheet
        visible={pendingDelete != null}
        onClose={() => setPendingDelete(null)}
        title={
          pendingDelete != null
            ? `Delete ${pendingDelete.name}?`
            : 'Delete person?'
        }
        message="Their gifts and occasions will be removed (shared items will be kept for other people)."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </SafeAreaView>
  );
}
