import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { ChevronLeft, Pencil, Trash2 } from '@/constants/icons';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { PersonAvatar } from '@/components/people/PersonAvatar';
import { BudgetRing } from '@/components/people/BudgetRing';
import { OccasionList } from '@/components/people/OccasionList';
import { GiftTimeline } from '@/components/gifts/GiftTimeline';
import { BannerAdSlot } from '@/components/ads/BannerAdSlot';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useOccasions } from '@/hooks/useOccasions';
import { deletePersonThunk } from '@/store/thunks/deletePersonThunk';
import { deleteGift } from '@/store/slices/giftsSlice';
import { computeYearSpend, formatCurrency } from '@/utils/budgetUtils';
import type { Gift } from '@/types/gift';
import type { Occasion } from '@/types/occasion';

type GiftTab = 'all' | 'given' | 'received';

const TAB_OPTIONS: { key: GiftTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'given', label: 'Given' },
  { key: 'received', label: 'Received' },
];

export default function PersonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const person = useAppSelector((s) => s.people.byId[id]);
  const peopleById = useAppSelector((s) => s.people.byId);
  const giftsById = useAppSelector((s) => s.gifts.byId);
  const giftAllIds = useAppSelector((s) => s.gifts.allIds);
  const currency = useAppSelector((s) => s.settings.currency);

  const { occasions } = useOccasions(id);

  const [tab, setTab] = useState<GiftTab>('all');
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  const allGifts = useMemo<Gift[]>(() => {
    return giftAllIds
      .map((gid) => giftsById[gid])
      .filter((g): g is Gift => g != null);
  }, [giftAllIds, giftsById]);

  const personGifts = useMemo(() => {
    if (!id) return [];
    return allGifts.filter((g) => g.personIds.includes(id));
  }, [allGifts, id]);

  const filteredGifts = useMemo(() => {
    if (tab === 'all') return personGifts;
    return personGifts.filter((g) => g.direction === tab);
  }, [personGifts, tab]);

  const currentYear = new Date().getFullYear();

  if (!person) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.bg.screen }}
        edges={['top']}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
          >
            <ChevronLeft size={26} color={colors.text.primary} />
          </Pressable>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.xl,
            gap: spacing.lg,
          }}
        >
          <Text style={[typography.h2, { color: colors.text.primary }]}>
            Person not found
          </Text>
          <Button
            label="Go back"
            onPress={() => router.back()}
            variant="secondary"
            accessibilityLabel="Go back"
          />
        </View>
      </SafeAreaView>
    );
  }

  const ytdSpend = computeYearSpend(id, allGifts, currentYear);
  const lastYearSpend = computeYearSpend(id, allGifts, currentYear - 1);
  const twoYearsAgoSpend = computeYearSpend(id, allGifts, currentYear - 2);

  const handleEdit = () => {
    router.push(`/add-person?id=${id}`);
  };

  const handleConfirmDelete = async () => {
    setConfirmDelete(false);
    await dispatch(deletePersonThunk(id));
    router.back();
  };

  const handleEditOccasion = (occasion: Occasion) => {
    router.push(`/add-occasion?id=${occasion.id}`);
  };

  const handleAddOccasion = () => {
    router.push(`/add-occasion?personId=${id}`);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg.screen }}
      edges={['top']}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          backgroundColor: colors.bg.screen,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
        >
          <ChevronLeft size={26} color={colors.text.primary} />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          <Pressable
            onPress={handleEdit}
            accessibilityRole="button"
            accessibilityLabel="Edit person"
            hitSlop={8}
          >
            <Pencil size={22} color={colors.text.primary} />
          </Pressable>
          <Pressable
            onPress={() => setConfirmDelete(true)}
            accessibilityRole="button"
            accessibilityLabel="Delete person"
            hitSlop={8}
          >
            <Trash2 size={22} color={colors.semantic.error} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing['3xl'] * 2,
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            alignItems: 'center',
            gap: spacing.md,
            paddingTop: spacing.md,
          }}
        >
          <PersonAvatar
            name={person.name}
            photoUri={person.avatarUri}
            size="xl"
          />
          <Text
            style={[
              typography.h1,
              { color: colors.text.primary, textAlign: 'center' },
            ]}
            numberOfLines={2}
          >
            {person.name}
          </Text>
          {person.relationship ? (
            <Chip label={person.relationship} onPress={() => {}} />
          ) : null}
        </View>

        <View
          style={{
            gap: spacing.md,
            padding: spacing.lg,
            backgroundColor: colors.bg.card,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border.light,
            alignItems: 'center',
          }}
        >
          <Text
            style={[
              typography.sectionLabel,
              { color: colors.text.muted, alignSelf: 'flex-start' },
            ]}
          >
            Budget
          </Text>
          <BudgetRing spent={ytdSpend} budget={person.annualBudget} />
          {person.annualBudget == null || person.annualBudget === 0 ? (
            <Text
              style={[typography.caption, { color: colors.text.muted }]}
            >
              No annual budget set
            </Text>
          ) : (
            <Text
              style={[typography.caption, { color: colors.text.muted }]}
            >
              Given in {currentYear} ({currency})
            </Text>
          )}
          {(lastYearSpend > 0 || twoYearsAgoSpend > 0) && (
            <View style={{ gap: spacing.xs, alignItems: 'center' }}>
              <Text
                style={[typography.captionMedium, { color: colors.text.muted }]}
              >
                Previous years
              </Text>
              {lastYearSpend > 0 && (
                <Text
                  style={[
                    typography.caption,
                    { color: colors.text.secondary },
                  ]}
                >
                  {currentYear - 1}: {formatCurrency(lastYearSpend, currency)}
                </Text>
              )}
              {twoYearsAgoSpend > 0 && (
                <Text
                  style={[
                    typography.caption,
                    { color: colors.text.secondary },
                  ]}
                >
                  {currentYear - 2}: {formatCurrency(twoYearsAgoSpend, currency)}
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={{ gap: spacing.md }}>
          <Text style={[typography.h3, { color: colors.text.primary }]}>
            Occasions
          </Text>
          <OccasionList
            occasions={occasions}
            peopleById={peopleById}
            currentPersonId={id}
            onEdit={handleEditOccasion}
            onAddOccasion={handleAddOccasion}
          />
        </View>

        <View style={{ gap: spacing.md }}>
          <Text style={[typography.h3, { color: colors.text.primary }]}>
            Gifts
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.sm,
              flexWrap: 'wrap',
            }}
          >
            {TAB_OPTIONS.map((option) => (
              <Chip
                key={option.key}
                label={option.label}
                selected={tab === option.key}
                onPress={() => setTab(option.key)}
              />
            ))}
          </View>
          {filteredGifts.length === 0 ? (
            <View
              style={{
                paddingVertical: spacing.xl,
                alignItems: 'center',
                backgroundColor: colors.bg.card,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.border.light,
              }}
            >
              <Text
                style={[typography.caption, { color: colors.text.muted }]}
              >
                No gifts yet
              </Text>
            </View>
          ) : (
            <View style={{ minHeight: 200 }}>
              <GiftTimeline
                gifts={filteredGifts}
                currentPersonId={id}
                onDeleteGift={(giftId) => dispatch(deleteGift(giftId))}
                searchable
              />
            </View>
          )}
        </View>
      </ScrollView>

      <BannerAdSlot />

      <ConfirmSheet
        visible={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`Delete ${person.name}?`}
        message="Their gifts and occasions will be removed (shared items will be kept for other people)."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </SafeAreaView>
  );
}
