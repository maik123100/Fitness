import { MealType } from '@/services/db/schema';
import Ionicons from '@expo/vector-icons/Ionicons';

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export const MEAL_ICONS: Record<MealType, keyof typeof Ionicons.glyphMap> = {
  breakfast: 'sunny',
  lunch: 'partly-sunny',
  dinner: 'moon',
  snack: 'cafe',
};

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

export interface NutrientField {
  label: string;
  key: string;
  isNumber: boolean;
  unit?: string;
}

export const VITAMIN_FIELDS: NutrientField[] = [
  { label: 'Vitamin A', key: 'vitaminA', isNumber: true, unit: 'µg' },
  { label: 'Vitamin C', key: 'vitaminC', isNumber: true, unit: 'mg' },
  { label: 'Vitamin D', key: 'vitaminD', isNumber: true, unit: 'µg' },
  { label: 'Vitamin B6', key: 'vitaminB6', isNumber: true, unit: 'mg' },
  { label: 'Vitamin E', key: 'vitaminE', isNumber: true, unit: 'mg' },
  { label: 'Vitamin K', key: 'vitaminK', isNumber: true, unit: 'µg' },
  { label: 'Thiamin', key: 'thiamin', isNumber: true, unit: 'mg' },
  { label: 'Vitamin B12', key: 'vitaminB12', isNumber: true, unit: 'µg' },
  { label: 'Riboflavin', key: 'riboflavin', isNumber: true, unit: 'mg' },
  { label: 'Folate', key: 'folate', isNumber: true, unit: 'µg' },
  { label: 'Niacin', key: 'niacin', isNumber: true, unit: 'mg' },
  { label: 'Choline', key: 'choline', isNumber: true, unit: 'mg' },
  { label: 'Pantothenic Acid', key: 'pantothenicAcid', isNumber: true, unit: 'mg' },
  { label: 'Biotin', key: 'biotin', isNumber: true, unit: 'µg' },
  { label: 'Carotenoids', key: 'carotenoids', isNumber: true, unit: 'µg' },
];

export const MINERAL_FIELDS: NutrientField[] = [
  { label: 'Calcium', key: 'calcium', isNumber: true, unit: 'mg' },
  { label: 'Chloride', key: 'chloride', isNumber: true, unit: 'mg' },
  { label: 'Chromium', key: 'chromium', isNumber: true, unit: 'µg' },
  { label: 'Copper', key: 'copper', isNumber: true, unit: 'mg' },
  { label: 'Fluoride', key: 'fluoride', isNumber: true, unit: 'mg' },
  { label: 'Iodine', key: 'iodine', isNumber: true, unit: 'µg' },
  { label: 'Iron', key: 'iron', isNumber: true, unit: 'mg' },
  { label: 'Magnesium', key: 'magnesium', isNumber: true, unit: 'mg' },
  { label: 'Manganese', key: 'manganese', isNumber: true, unit: 'mg' },
  { label: 'Molybdenum', key: 'molybdenum', isNumber: true, unit: 'µg' },
  { label: 'Phosphorus', key: 'phosphorus', isNumber: true, unit: 'mg' },
  { label: 'Potassium', key: 'potassium', isNumber: true, unit: 'mg' },
  { label: 'Selenium', key: 'selenium', isNumber: true, unit: 'µg' },
  { label: 'Sodium', key: 'sodium', isNumber: true, unit: 'mg' },
  { label: 'Zinc', key: 'zinc', isNumber: true, unit: 'mg' },
];

export const GENERAL_FOOD_FIELDS: NutrientField[] = [
  { label: 'Name', key: 'name', isNumber: false },
  { label: 'Brand (optional)', key: 'brand', isNumber: false },
  { label: 'Calories', key: 'calories', isNumber: true },
  { label: 'Serving Size', key: 'servingSize', isNumber: true },
  { label: 'Serving Unit', key: 'servingUnit', isNumber: false },
];

export const MACRO_FIELDS: NutrientField[] = [
  { label: 'Protein', key: 'protein', isNumber: true, unit: 'g' },
  { label: 'Carbs', key: 'carbs', isNumber: true, unit: 'g' },
  { label: 'Fat', key: 'fat', isNumber: true, unit: 'g' },
  { label: 'Fiber', key: 'fiber', isNumber: true, unit: 'g' },
];
