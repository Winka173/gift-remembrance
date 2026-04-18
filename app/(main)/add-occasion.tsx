import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { X } from '@/constants/icons';
import { Button } from '@/components/ui/Button';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { DatePicker } from '@/components/ui/DatePicker';
import { OccasionTypePicker } from '@/components/occasions/OccasionTypePicker';
import { MultiPersonPicker } from '@/components/people/MultiPersonPicker';
import { OCCASION_TYPES } from '@/constants/occasionTypes';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { saveOccasionThunk } from '@/store/thunks/saveOccasionThunk';
import type { OccasionType } from '@/types/occasion';

export default function AddOccasionScreen() {
  const { personId, id } = useLocalSearchParams<{
    personId?: string;
    id?: string;
  }>();
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const editingOccasion = useAppSelector((s) =>
    id ? s.occasions.byId[id] ?? null : null,
  );
  const peopleById = useAppSelector((s) => s.people.byId);
  const occasionAllIds = useAppSelector((s) => s.occasions.allIds);
  const occasionsById = useAppSelector((s) => s.occasions.byId);

  const isEditing = editingOccasion != null;

  const [type, setType] = useState<OccasionType>(
    editingOccasion?.type ?? 'birthday',
  );
  const [customLabel, setCustomLabel] = useState<string | null>(
    editingOccasion?.customLabel ?? null,
  );
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>(
    editingOccasion?.personIds ?? (personId ? [personId] : []),
  );
  const [date, setDate] = useState<string>(
    editingOccasion?.date ?? format(new Date(), 'yyyy-MM-dd'),
  );

  const defaultRecurring = useMemo(() => {
    return (
      OCCASION_TYPES.find((t) => t.id === type)?.defaultRecurring ?? false
    );
  }, [type]);

  const [recurring, setRecurring] = useState<boolean>(
    editingOccasion?.recurring ?? defaultRecurring,
  );

  const [pickerOpen, setPickerOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [peopleError, setPeopleError] = useState<string | undefined>();

  const markDirty = () => {
    if (!dirty) setDirty(true);
  };

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

  const handleTypeChange = (nextType: OccasionType, label: string | null) => {
    setType(nextType);
    setCustomLabel(label);
    const nextDefault =
      OCCASION_TYPES.find((t) => t.id === nextType)?.defaultRecurring ?? false;
    setRecurring(nextDefault);
    if (nextType === 'birthday' && selectedPersonIds.length > 1) {
      setSelectedPersonIds(selectedPersonIds.slice(0, 1));
    }
    markDirty();
  };

  const handlePickerConfirm = (ids: string[]) => {
    if (type === 'birthday') {
      const conflictId = ids.find((pid) => {
        return occasionAllIds.some((oid) => {
          const o = occasionsById[oid];
          if (!o || o.type !== 'birthday') return false;
          if (isEditing && o.id === id) return false;
          return o.personIds.includes(pid);
        });
      });
      if (conflictId != null) {
        const who = peopleById[conflictId]?.name ?? 'This person';
        Alert.alert(
          'Birthday already exists',
          `${who} already has a birthday occasion.`,
        );
        return;
      }
    }
    setSelectedPersonIds(ids);
    markDirty();
  };

  const handleSave = async () => {
    if (selectedPersonIds.length === 0) {
      setPeopleError('Select at least one person');
      return;
    }
    setPeopleError(undefined);

    try {
      setSaving(true);
      await dispatch(
        saveOccasionThunk({
          id: isEditing ? id : undefined,
          type,
          customLabel: type === 'custom' ? customLabel : null,
          personIds: selectedPersonIds,
          date,
          recurring,
        }),
      ).unwrap();
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const pickerMode: 'single' | 'multi' =
    type === 'birthday' ? 'single' : 'multi';
  const pickerAllowMulti = type !== 'birthday';

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
          {isEditing ? 'Edit Occasion' : 'Add Occasion'}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing['3xl'] * 2,
          gap: spacing.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: spacing.sm }}>
          <Text
            style={[typography.sectionLabel, { color: colors.text.muted }]}
          >
            Step 1 — Type
          </Text>
          <OccasionTypePicker
            value={type}
            customLabel={customLabel}
            onChange={handleTypeChange}
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text
            style={[typography.sectionLabel, { color: colors.text.muted }]}
          >
            Step 2 — People
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

        <View style={{ gap: spacing.sm }}>
          <Text
            style={[typography.sectionLabel, { color: colors.text.muted }]}
          >
            Step 3 — Date
          </Text>
          <DatePicker
            value={date}
            onChange={(v) => {
              setDate(v);
              markDirty();
            }}
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text
            style={[typography.sectionLabel, { color: colors.text.muted }]}
          >
            Step 4 — Recurring
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              backgroundColor: colors.bg.surface,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border.light,
            }}
          >
            <View style={{ flex: 1, paddingRight: spacing.md }}>
              <Text
                style={[typography.bodyMedium, { color: colors.text.primary }]}
              >
                Repeats every year
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.text.muted, marginTop: spacing.xs },
                ]}
              >
                A reminder will be scheduled annually.
              </Text>
            </View>
            <Switch
              value={recurring}
              onValueChange={(v) => {
                setRecurring(v);
                markDirty();
              }}
              accessibilityLabel="Toggle recurring"
            />
          </View>
        </View>

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
            accessibilityLabel="Save occasion"
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>

      <MultiPersonPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={handlePickerConfirm}
        mode={pickerMode}
        allowMulti={pickerAllowMulti}
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
