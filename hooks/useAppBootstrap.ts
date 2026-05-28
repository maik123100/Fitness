import { getOnboardingCompleted } from '@/services/onboardingService';
import type { Router } from 'expo-router';
import { useEffect, useState } from 'react';

export const useAppBootstrap = (enabled: boolean, router: Router) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      await getOnboardingCompleted();

      if (cancelled) {
        return;
      }

      if (__DEV__ && process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true') {
        const { seedMockData } = await import('@/services/mockData');
        if (!cancelled) {
          seedMockData();
        }
      }

      if (!__DEV__) {
        const { initializeNotifications, setupNotificationHandlers } = await import(
          '@/services/notificationService'
        );

        await initializeNotifications();

        if (cancelled) {
          return;
        }

        setupNotificationHandlers(router);
      }

      setLoaded(true);
    };

    run().catch((error) => {
      console.error('App bootstrap failed:', error);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, router]);

  return loaded;
};
