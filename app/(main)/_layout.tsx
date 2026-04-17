import { Stack } from 'expo-router';
import { useTheme } from '@/constants/theme';

export default function MainLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.screen },
        animation: 'slide_from_right',
      }}
    />
  );
}
