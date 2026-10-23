import { db } from '@/services/db';
import { foodItems, type FoodItem } from '@/services/db/schema';
import { mapFoodRow } from '@/services/db/mappers/foodRowMapper';
import { and, asc, desc, eq, like } from 'drizzle-orm';

export const addFoodItem = (food: FoodItem): void => {
  const now = Date.now();
  db.insert(foodItems).values({
    id: food.id,
    name: food.name,
    brand: food.brand ?? null,
    barcode: food.barcode ?? null,
    imageUrl: food.imageUrl ?? null,
    sourceType: food.sourceType ?? 'product',
    category: food.category,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    fiber: food.fiber,
    vitaminA: food.vitaminA ?? 0,
    vitaminC: food.vitaminC ?? 0,
    vitaminD: food.vitaminD ?? 0,
    vitaminB6: food.vitaminB6 ?? 0,
    vitaminE: food.vitaminE ?? 0,
    vitaminK: food.vitaminK ?? 0,
    thiamin: food.thiamin ?? 0,
    vitaminB12: food.vitaminB12 ?? 0,
    riboflavin: food.riboflavin ?? 0,
    folate: food.folate ?? 0,
    niacin: food.niacin ?? 0,
    choline: food.choline ?? 0,
    pantothenicAcid: food.pantothenicAcid ?? 0,
    biotin: food.biotin ?? 0,
    carotenoids: food.carotenoids ?? 0,
    calcium: food.calcium ?? 0,
    chloride: food.chloride ?? 0,
    chromium: food.chromium ?? 0,
    copper: food.copper ?? 0,
    fluoride: food.fluoride ?? 0,
    iodine: food.iodine ?? 0,
    iron: food.iron ?? 0,
    magnesium: food.magnesium ?? 0,
    manganese: food.manganese ?? 0,
    molybdenum: food.molybdenum ?? 0,
    phosphorus: food.phosphorus ?? 0,
    potassium: food.potassium ?? 0,
    selenium: food.selenium ?? 0,
    sodium: food.sodium ?? 0,
    zinc: food.zinc ?? 0,
    servingSize: food.servingSize,
    servingUnit: food.servingUnit,
    isVerified: food.isVerified,
    createdAt: food.createdAt || now,
    updatedAt: food.updatedAt || now,
  }).run();
};

export const deleteFoodItem = (foodItem: FoodItem): void => {
  db.delete(foodItems).where(eq(foodItems.id, foodItem.id)).run();
};

export const getAllFoodItems = (options?: { includeDirect?: boolean }): FoodItem[] => {
  const rows = db.select().from(foodItems).orderBy(asc(foodItems.name)).all();
  const includeDirect = options?.includeDirect ?? false;
  return rows.map(mapFoodRow).filter((item) => includeDirect || item.sourceType !== 'direct');
};

export const searchFoodItems = (query: string, category?: string, limit = 20): FoodItem[] => {
  const conditions = [like(foodItems.name, `%${query}%`), eq(foodItems.sourceType, 'product')];
  if (category) conditions.push(eq(foodItems.category, category));
  const rows = db.select().from(foodItems)
    .where(and(...conditions))
    .orderBy(desc(foodItems.isVerified), asc(foodItems.name))
    .limit(limit)
    .all();
  return rows.map(mapFoodRow);
};

export const getFoodItem = (id: string): FoodItem | null => {
  const row = db.select().from(foodItems).where(eq(foodItems.id, id)).get();
  return row ? mapFoodRow(row) : null;
};
