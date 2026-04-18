import React, { useEffect, useRef } from 'react';
import { View, Image, Pressable } from 'react-native';
import { useTheme } from '@/constants/theme';
import { Camera, Images, X } from '@/constants/icons';
import { Button } from '@/components/ui/Button';
import { usePhotoAttach } from '@/hooks/usePhotoAttach';

interface GiftPhotoPickerProps {
  photoUri: string | null;
  onChange: (uri: string | null) => void;
}

export function GiftPhotoPicker({ photoUri, onChange }: GiftPhotoPickerProps) {
  const { colors, spacing, radius } = useTheme();
  const { uri, loading, pick, takePhoto, remove } = usePhotoAttach();
  const lastSyncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (uri != null && uri !== lastSyncedRef.current && uri !== photoUri) {
      lastSyncedRef.current = uri;
      onChange(uri);
    }
  }, [uri, photoUri, onChange]);

  const handleRemove = async () => {
    await remove(photoUri);
    lastSyncedRef.current = null;
    onChange(null);
  };

  const handleNoPhoto = () => {
    onChange(null);
  };

  if (photoUri) {
    return (
      <View style={{ alignSelf: 'flex-start' }}>
        <Image
          source={{ uri: photoUri }}
          style={{
            width: 120,
            height: 120,
            borderRadius: radius.lg,
            backgroundColor: colors.bg.surface,
          }}
        />
        <Pressable
          onPress={handleRemove}
          accessibilityRole="button"
          accessibilityLabel="Remove photo"
          style={{
            position: 'absolute',
            top: -spacing.sm,
            right: -spacing.sm,
            width: 28,
            height: 28,
            borderRadius: radius.full,
            backgroundColor: colors.bg.card,
            borderWidth: 1,
            borderColor: colors.border.medium,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={16} color={colors.text.primary} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.sm }}>
      <Button
        label="Take Photo"
        variant="secondary"
        onPress={takePhoto}
        disabled={loading}
        accessibilityLabel="Take photo with camera"
      />
      <Button
        label="Choose from Library"
        variant="secondary"
        onPress={pick}
        disabled={loading}
        accessibilityLabel="Choose photo from library"
      />
      <Button
        label="No Photo"
        variant="secondary"
        onPress={handleNoPhoto}
        disabled={loading}
        accessibilityLabel="Skip adding a photo"
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing.md,
          marginTop: spacing.xs,
        }}
      >
        <Camera size={18} color={colors.text.muted} />
        <Images size={18} color={colors.text.muted} />
        <X size={18} color={colors.text.muted} />
      </View>
    </View>
  );
}
