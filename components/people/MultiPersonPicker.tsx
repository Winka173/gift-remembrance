import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Switch,
} from 'react-native';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { Plus, X, Search } from '@/constants/icons';
import { useAppSelector } from '@/store/hooks';
import type { Person } from '@/types/person';
import { Button } from '@/components/ui/Button';
import { PersonAvatar } from './PersonAvatar';

interface MultiPersonPickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
  mode: 'single' | 'multi';
  allowMulti?: boolean;
  initialSelection?: string[];
}

export function MultiPersonPicker({
  visible,
  onClose,
  onConfirm,
  mode,
  allowMulti = false,
  initialSelection = [],
}: MultiPersonPickerProps) {
  const { colors, spacing, radius } = useTheme();
  const [activeMode, setActiveMode] = useState<'single' | 'multi'>(mode);
  const [selected, setSelected] = useState<string[]>(initialSelection);
  const [query, setQuery] = useState('');

  const people = useAppSelector((s) =>
    s.people.allIds.map((id) => s.people.byId[id]).filter(Boolean),
  );

  useEffect(() => {
    if (visible) {
      setActiveMode(mode);
      setSelected(initialSelection);
      setQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter((p) => p.name.toLowerCase().includes(q));
  }, [people, query]);

  const toggle = (id: string) => {
    if (activeMode === 'single') {
      setSelected([id]);
      return;
    }
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  const handleAddNew = () => {
    // Placeholder for Phase 3 — caller will wire to person-create flow.
    onClose();
  };

  const renderRow = ({ item }: { item: Person }) => {
    const isSelected = selected.includes(item.id);
    return (
      <Pressable
        onPress={() => toggle(item.id)}
        accessibilityRole={activeMode === 'single' ? 'radio' : 'checkbox'}
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={item.name}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
        }}
      >
        <PersonAvatar name={item.name} photoUri={item.avatarUri} size="md" />
        <Text
          style={[
            typography.bodyMedium,
            { color: colors.text.primary, flex: 1 },
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: activeMode === 'single' ? 11 : 6,
            borderWidth: 2,
            borderColor: isSelected
              ? colors.primary[500]
              : colors.border.medium,
            backgroundColor: isSelected ? colors.primary[500] : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isSelected && activeMode === 'single' && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.text.inverse,
              }}
            />
          )}
          {isSelected && activeMode === 'multi' && (
            <Text
              style={{
                color: colors.text.inverse,
                fontFamily: 'Inter_700Bold',
                fontSize: 14,
                lineHeight: 16,
              }}
            >
              ✓
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  const headerTitle =
    activeMode === 'multi' && selected.length > 0
      ? `${selected.length} selected`
      : 'Select person';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg.overlay,
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: colors.bg.modal,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            maxHeight: '85%',
            paddingBottom: spacing['2xl'],
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.lg,
              paddingBottom: spacing.sm,
            }}
          >
            <Text style={[typography.h3, { color: colors.text.primary }]}>
              {headerTitle}
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close picker"
              hitSlop={8}
            >
              <X size={22} color={colors.text.secondary} />
            </Pressable>
          </View>

          {allowMulti && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
              }}
            >
              <Text
                style={[typography.caption, { color: colors.text.secondary }]}
              >
                Allow multiple
              </Text>
              <Switch
                value={activeMode === 'multi'}
                onValueChange={(v) => {
                  setActiveMode(v ? 'multi' : 'single');
                  if (!v && selected.length > 1) {
                    setSelected(selected.slice(0, 1));
                  }
                }}
                accessibilityLabel="Toggle multi-select"
              />
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: spacing.lg,
              marginTop: spacing.sm,
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
              placeholder="Search people"
              placeholderTextColor={colors.text.placeholder}
              style={[
                typography.body,
                { color: colors.text.primary, flex: 1, padding: 0 },
              ]}
            />
          </View>

          <Pressable
            onPress={handleAddNew}
            accessibilityRole="button"
            accessibilityLabel="Add new person"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              gap: spacing.md,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: colors.border.medium,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Plus size={20} color={colors.primary[500]} />
            </View>
            <Text
              style={[
                typography.bodyMedium,
                { color: colors.primary[500], flex: 1 },
              ]}
            >
              Add new person
            </Text>
          </Pressable>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderRow}
            keyboardShouldPersistTaps="handled"
            style={{ flexGrow: 0 }}
            ListEmptyComponent={
              <View
                style={{
                  paddingVertical: spacing['2xl'],
                  alignItems: 'center',
                }}
              >
                <Text
                  style={[typography.body, { color: colors.text.muted }]}
                >
                  No people found
                </Text>
              </View>
            }
          />

          <View
            style={{
              flexDirection: 'row',
              gap: spacing.md,
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.md,
            }}
          >
            <Button
              label="Cancel"
              onPress={onClose}
              variant="secondary"
              accessibilityLabel="Cancel person selection"
              style={{ flex: 1 }}
            />
            <Button
              label="Confirm"
              onPress={handleConfirm}
              disabled={selected.length === 0}
              accessibilityLabel="Confirm person selection"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
