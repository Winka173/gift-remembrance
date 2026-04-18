import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { X, UserPlus } from '@/constants/icons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { PersonAvatar } from '@/components/people/PersonAvatar';
import { useAppDispatch } from '@/store/hooks';
import { useAds } from '@/hooks/useAds';
import { useInterstitial } from '@/components/ads/InterstitialManager';
import { createPersonThunk } from '@/store/thunks/createPersonThunk';
import { saveOccasionThunk } from '@/store/thunks/saveOccasionThunk';
import { usePhotoAttach } from '@/hooks/usePhotoAttach';

const RELATIONSHIPS = [
  'Partner',
  'Parent',
  'Sibling',
  'Child',
  'Friend',
  'Coworker',
  'Other',
];

type Tab = 'manual' | 'import';

export default function AddPersonScreen() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { shouldShowInterstitial, recordEvent, markShown } = useAds();
  const interstitial = useInterstitial();
  const { uri: pickedUri, loading: photoLoading, pick } = usePhotoAttach();

  const [tab, setTab] = useState<Tab>('manual');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<string | null>(null);
  const [otherRelationship, setOtherRelationship] = useState('');
  const [birthday, setBirthday] = useState<string>('');
  const [annualBudget, setAnnualBudget] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const [nameError, setNameError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const markDirty = () => {
    if (!dirty) setDirty(true);
  };

  React.useEffect(() => {
    if (pickedUri != null && pickedUri !== avatarUri) {
      setAvatarUri(pickedUri);
      if (!dirty) setDirty(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedUri]);

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
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    setNameError(undefined);

    const resolvedRelationship =
      relationship === 'Other'
        ? otherRelationship.trim() || 'Other'
        : relationship;

    try {
      setSaving(true);
      const created = await dispatch(
        createPersonThunk({
          name: name.trim(),
          relationship: resolvedRelationship,
          avatarUri,
          annualBudget,
          notes: notes.trim() ? notes.trim() : null,
          contactId: null,
        }),
      ).unwrap();

      if (birthday) {
        await dispatch(
          saveOccasionThunk({
            type: 'birthday',
            personIds: [created.id],
            date: birthday,
            customLabel: null,
            recurring: true,
          }),
        ).unwrap();
      }

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

  const handleOpenContacts = () => {
    router.replace('/contacts-import');
  };

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
          Add Person
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: spacing.xs,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
        }}
      >
        {(
          [
            { key: 'manual', label: 'Manual' },
            { key: 'import', label: 'Import Contacts' },
          ] as { key: Tab; label: string }[]
        ).map((t) => {
          const selected = tab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              accessibilityRole="button"
              accessibilityLabel={t.label}
              accessibilityState={{ selected }}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: spacing.sm,
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
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'manual' ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing['3xl'] * 2,
            gap: spacing.lg,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
            <Pressable
              onPress={pick}
              disabled={photoLoading}
              accessibilityRole="button"
              accessibilityLabel="Choose avatar photo"
            >
              <PersonAvatar
                name={name || '?'}
                photoUri={avatarUri}
                size="xl"
              />
            </Pressable>
            <Text
              style={[
                typography.caption,
                { color: colors.text.muted, marginTop: spacing.sm },
              ]}
            >
              Tap to add photo
            </Text>
          </View>

          <Input
            label="Name"
            value={name}
            onChangeText={(v) => {
              setName(v);
              markDirty();
            }}
            maxLength={60}
            showCount
            placeholder="Their name"
            error={nameError}
            autoCapitalize="words"
          />

          <View style={{ gap: spacing.sm }}>
            <Text
              style={[
                typography.captionMedium,
                { color: colors.text.secondary },
              ]}
            >
              Relationship
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: spacing.xs,
              }}
            >
              {RELATIONSHIPS.map((rel) => {
                const selected = relationship === rel;
                return (
                  <Pressable
                    key={rel}
                    onPress={() => {
                      setRelationship(rel);
                      markDirty();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${rel}`}
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
                      {rel}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {relationship === 'Other' && (
              <Input
                value={otherRelationship}
                onChangeText={(v) => {
                  setOtherRelationship(v);
                  markDirty();
                }}
                maxLength={30}
                placeholder="Describe relationship"
              />
            )}
          </View>

          <DatePicker
            label="Birthday (optional)"
            value={birthday}
            onChange={(v) => {
              setBirthday(v);
              markDirty();
            }}
          />

          <CurrencyInput
            label="Annual budget (optional)"
            value={annualBudget}
            onChange={(v) => {
              setAnnualBudget(v);
              markDirty();
            }}
          />

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
            placeholder="Preferences, allergies, sizes…"
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
              accessibilityLabel="Save person"
              style={{ flex: 1 }}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <EmptyState
            icon={UserPlus}
            title="Import from your contacts"
            subtitle="Quickly add people from your phone's address book."
            actionLabel="Open Contacts"
            onAction={handleOpenContacts}
          />
        </View>
      )}

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
