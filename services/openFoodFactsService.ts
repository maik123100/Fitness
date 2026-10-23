import { FoodCategory, FoodItem } from '@/services/db/schema';

const API_URL = 'https://search.openfoodfacts.org/search';
const REQUEST_TIMEOUT_MS = 10000;
const MAX_RETRIES = 2;
const SEARCH_FIELDS = [
  'code',
  'product_name',
  'product_name_en',
  'brands',
  'image_front_url',
  'image_front_small_url',
  'image_url',
  'categories_tags',
  'serving_size',
  'nutriments',
].join(',');

type OpenFoodFactsProduct = {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string | string[];
  image_front_url?: string;
  image_front_small_url?: string;
  image_url?: string;
  categories_tags?: string[];
  serving_size?: string;
  nutriments?: Record<string, number | undefined>;
};

type OpenFoodFactsResponse = {
  hits?: OpenFoodFactsProduct[];
};

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
      // Ignore invalid provider image URLs and try the next supported field.
    }
  }
  return null;
};

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const isTransientStatus = (status: number) =>
  status === 429 || status === 500 || status === 502 || status === 503 || status === 504;

const requestProducts = async (query: string): Promise<OpenFoodFactsResponse> => {
  const url = `${API_URL}?q=${encodeURIComponent(query.trim())}&page_size=20&fields=${SEARCH_FIELDS}&langs=en`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'FitnessApp/1.0 (OpenFoodFacts search)',
        },
        signal: controller.signal,
      });

      if (response.ok) {
        return (await response.json()) as OpenFoodFactsResponse;
      }

      if (!isTransientStatus(response.status) || attempt === MAX_RETRIES) {
        throw new Error(`OpenFoodFacts request failed with status ${response.status}`);
      }
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('OpenFoodFacts request timed out');
        }
        throw error;
      }
    } finally {
      clearTimeout(timeout);
    }

    await wait(500 * (attempt + 1));
  }

  throw new Error('OpenFoodFacts request failed after retries');
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

const toFoodItem = (product: OpenFoodFactsProduct): FoodItem | null => {
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
    vitaminA: 0,
    vitaminC: 0,
    vitaminD: 0,
    vitaminB6: 0,
    vitaminE: 0,
    vitaminK: 0,
    thiamin: 0,
    vitaminB12: 0,
    riboflavin: 0,
    folate: 0,
    niacin: 0,
    choline: 0,
    pantothenicAcid: 0,
    biotin: 0,
    carotenoids: 0,
    calcium: 0,
    chloride: 0,
    chromium: 0,
    copper: 0,
    fluoride: 0,
    iodine: 0,
    iron: 0,
    magnesium: 0,
    manganese: 0,
    molybdenum: 0,
    phosphorus: 0,
    potassium: 0,
    selenium: 0,
    sodium: 0,
    zinc: 0,
    servingSize: 100,
    servingUnit: 'g',
    isVerified: false,
    createdAt: now,
    updatedAt: now,
  };
};

export const searchOpenFoodFacts = async (query: string): Promise<FoodItem[]> => {
  const data = await requestProducts(query);
  return (data.hits ?? []).map(toFoodItem).filter((item): item is FoodItem => item !== null);
};
