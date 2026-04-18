import { useEffect } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { InterstitialProvider } from '@/components/ads/InterstitialManager';
import { useAppSelector } from '@/store/hooks';

export default function MainLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const hasSeenOnboarding = useAppSelector(
    (s) => s.settings.hasSeenOnboarding,
  );

  useEffect(() => {
    if (!hasSeenOnboarding && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [hasSeenOnboarding, pathname, router]);

  return (
    <InterstitialProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{ animation: 'fade', animationDuration: 220 }}
        />
        <Stack.Screen
          name="people"
          options={{ animation: 'slide_from_right', animationDuration: 280 }}
        />
        <Stack.Screen
          name="calendar"
          options={{ animation: 'slide_from_right', animationDuration: 280 }}
        />
        <Stack.Screen
          name="person/[id]"
          options={{ animation: 'slide_from_right', animationDuration: 280 }}
        />
        <Stack.Screen
          name="gift/[id]"
          options={{ animation: 'slide_from_right', animationDuration: 280 }}
        />
        <Stack.Screen
          name="add-gift"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            animationDuration: 340,
          }}
        />
        <Stack.Screen
          name="add-person"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            animationDuration: 340,
          }}
        />
        <Stack.Screen
          name="add-occasion"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            animationDuration: 340,
          }}
        />
        <Stack.Screen
          name="contacts-import"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            animationDuration: 340,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            animationDuration: 340,
          }}
        />
      </Stack>
    </InterstitialProvider>
  );
}
