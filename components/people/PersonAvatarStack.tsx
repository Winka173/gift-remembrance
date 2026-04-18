import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { PersonAvatar } from './PersonAvatar';

type StackSize = 'sm' | 'md' | 'lg';

interface StackPerson {
  id: string;
  name: string;
  avatarUri?: string | null;
}

interface PersonAvatarStackProps {
  people: StackPerson[];
  size?: StackSize;
  max?: number;
}

const SIZE_PX: Record<StackSize, number> = {
  sm: 32,
  md: 44,
  lg: 64,
};

const FONT_PX: Record<StackSize, number> = {
  sm: 11,
  md: 13,
  lg: 16,
};

export function PersonAvatarStack({
  people,
  size = 'md',
  max = 3,
}: PersonAvatarStackProps) {
  const { colors } = useTheme();
  const dimension = SIZE_PX[size];
  const overlap = -Math.round(dimension * 0.35);
  const border = 2;

  const shown = people.slice(0, max);
  const remaining = people.length - shown.length;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {shown.map((p, i) => (
        <View
          key={p.id}
          style={{
            marginLeft: i === 0 ? 0 : overlap,
            borderWidth: border,
            borderColor: colors.bg.card,
            borderRadius: (dimension + border * 2) / 2,
            backgroundColor: colors.bg.card,
          }}
        >
          <PersonAvatar name={p.name} photoUri={p.avatarUri} size={size} />
        </View>
      ))}
      {remaining > 0 && (
        <View
          style={{
            marginLeft: overlap,
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            borderWidth: border,
            borderColor: colors.bg.card,
            backgroundColor: colors.bg.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={[
              typography.captionMedium,
              { color: colors.text.secondary, fontSize: FONT_PX[size] },
            ]}
          >
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
}
