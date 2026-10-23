import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const OPEN_FOOD_FACTS_SEARCH_KEY = '@fitness_openfoodfacts_search_enabled';

export const getOpenFoodFactsSearchEnabled = async (): Promise<boolean> => {
  return (await AsyncStorage.getItem(OPEN_FOOD_FACTS_SEARCH_KEY)) === 'true';
};

export const useFoodSearchSettings = () => {
  const [openFoodFactsSearchEnabled, setOpenFoodFactsSearchEnabled] = useState(false);

  useEffect(() => {
    getOpenFoodFactsSearchEnabled().then(setOpenFoodFactsSearchEnabled).catch((error) => {
      console.error('Failed to load food search settings:', error);
    });
  }, []);

  const setOpenFoodFactsSearch = async (enabled: boolean) => {
    await AsyncStorage.setItem(OPEN_FOOD_FACTS_SEARCH_KEY, String(enabled));
    setOpenFoodFactsSearchEnabled(enabled);
  };

  return { openFoodFactsSearchEnabled, setOpenFoodFactsSearch };
};
