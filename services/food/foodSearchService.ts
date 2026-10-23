import type { FoodItem } from '@/services/db/schema';
import { addFoodItem, deleteFoodItem, getAllFoodItems } from '@/services/db/repositories/foodRepository';
import type { FoodSearchError, FoodSearchOutcome, FoodSearchProvider, FoodSearchResult } from '@/types/food';

const localResults = (query: string): FoodSearchResult[] => {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return getAllFoodItems()
    .filter((food) => !normalizedQuery || food.name.toLocaleLowerCase().includes(normalizedQuery))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((food) => ({ food, source: 'local', isPersisted: true }));
};

const classifyError = (cause: unknown, category: FoodSearchError['category']): FoodSearchError => {
  const message = cause instanceof Error ? cause.message : 'Food search failed';
  if (cause && typeof cause === 'object' && 'category' in cause) {
    const providerCategory = String(cause.category);
    if (providerCategory === 'timeout') return { category: 'timeout', message, cause };
    if (providerCategory === 'rate-limited') return { category: 'rate-limited', message, cause };
    if (providerCategory === 'invalid-response') return { category: 'invalid-provider-data', message, cause };
  }
  return { category, message, cause };
};

const hasIdentity = (food: FoodItem, ids: Set<string>, barcodes: Set<string>) =>
  ids.has(food.id) || (!!food.barcode && barcodes.has(food.barcode));

export const searchFoods = async (
  query: string,
  options: { includeRemote: boolean; provider: FoodSearchProvider; signal?: AbortSignal },
): Promise<FoodSearchOutcome> => {
  let local: FoodSearchResult[];
  try {
    local = localResults(query);
  } catch (cause) {
    return { status: 'error', results: [], error: classifyError(cause, 'local-database') };
  }

  if (!options.includeRemote || query.trim().length < 2) {
    return { status: 'success', results: local };
  }

  try {
    const remoteFoods = await options.provider.search(query, options.signal);
    if (options.signal?.aborted) return { status: 'cancelled', results: local };
    const ids = new Set(local.map(({ food }) => food.id));
    const barcodes = new Set(local.map(({ food }) => food.barcode).filter((code): code is string => !!code));
    const remote = remoteFoods
      .filter((food) => !hasIdentity(food, ids, barcodes))
      .map((food) => ({ food, source: 'openfoodfacts' as const, isPersisted: false }));
    return { status: 'success', results: [...local, ...remote].sort((a, b) => a.food.name.localeCompare(b.food.name)) };
  } catch (cause) {
    if (options.signal?.aborted || (cause && typeof cause === 'object' && 'category' in cause && cause.category === 'cancelled')) {
      return { status: 'cancelled', results: local };
    }
    return { status: 'error', results: local, error: classifyError(cause, 'network') };
  }
};

export const importFoodSearchResult = (result: FoodSearchResult): FoodSearchResult => {
  if (result.isPersisted) return result;
  addFoodItem(result.food);
  return { ...result, isPersisted: true };
};

export const deleteFoodSearchResult = (result: FoodSearchResult): void => {
  deleteFoodItem(result.food);
};
