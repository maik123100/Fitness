import { useRouter } from 'expo-router';

export const initializeNotificationBootstrap = async (router: ReturnType<typeof useRouter>): Promise<void> => {
  const { initializeNotifications, setupNotificationHandlers } = await import('@/services/notificationService');
  await initializeNotifications();
  setupNotificationHandlers(router);
};
