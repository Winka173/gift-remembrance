import React, { useMemo, useState, useCallback } from 'react';
import { SectionList, View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { format, parseISO } from 'date-fns';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import type { Gift } from '@/types/gift';
import { Input } from '@/components/ui/Input';
import { GiftCard } from './GiftCard';

interface GiftTimelineProps {
  gifts: Gift[];
  currentPersonId?: string;
  onDeleteGift?: (id: string) => void;
  ListHeaderComponent?: React.ReactElement | null;
  searchable?: boolean;
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
  searchable = false,
}: GiftTimelineProps) {
  const { colors, spacing } = useTheme();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [query, setQuery] = useState<string>('');

  const filteredGifts = useMemo(() => {
    if (!searchable) return gifts;
    const q = query.trim().toLowerCase();
    if (q.length === 0) return gifts;
    return gifts.filter((g) => g.name.toLowerCase().includes(q));
  }, [gifts, query, searchable]);

  const sortedGifts = useMemo(() => {
    return [...filteredGifts].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [filteredGifts]);

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

  const searchHeader = searchable ? (
    <View style={{ paddingTop: spacing.sm }}>
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Search gifts"
        autoCapitalize="none"
      />
    </View>
  ) : null;

  const combinedHeader =
    searchHeader || ListHeaderComponent ? (
      <View>
        {ListHeaderComponent ?? null}
        {searchHeader}
      </View>
    ) : null;

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={combinedHeader}
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
      renderItem={({ item, index }) => (
        <Animated.View
          style={{ marginBottom: spacing.sm }}
          entering={FadeInDown.delay(Math.min(index, 10) * 50).springify().damping(18)}
        >
          <GiftCard
            gift={item}
            currentPersonId={currentPersonId}
            onDelete={onDeleteGift ? () => onDeleteGift(item.id) : undefined}
          />
        </Animated.View>
      )}
    />
  );
}
