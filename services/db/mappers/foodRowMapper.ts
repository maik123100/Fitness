import type { FoodItem } from '@/services/db/schema';

/** Converts a selected food row to the domain shape, including legacy NULL images. */
export const mapFoodRow = (row: FoodItem): FoodItem => ({
  ...row,
  imageUrl: row.imageUrl ?? null,
});
