import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { Button } from '@/components/ui/Button';

interface ConfirmSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  typeToConfirm?: string;
}

export function ConfirmSheet({
  visible,
  onClose,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  typeToConfirm,
}: ConfirmSheetProps) {
  const { colors, spacing, radius, shadow } = useTheme();
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!visible) {
      setTyped('');
    }
  }, [visible]);

  const confirmEnabled =
    typeToConfirm == null || typed.trim() === typeToConfirm.trim();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.bg.overlay },
        ]}
        onPress={onClose}
      />
      <View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.bg.modal,
            borderTopLeftRadius: radius['2xl'],
            borderTopRightRadius: radius['2xl'],
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.xl,
            paddingBottom: spacing['3xl'],
          },
          shadow.modal,
        ]}
      >
        <View
          style={{
            alignSelf: 'center',
            width: 40,
            height: 4,
            borderRadius: radius.full,
            backgroundColor: colors.border.medium,
            marginBottom: spacing.lg,
          }}
        />
        <Text
          style={[
            typography.h2,
            { color: colors.text.primary, marginBottom: spacing.sm },
          ]}
        >
          {title}
        </Text>
        {message != null && (
          <Text
            style={[
              typography.body,
              { color: colors.text.secondary, marginBottom: spacing.lg },
            ]}
          >
            {message}
          </Text>
        )}

        {typeToConfirm != null && (
          <View style={{ marginBottom: spacing.lg }}>
            <Text
              style={[
                typography.caption,
                { color: colors.text.muted, marginBottom: spacing.xs },
              ]}
            >
              Type{' '}
              <Text
                style={[
                  typography.captionMedium,
                  { color: colors.text.primary },
                ]}
              >
                {typeToConfirm}
              </Text>{' '}
              to confirm
            </Text>
            <TextInput
              value={typed}
              onChangeText={setTyped}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={typeToConfirm}
              placeholderTextColor={colors.text.placeholder}
              style={[
                typography.body,
                {
                  backgroundColor: colors.bg.input,
                  borderRadius: radius.md,
                  padding: 12,
                  color: colors.text.primary,
                },
              ]}
            />
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Button
            label={cancelLabel}
            onPress={onClose}
            variant="secondary"
            accessibilityLabel={cancelLabel}
            style={{ flex: 1 }}
          />
          <Button
            label={confirmLabel}
            onPress={onConfirm}
            variant={destructive ? 'destructive' : 'primary'}
            disabled={!confirmEnabled}
            accessibilityLabel={confirmLabel}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </Modal>
  );
}
