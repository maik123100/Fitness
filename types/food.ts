import type { FoodItem, NewFoodItem } from '@/services/db/schema';

/** Identifies where a food search result originated. */
export type FoodSearchSource = 'local' | 'openfoodfacts';

/** A food and the context the search UI needs to present or import it. */
export interface FoodSearchResult {
  food: FoodItem;
  source: FoodSearchSource;
  isPersisted: boolean;
}

export type FoodSearchErrorCategory =
  | 'local-database'
  | 'network'
  | 'timeout'
  | 'rate-limited'
  | 'invalid-provider-data'
  | 'unknown';

export interface FoodSearchError {
  category: FoodSearchErrorCategory;
  message: string;
  cause?: unknown;
}

/** Explicit outcomes keep a successful empty search distinct from a failure. */
export type FoodSearchOutcome =
  | { status: 'success'; results: FoodSearchResult[] }
  | { status: 'error'; results: FoodSearchResult[]; error: FoodSearchError }
  | { status: 'cancelled'; results: FoodSearchResult[] };

export type FoodSearchState =
  | { status: 'idle' | 'loading' | 'success'; results: FoodSearchResult[] }
  | { status: 'error'; results: FoodSearchResult[]; error: FoodSearchError };

/** Provider-neutral food fields before they are persisted as a FoodItem. */
export type FoodProviderProduct = Omit<
  NewFoodItem,
  'createdAt' | 'updatedAt' | 'isVerified'
>;

/** External food providers expose normalized domain items, never raw API rows. */
export interface FoodSearchProvider {
  search(query: string, signal?: AbortSignal): Promise<FoodItem[]>;
}
