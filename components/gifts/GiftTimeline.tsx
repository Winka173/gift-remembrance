import React, { useMemo, useState, useCallback } from 'react';
import { SectionList, View, Text } from 'react-native';
import { format, parseISO } from 'date-fns';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import type { Gift } from '@/types/gift';
import { GiftCard } from './GiftCard';

interface GiftTimelineProps {
  gifts: Gift[];
  currentPersonId?: string;
  onDeleteGift?: (id: string) => void;
  ListHeaderComponent?: React.ReactElement | null;
}

interface GiftSection {
  title: string;
  monthKey: string;
  data: Gift[];
}

const PAGE_SIZE = 20;

export function GiftTimeline({
  gifts,
  currentPersonId,
  onDeleteGift,
  ListHeaderComponent,
}: GiftTimelineProps) {
  const { colors, spacing } = useTheme();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sortedGifts = useMemo(() => {
    return [...gifts].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [gifts]);

  const sections = useMemo<GiftSection[]>(() => {
    const slice = sortedGifts.slice(0, visibleCount);
    const groups = new Map<string, Gift[]>();

    for (const gift of slice) {
      let monthKey: string;
      try {
        monthKey = format(parseISO(gift.date), 'yyyy-MM');
      } catch {
        monthKey = gift.date.slice(0, 7);
      }
      const existing = groups.get(monthKey);
      if (existing) {
        existing.push(gift);
      } else {
        groups.set(monthKey, [gift]);
      }
    }

    const result: GiftSection[] = [];
    const keys = Array.from(groups.keys()).sort((a, b) => (a < b ? 1 : -1));
    for (const monthKey of keys) {
      let title: string;
      try {
        title = format(parseISO(`${monthKey}-01`), 'MMMM yyyy');
      } catch {
        title = monthKey;
      }
      result.push({
        title,
        monthKey,
        data: groups.get(monthKey) ?? [],
      });
    }
    return result;
  }, [sortedGifts, visibleCount]);

  const handleEndReached = useCallback(() => {
    if (visibleCount < sortedGifts.length) {
      setVisibleCount((c) => c + PAGE_SIZE);
    }
  }, [visibleCount, sortedGifts.length]);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={ListHeaderComponent ?? null}
      stickySectionHeadersEnabled={false}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      contentContainerStyle={{
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing['3xl'],
        gap: spacing.sm,
      }}
      renderSectionHeader={({ section }) => (
        <View
          style={{
            paddingTop: spacing.lg,
            paddingBottom: spacing.sm,
            backgroundColor: colors.bg.screen,
          }}
        >
          <Text
            style={[typography.sectionLabel, { color: colors.text.muted }]}
          >
            {section.title}
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={{ marginBottom: spacing.sm }}>
          <GiftCard
            gift={item}
            currentPersonId={currentPersonId}
            onDelete={onDeleteGift ? () => onDeleteGift(item.id) : undefined}
          />
        </View>
      )}
    />
  );
}
