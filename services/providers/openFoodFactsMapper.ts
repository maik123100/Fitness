import type { FoodCategory, FoodItem } from '@/services/db/schema';
import { OpenFoodFactsError, type OpenFoodFactsProduct, type OpenFoodFactsResponse } from './openFoodFactsClient';

const numberOrZero = (value: number | undefined): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const validImageUrl = (...values: (string | undefined)[]): string | null => {
  for (const value of values) {
    const candidate = value?.trim();
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === 'http:' || url.protocol === 'https:') return candidate;
    } catch {
      // An invalid image is optional metadata; continue to the next provider field.
    }
  }
  return null;
};

const categoryFromTags = (tags: string[] | undefined): FoodCategory => {
  const categories = (tags ?? []).map((tag) => tag.toLowerCase());
  if (categories.some((tag) => tag.includes('beverage') || tag.includes('drink'))) return 'beverages';
  if (categories.some((tag) => tag.includes('dairy') || tag.includes('milk') || tag.includes('cheese'))) return 'dairy';
  if (categories.some((tag) => tag.includes('fruit'))) return 'fruits';
  if (categories.some((tag) => tag.includes('vegetable'))) return 'vegetables';
  if (categories.some((tag) => tag.includes('grain') || tag.includes('cereal'))) return 'grains';
  if (categories.some((tag) => tag.includes('meat') || tag.includes('fish') || tag.includes('egg'))) return 'proteins';
  if (categories.some((tag) => tag.includes('snack'))) return 'snacks';
  return 'other';
};

export const mapOpenFoodFactsProduct = (product: OpenFoodFactsProduct): FoodItem | null => {
  const name = product.product_name_en?.trim() || product.product_name?.trim();
  const code = product.code?.trim();
  if (!name || !code) return null;

  const nutrients = product.nutriments ?? {};
  const now = Date.now();
  return {
    id: `openfoodfacts-${code}`,
    name,
    brand: (Array.isArray(product.brands) ? product.brands[0] : product.brands?.split(',')[0])?.trim() || null,
    barcode: code,
    imageUrl: validImageUrl(product.image_front_url, product.image_front_small_url, product.image_url),
    sourceType: 'product',
    category: categoryFromTags(product.categories_tags),
    calories: numberOrZero(nutrients['energy-kcal_100g'] ?? nutrients['energy-kcal']),
    protein: numberOrZero(nutrients.proteins_100g),
    carbs: numberOrZero(nutrients.carbohydrates_100g),
    fat: numberOrZero(nutrients.fat_100g),
    fiber: numberOrZero(nutrients.fiber_100g),
    vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminB6: 0, vitaminE: 0, vitaminK: 0,
    thiamin: 0, vitaminB12: 0, riboflavin: 0, folate: 0, niacin: 0, choline: 0,
    pantothenicAcid: 0, biotin: 0, carotenoids: 0,
    calcium: 0, chloride: 0, chromium: 0, copper: 0, fluoride: 0, iodine: 0, iron: 0,
    magnesium: 0, manganese: 0, molybdenum: 0, phosphorus: 0, potassium: 0,
    selenium: 0, sodium: 0, zinc: 0,
    servingSize: 100,
    servingUnit: 'g',
    isVerified: false,
    createdAt: now,
    updatedAt: now,
  };
};

export const mapOpenFoodFactsResponse = (response: OpenFoodFactsResponse): FoodItem[] => {
  if (response.hits !== undefined && !Array.isArray(response.hits)) {
    throw new OpenFoodFactsError('OpenFoodFacts response did not contain a valid hits list', 'invalid-response');
  }
  return (response.hits ?? [])
    .map(mapOpenFoodFactsProduct)
    .filter((item): item is FoodItem => item !== null);
};
