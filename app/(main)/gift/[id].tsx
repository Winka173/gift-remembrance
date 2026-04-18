import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import {
  ChevronLeft,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
} from '@/constants/icons';
import { Button } from '@/components/ui/Button';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { PhotoZoomModal } from '@/components/ui/PhotoZoomModal';
import { BannerAdSlot } from '@/components/ads/BannerAdSlot';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { deleteGift } from '@/store/slices/giftsSlice';
import { formatCurrency } from '@/utils/budgetUtils';
import { formatDate } from '@/utils/dateUtils';
import { deleteFromAppDir } from '@/utils/photoUtils';

function titleCaseOccasion(type: string): string {
  return type
    .split('_')
    .map((part) =>
      part.length === 0 ? part : part[0].toUpperCase() + part.slice(1),
    )
    .join(' ');
}

export default function GiftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const gift = useAppSelector((s) => s.gifts.byId[id]);
  const peopleById = useAppSelector((s) => s.people.byId);
  const currency = useAppSelector((s) => s.settings.currency);

  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [zoom, setZoom] = useState<boolean>(false);

  const linkedPeople = useMemo(() => {
    if (!gift) return [];
    return gift.personIds
      .map((pid) => peopleById[pid])
      .filter((p): p is NonNullable<typeof p> => p != null)
      .map((p) => ({ id: p.id, name: p.name }));
  }, [gift, peopleById]);

  if (!gift) {
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
            Gift not found
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

  const isGiven = gift.direction === 'given';
  const DirectionIcon = isGiven ? ArrowUpRight : ArrowDownLeft;
  const directionColor = isGiven
    ? colors.direction.given
    : colors.direction.received;
  const directionBg = isGiven
    ? colors.direction.givenBg
    : colors.direction.receivedBg;
  const directionLabel = isGiven ? 'Given to' : 'Received from';

  const occasionLabel =
    gift.occasionType === 'custom' && gift.customOccasionLabel
      ? gift.customOccasionLabel
      : titleCaseOccasion(gift.occasionType);

  const dateLabel = formatDate(gift.date, 'MMM d, yyyy');

  const handleEdit = () => {
    router.push(`/add-gift?id=${id}`);
  };

  const handleConfirmDelete = async () => {
    setConfirmDelete(false);
    if (gift.photoUri) {
      await deleteFromAppDir(gift.photoUri).catch(() => {});
    }
    dispatch(deleteGift(id));
    router.back();
  };

  const renderPeople = () => {
    const count = linkedPeople.length;
    if (count === 0) {
      return (
        <Text style={[typography.body, { color: colors.text.muted }]}>
          No people linked
        </Text>
      );
    }

    const pressableName = (
      p: { id: string; name: string },
      key: string,
    ) => (
      <Text
        key={key}
        onPress={() => router.push(`/person/${p.id}`)}
        style={[typography.bodySemi, { color: colors.text.link }]}
      >
        {p.name}
      </Text>
    );

    if (count === 1) {
      return (
        <Text
          style={[typography.body, { color: colors.text.primary }]}
          numberOfLines={2}
        >
          {pressableName(linkedPeople[0], linkedPeople[0].id)}
        </Text>
      );
    }

    if (count === 2) {
      return (
        <Text
          style={[typography.body, { color: colors.text.primary }]}
          numberOfLines={2}
        >
          {pressableName(linkedPeople[0], linkedPeople[0].id)}
          {' & '}
          {pressableName(linkedPeople[1], linkedPeople[1].id)}
        </Text>
      );
    }

    if (count === 3) {
      return (
        <Text
          style={[typography.body, { color: colors.text.primary }]}
          numberOfLines={2}
        >
          {pressableName(linkedPeople[0], linkedPeople[0].id)}
          {', '}
          {pressableName(linkedPeople[1], linkedPeople[1].id)}
          {' & '}
          {pressableName(linkedPeople[2], linkedPeople[2].id)}
        </Text>
      );
    }

    const othersCount = count - 2;
    return (
      <Text
        style={[typography.body, { color: colors.text.primary }]}
        numberOfLines={2}
      >
        {pressableName(linkedPeople[0], linkedPeople[0].id)}
        {', '}
        {pressableName(linkedPeople[1], linkedPeople[1].id)}
        {`, and ${othersCount} others`}
      </Text>
    );
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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.lg,
          }}
        >
          <Pressable
            onPress={handleEdit}
            accessibilityRole="button"
            accessibilityLabel="Edit gift"
            hitSlop={8}
          >
            <Pencil size={22} color={colors.text.primary} />
          </Pressable>
          <Pressable
            onPress={() => setConfirmDelete(true)}
            accessibilityRole="button"
            accessibilityLabel="Delete gift"
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
        {gift.photoUri ? (
          <Pressable
            onPress={() => setZoom(true)}
            accessibilityRole="button"
            accessibilityLabel="View photo"
          >
            <Image
              source={{ uri: gift.photoUri }}
              style={{
                width: '100%',
                aspectRatio: 16 / 9,
                borderRadius: radius.lg,
                backgroundColor: colors.bg.surface,
              }}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          </Pressable>
        ) : null}

        <View style={{ gap: spacing.sm }}>
          <Text
            style={[typography.h1, { color: colors.text.primary }]}
            numberOfLines={3}
          >
            {gift.name}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              gap: spacing.xs,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: radius.full,
              backgroundColor: directionBg,
            }}
          >
            <DirectionIcon size={14} color={directionColor} />
            <Text
              style={[typography.captionMedium, { color: directionColor }]}
            >
              {isGiven ? 'Given' : 'Received'}
            </Text>
          </View>
        </View>

        <View
          style={{
            gap: spacing.md,
            padding: spacing.lg,
            backgroundColor: colors.bg.card,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border.light,
          }}
        >
          <View style={{ gap: spacing.xs }}>
            <Text
              style={[typography.sectionLabel, { color: colors.text.muted }]}
            >
              {directionLabel}
            </Text>
            {renderPeople()}
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            <Calendar size={16} color={colors.text.muted} />
            <Text
              style={[typography.body, { color: colors.text.secondary }]}
            >
              {occasionLabel} · {dateLabel}
            </Text>
          </View>

          {gift.price != null ? (
            <Text
              style={[
                typography.bodySemi,
                {
                  color: colors.text.primary,
                  fontVariant: ['tabular-nums'],
                },
              ]}
            >
              {formatCurrency(gift.price, currency)}
            </Text>
          ) : null}
        </View>

        {gift.notes ? (
          <View
            style={{
              gap: spacing.sm,
              padding: spacing.lg,
              backgroundColor: colors.bg.card,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border.light,
            }}
          >
            <Text
              style={[typography.sectionLabel, { color: colors.text.muted }]}
            >
              Notes
            </Text>
            <Text style={[typography.body, { color: colors.text.primary }]}>
              {gift.notes}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <BannerAdSlot />

      <ConfirmSheet
        visible={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this gift?"
        message="This removes it from all linked people's timelines."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleConfirmDelete}
      />

      {gift.photoUri ? (
        <PhotoZoomModal
          visible={zoom}
          uri={gift.photoUri}
          onClose={() => setZoom(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}
