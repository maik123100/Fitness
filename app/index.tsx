import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { getOnboardingCompleted } from '../services/onboardingService';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await getOnboardingCompleted();
      if (completed) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    };

    checkOnboarding();
  }, []);

  return null;
}
