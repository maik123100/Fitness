import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'hasCompletedOnboarding';

export const setOnboardingCompleted = async (completed: boolean) => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(completed));
  } catch (error) {
    console.error('Error setting onboarding status:', error);
  }
};

export const getOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value ? JSON.parse(value) : false;
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    return false;
  }
};
