import { getOnboardingCompleted } from '@/services/onboardingService';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export const useAppBootstrap = (enabled: boolean, router: ReturnType<typeof useRouter>) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const run = async () => {
      await getOnboardingCompleted();
      if (cancelled) return;

      if (__DEV__ && process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true') {
        const { initializeMockData } = await import('@/services/bootstrap/mockDataBootstrap');
        if (cancelled) return;
        initializeMockData();
      }

      if (!__DEV__) {
        const { initializeNotificationBootstrap } = await import('@/services/bootstrap/notificationBootstrap');
        if (cancelled) return;
        await initializeNotificationBootstrap(router);
      }

      if (!cancelled) setLoaded(true);
    };

    run().catch((error) => {
      console.error('App bootstrap failed:', error);
    });

    return () => { cancelled = true; };
  }, [enabled, router]);

  return loaded;
};
