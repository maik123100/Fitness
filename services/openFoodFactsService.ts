import type { FoodItem } from '@/services/db/schema';
import type { FoodSearchProvider } from '@/types/food';
import { mapOpenFoodFactsResponse } from './providers/openFoodFactsMapper';
import { searchOpenFoodFactsProducts } from './providers/openFoodFactsClient';

/** Compatibility entry point while callers migrate to the provider boundary. */
export const searchOpenFoodFacts = async (query: string, signal?: AbortSignal): Promise<FoodItem[]> => {
  const response = await searchOpenFoodFactsProducts(query, signal);
  return mapOpenFoodFactsResponse(response);
};

export const openFoodFactsProvider: FoodSearchProvider = {
  search: searchOpenFoodFacts,
};
