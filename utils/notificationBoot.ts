import * as Notifications from 'expo-notifications';
import type { Router } from 'expo-router';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function registerNotificationTapHandler(
  router: Router,
): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as
      | { personId?: string; occasionId?: string }
      | undefined;
    if (data?.personId) {
      router.push(`/person/${data.personId}`);
    }
  });
  return () => sub.remove();
}
