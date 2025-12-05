import { FoodEntry, FoodItem } from '@/services/db/schema';

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutrientTotals extends MacroTotals {
  fiber: number;
}

/**
 * Calculate total nutrients for a given quantity of food
 */
export function calculateNutrients(food: FoodItem, quantity: number): NutrientTotals {
  const multiplier = quantity / food.servingSize;
  
  return {
    calories: food.calories * multiplier,
    protein: food.protein * multiplier,
    carbs: food.carbs * multiplier,
    fat: food.fat * multiplier,
    fiber: food.fiber * multiplier,
  };
}

/**
 * Calculate total macros from an array of food entries
 */
export function calculateMealTotals(entries: FoodEntry[]): MacroTotals {
  return entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.totalCalories,
      protein: acc.protein + entry.totalProtein,
      carbs: acc.carbs + entry.totalCarbs,
      fat: acc.fat + entry.totalFat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/**
 * Format a number to display with specified decimal places
 */
export function formatNutrientValue(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}

/**
 * Calculate percentage of a value relative to a target
 */
export function calculatePercentage(value: number, target: number): number {
  if (target === 0) return 0;
  return (value / target) * 100;
}
