import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { X, AlertTriangle } from '@/constants/icons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { GiftDirectionToggle } from '@/components/gifts/GiftDirectionToggle';
import { GiftPhotoPicker } from '@/components/gifts/GiftPhotoPicker';
import { MultiPersonPicker } from '@/components/people/MultiPersonPicker';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { saveGiftThunk } from '@/store/thunks/saveGiftThunk';
import { nextOccurrence } from '@/utils/dateUtils';
import { useAds } from '@/hooks/useAds';
import { useInterstitial } from '@/components/ads/InterstitialManager';
import type { GiftDirection, OccasionLinkType } from '@/types/gift';

export default function AddGiftScreen() {
  const { id, personId } = useLocalSearchParams<{
    id?: string;
    personId?: string;
  }>();
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { shouldShowInterstitial, recordEvent, markShown } = useAds();
  const interstitial = useInterstitial();

  const editingGift = useAppSelector((s) =>
    id ? s.gifts.byId[id] ?? null : null,
  );
  const peopleById = useAppSelector((s) => s.people.byId);
  const giftsState = useAppSelector((s) => s.gifts);
  const occasionsById = useAppSelector((s) => s.occasions.byId);
  const occasionAllIds = useAppSelector((s) => s.occasions.allIds);

  const isEditing = editingGift != null;

  const [direction, setDirection] = useState<GiftDirection>(
    editingGift?.direction ?? 'given',
  );
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>(
    editingGift?.personIds ?? (personId ? [personId] : []),
  );
  const [name, setName] = useState<string>(editingGift?.name ?? '');
  const [date, setDate] = useState<string>(
    editingGift?.date ?? format(new Date(), 'yyyy-MM-dd'),
  );
  const [occasionType, setOccasionType] = useState<OccasionLinkType>(
    editingGift?.occasionType ?? 'just_because',
  );
  const [customOccasionLabel, setCustomOccasionLabel] = useState<string | null>(
    editingGift?.customOccasionLabel ?? null,
  );
  const [price, setPrice] = useState<number | null>(
    editingGift?.price ?? null,
  );
  const [photoUri, setPhotoUri] = useState<string | null>(
    editingGift?.photoUri ?? null,
  );
  const [notes, setNotes] = useState<string>(editingGift?.notes ?? '');

  const [pickerOpen, setPickerOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>();
  const [peopleError, setPeopleError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const markDirty = () => {
    if (!dirty) setDirty(true);
  };

  const suggestedType = useMemo<OccasionLinkType | null>(() => {
    if (selectedPersonIds.length === 0) return null;
    const target = parseISO(date);
    const relevant = occasionAllIds
      .map((oid) => occasionsById[oid])
      .filter(
        (o) =>
          o != null &&
          o.personIds.some((pid) => selectedPersonIds.includes(pid)),
      );
    for (const o of relevant) {
      if (o == null) continue;
      const next = nextOccurrence(o, target);
      const diff = Math.abs(differenceInCalendarDays(next, target));
      if (diff <= 14) {
        return o.type as OccasionLinkType;
      }
    }
    return null;
  }, [selectedPersonIds, date, occasionsById, occasionAllIds]);

  React.useEffect(() => {
    if (
      suggestedType != null &&
      occasionType === 'just_because' &&
      !isEditing
    ) {
      setOccasionType(suggestedType);
    }
  }, [suggestedType, occasionType, isEditing]);

  const duplicate = useMemo(() => {
    if (!name.trim() || selectedPersonIds.length === 0) return null;
    const target = parseISO(date);
    const lowerName = name.trim().toLowerCase();
    for (const gid of giftsState.allIds) {
      if (id && gid === id) continue;
      const g = giftsState.byId[gid];
      if (!g) continue;
      const intersect = g.personIds.filter((pid) =>
        selectedPersonIds.includes(pid),
      );
      if (intersect.length === 0) continue;
      if (g.name.trim().toLowerCase() !== lowerName) continue;
      const diff = Math.abs(differenceInCalendarDays(parseISO(g.date), target));
      if (diff <= 730) {
        return { gift: g, overlappingIds: intersect };
      }
    }
    return null;
  }, [name, selectedPersonIds, date, giftsState, id]);

  const overlappingPeopleNames = useMemo(() => {
    if (!duplicate) return '';
    return duplicate.overlappingIds
      .map((pid) => peopleById[pid]?.name ?? 'Someone')
      .join(', ');
  }, [duplicate, peopleById]);

  const handleClose = () => {
    if (dirty) {
      setDiscardOpen(true);
      return;
    }
    router.back();
  };

  const confirmDiscard = () => {
    setDiscardOpen(false);
    router.back();
  };

  const handleSave = async () => {
    let ok = true;
    if (selectedPersonIds.length === 0) {
      setPeopleError('Select at least one person');
      ok = false;
    } else {
      setPeopleError(undefined);
    }
    if (!name.trim()) {
      setNameError('Gift name is required');
      ok = false;
    } else {
      setNameError(undefined);
    }
    if (!date) ok = false;
    if (!ok) return;

    try {
      setSaving(true);
      await dispatch(
        saveGiftThunk({
          id: isEditing ? id : undefined,
          personIds: selectedPersonIds,
          name: name.trim(),
          direction,
          date,
          occasionType,
          customOccasionLabel:
            occasionType === 'custom' ? customOccasionLabel : null,
          price,
          photoUri,
          notes: notes.trim() ? notes.trim() : null,
        }),
      ).unwrap();
      recordEvent();
      if (shouldShowInterstitial()) {
        markShown();
        await interstitial.show().catch(() => {});
      }
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const OCCASION_CHIP_OPTIONS: { id: OccasionLinkType; label: string }[] = [
    { id: 'just_because', label: 'Just because' },
    { id: 'birthday', label: 'Birthday' },
    { id: 'anniversary', label: 'Anniversary' },
    { id: 'christmas', label: 'Christmas' },
    { id: 'valentines', label: "Valentine's" },
    { id: 'mothers_day', label: "Mother's Day" },
    { id: 'fathers_day', label: "Father's Day" },
    { id: 'custom', label: 'Custom' },
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg.screen }}
      edges={['top', 'bottom']}
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
        <Pressable
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
        >
          <X size={22} color={colors.text.primary} />
        </Pressable>
        <Text style={[typography.h2, { color: colors.text.primary }]}>
          {isEditing ? 'Edit Gift' : 'Add Gift'}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing['3xl'] * 2,
          gap: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <GiftDirectionToggle
          value={direction}
          onChange={(v) => {
            setDirection(v);
            markDirty();
          }}
        />

        <View style={{ gap: spacing.sm }}>
          <Text
            style={[typography.captionMedium, { color: colors.text.secondary }]}
          >
            {direction === 'given' ? 'Recipient(s)' : 'From'}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing.xs,
            }}
          >
            {selectedPersonIds.map((pid) => {
              const person = peopleById[pid];
              if (!person) return null;
              return (
                <View
                  key={pid}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    borderRadius: radius.full,
                    backgroundColor: colors.primary[50],
                    borderWidth: 1,
                    borderColor: colors.primary[100],
                  }}
                >
                  <Text
                    style={[
                      typography.captionMedium,
                      { color: colors.primary[600] },
                    ]}
                  >
                    {person.name}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setSelectedPersonIds((prev) =>
                        prev.filter((x) => x !== pid),
                      );
                      markDirty();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${person.name}`}
                    hitSlop={6}
                  >
                    <X size={14} color={colors.primary[600]} />
                  </Pressable>
                </View>
              );
            })}
          </View>
          <Button
            label="Select people"
            variant="secondary"
            onPress={() => setPickerOpen(true)}
            accessibilityLabel="Select people"
          />
          {peopleError != null && (
            <Text
              style={[typography.caption, { color: colors.semantic.error }]}
            >
              {peopleError}
            </Text>
          )}
        </View>

        <Input
          label="Gift name"
          value={name}
          onChangeText={(v) => {
            setName(v);
            markDirty();
          }}
          maxLength={100}
          showCount
          placeholder="What did you give?"
          error={nameError}
        />

        <DatePicker
          label="Date"
          value={date}
          onChange={(v) => {
            setDate(v);
            markDirty();
          }}
        />

        <View style={{ gap: spacing.sm }}>
          <Text
            style={[typography.captionMedium, { color: colors.text.secondary }]}
          >
            Occasion
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing.xs,
            }}
          >
            {OCCASION_CHIP_OPTIONS.map((opt) => {
              const selected = occasionType === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    setOccasionType(opt.id);
                    if (opt.id !== 'custom') {
                      setCustomOccasionLabel(null);
                    } else if (customOccasionLabel == null) {
                      setCustomOccasionLabel('');
                    }
                    markDirty();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${opt.label}`}
                  accessibilityState={{ selected }}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    borderRadius: radius.full,
                    backgroundColor: selected
                      ? colors.primary[500]
                      : colors.bg.surface,
                    borderWidth: 1,
                    borderColor: selected
                      ? colors.primary[500]
                      : colors.border.light,
                  }}
                >
                  <Text
                    style={[
                      typography.captionMedium,
                      {
                        color: selected
                          ? colors.text.inverse
                          : colors.text.secondary,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {occasionType === 'custom' && (
            <Input
              value={customOccasionLabel ?? ''}
              onChangeText={(v) => {
                setCustomOccasionLabel(v);
                markDirty();
              }}
              maxLength={40}
              placeholder="e.g. Graduation"
            />
          )}
        </View>

        {duplicate != null && (
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.sm,
              padding: spacing.md,
              borderRadius: radius.md,
              backgroundColor: colors.semantic.warningBg,
              borderWidth: 1,
              borderColor: colors.semantic.warning,
            }}
          >
            <AlertTriangle size={18} color={colors.semantic.warning} />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  typography.captionMedium,
                  { color: colors.text.primary },
                ]}
              >
                Possible duplicate
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.text.secondary, marginTop: spacing.xs },
                ]}
              >
                You {duplicate.gift.direction === 'given' ? 'gave' : 'received'}{' '}
                {overlappingPeopleNames} '{duplicate.gift.name}' on{' '}
                {format(parseISO(duplicate.gift.date), 'MMM d, yyyy')}. Save
                anyway?
              </Text>
            </View>
          </View>
        )}

        <CurrencyInput
          label="Price (optional)"
          value={price}
          onChange={(v) => {
            setPrice(v);
            markDirty();
          }}
        />

        <View style={{ gap: spacing.sm }}>
          <Text
            style={[typography.captionMedium, { color: colors.text.secondary }]}
          >
            Photo
          </Text>
          <GiftPhotoPicker
            photoUri={photoUri}
            onChange={(uri) => {
              setPhotoUri(uri);
              markDirty();
            }}
          />
        </View>

        <Input
          label="Notes (optional)"
          value={notes}
          onChangeText={(v) => {
            setNotes(v);
            markDirty();
          }}
          multiline
          maxLength={500}
          showCount
          placeholder="Anything to remember?"
        />

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Button
            label="Cancel"
            variant="secondary"
            onPress={handleClose}
            accessibilityLabel="Cancel"
            style={{ flex: 1 }}
          />
          <Button
            label={saving ? 'Saving…' : 'Save'}
            onPress={handleSave}
            disabled={saving}
            accessibilityLabel="Save gift"
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>

      <MultiPersonPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={(ids) => {
          setSelectedPersonIds(ids);
          markDirty();
        }}
        mode="single"
        allowMulti
        initialSelection={selectedPersonIds}
      />

      <ConfirmSheet
        visible={discardOpen}
        onClose={() => setDiscardOpen(false)}
        title="Discard changes?"
        message="Your edits will not be saved."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        destructive
        onConfirm={confirmDiscard}
      />
    </SafeAreaView>
  );
}
