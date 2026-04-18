import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Contacts from 'expo-contacts';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { X, Search, CheckCircle2 } from '@/constants/icons';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PersonAvatar } from '@/components/people/PersonAvatar';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { importContactsThunk } from '@/store/thunks/importContactsThunk';

type ContactRow = Contacts.ExistingContact;

export default function ContactsImportScreen() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const peopleById = useAppSelector((s) => s.people.byId);
  const peopleAllIds = useAppSelector((s) => s.people.allIds);

  const existingContactIds = useMemo(() => {
    const set = new Set<string>();
    for (const pid of peopleAllIds) {
      const cid = peopleById[pid]?.contactId;
      if (cid) set.add(cid);
    }
    return set;
  }, [peopleById, peopleAllIds]);

  const [permission, setPermission] = useState<
    'pending' | 'granted' | 'denied'
  >('pending');
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (cancelled) return;
        if (status !== 'granted') {
          setPermission('denied');
          setLoading(false);
          return;
        }
        setPermission('granted');
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.FirstName,
            Contacts.Fields.LastName,
            Contacts.Fields.Name,
            Contacts.Fields.Birthday,
            Contacts.Fields.Image,
            Contacts.Fields.PhoneNumbers,
          ],
        });
        if (cancelled) return;
        const filtered = data.filter(
          (c) => !existingContactIds.has(c.id ?? ''),
        );
        setContacts(filtered);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => (c.name ?? '').toLowerCase().includes(q));
  }, [contacts, query]);

  const toggle = (contactId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(contactId)) next.delete(contactId);
      else next.add(contactId);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(
      new Set(filtered.map((c) => c.id ?? '').filter((x) => x !== '')),
    );
  };

  const deselectAll = () => {
    setSelected(new Set());
  };

  const handleImport = async () => {
    if (selected.size === 0) return;
    try {
      setImporting(true);
      await dispatch(importContactsThunk([...selected])).unwrap();
      router.back();
    } finally {
      setImporting(false);
    }
  };

  const renderRow = ({ item }: { item: ContactRow }) => {
    const cid = item.id ?? '';
    const isSelected = selected.has(cid);
    const photoUri = item.imageAvailable ? item.image?.uri ?? null : null;
    const firstPhone = item.phoneNumbers?.[0]?.number ?? null;
    const name = item.name ?? 'Unknown';

    return (
      <Pressable
        onPress={() => toggle(cid)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={name}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
        }}
      >
        <PersonAvatar name={name} photoUri={photoUri} size="sm" />
        <View style={{ flex: 1 }}>
          <Text
            style={[typography.bodyMedium, { color: colors.text.primary }]}
            numberOfLines={1}
          >
            {name}
          </Text>
          {firstPhone != null && (
            <Text
              style={[typography.caption, { color: colors.text.muted }]}
              numberOfLines={1}
            >
              {firstPhone}
            </Text>
          )}
        </View>
        {isSelected ? (
          <CheckCircle2 size={24} color={colors.primary[500]} />
        ) : (
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: colors.border.medium,
            }}
          />
        )}
      </Pressable>
    );
  };

  if (permission === 'denied') {
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
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={8}
          >
            <X size={22} color={colors.text.primary} />
          </Pressable>
          <Text style={[typography.h2, { color: colors.text.primary }]}>
            Import Contacts
          </Text>
          <View style={{ width: 22 }} />
        </View>
        <EmptyState
          title="Contacts access denied"
          subtitle="Enable contacts access in Settings to import people."
          actionLabel="Open Settings"
          onAction={() => Linking.openSettings()}
        />
      </SafeAreaView>
    );
  }

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
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
        >
          <X size={22} color={colors.text.primary} />
        </Pressable>
        <Text style={[typography.h2, { color: colors.text.primary }]}>
          Import Contacts
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: spacing.lg,
          marginBottom: spacing.sm,
          paddingHorizontal: spacing.md,
          backgroundColor: colors.bg.input,
          borderRadius: radius.md,
          height: 44,
          gap: spacing.sm,
        }}
      >
        <Search size={18} color={colors.text.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search contacts"
          placeholderTextColor={colors.text.placeholder}
          style={[
            typography.body,
            { color: colors.text.primary, flex: 1, padding: 0 },
          ]}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: spacing.xs,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.sm,
        }}
      >
        <Pressable
          onPress={selectAll}
          accessibilityRole="button"
          accessibilityLabel="Select all"
          style={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radius.full,
            backgroundColor: colors.bg.surface,
            borderWidth: 1,
            borderColor: colors.border.light,
          }}
        >
          <Text
            style={[typography.captionMedium, { color: colors.text.secondary }]}
          >
            Select All
          </Text>
        </Pressable>
        <Pressable
          onPress={deselectAll}
          accessibilityRole="button"
          accessibilityLabel="Deselect all"
          style={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radius.full,
            backgroundColor: colors.bg.surface,
            borderWidth: 1,
            borderColor: colors.border.light,
          }}
        >
          <Text
            style={[typography.captionMedium, { color: colors.text.secondary }]}
          >
            Deselect All
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id ?? Math.random().toString()}
          renderItem={renderRow}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View
              style={{
                paddingVertical: spacing['2xl'],
                alignItems: 'center',
              }}
            >
              <Text style={[typography.body, { color: colors.text.muted }]}>
                {contacts.length === 0
                  ? 'No new contacts to import'
                  : 'No contacts match your search'}
              </Text>
            </View>
          }
        />
      )}

      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.md,
          borderTopWidth: 1,
          borderTopColor: colors.border.light,
          backgroundColor: colors.bg.screen,
        }}
      >
        {importing ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              height: 52,
            }}
          >
            <ActivityIndicator color={colors.primary[500]} />
            <Text style={[typography.button, { color: colors.text.secondary }]}>
              Importing…
            </Text>
          </View>
        ) : (
          <Button
            label={`Import ${selected.size} contact${
              selected.size === 1 ? '' : 's'
            }`}
            onPress={handleImport}
            disabled={selected.size === 0}
            accessibilityLabel="Import selected contacts"
          />
        )}
      </View>
    </SafeAreaView>
  );
}
