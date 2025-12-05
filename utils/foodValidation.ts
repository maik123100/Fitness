import { FoodItem } from '@/services/db/schema';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate a food item has all required fields
 */
export function validateFoodItem(food: FoodItem): ValidationResult {
  const errors: string[] = [];

  if (!food.name || food.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (food.calories < 0) {
    errors.push('Calories cannot be negative');
  }

  if (food.servingSize <= 0) {
    errors.push('Serving size must be greater than 0');
  }

  if (!food.servingUnit || food.servingUnit.trim().length === 0) {
    errors.push('Serving unit is required');
  }

  if (food.protein < 0 || food.carbs < 0 || food.fat < 0 || food.fiber < 0) {
    errors.push('Macronutrients cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a quantity string
 */
export function validateQuantity(quantity: string): boolean {
  const parsed = parseFloat(quantity);
  return !isNaN(parsed) && parsed > 0;
}

/**
 * Validate a numeric input value
 */
export function validateNumericInput(value: string): boolean {
  if (value === '') return true; // Allow empty for optional fields
  const parsed = parseFloat(value);
  return !isNaN(parsed) && parsed >= 0;
}

/**
 * Parse a string to a number, returning 0 if invalid
 */
export function parseNumericValue(value: string): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}
