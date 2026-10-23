import { db } from "@/services/db";
import * as schema from "@/services/db/schema";
import { MealType, SavedMeal, SavedMealItem } from "@/services/db/schema";
import type { SavedMealItemWithFood, SavedMealWithItems } from "@/types/types";
import { getFoodItem } from "@/services/db/repositories/foodRepository";
import { asc, desc, eq } from "drizzle-orm";

const mapRowToSavedMeal = (row: typeof schema.savedMeals.$inferSelect): SavedMeal => ({
  id: row.id,
  name: row.name,
  defaultMealType: row.defaultMealType as MealType,
  notes: row.notes,
  isFavorite: row.isFavorite,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const mapRowToSavedMealItem = (row: typeof schema.savedMealItems.$inferSelect): SavedMealItem => ({
  id: row.id,
  savedMealId: row.savedMealId,
  foodId: row.foodId,
  quantity: row.quantity,
  unit: row.unit,
  itemOrder: row.itemOrder,
});

export const getSavedMeals = (): SavedMealWithItems[] => {
  const meals = db
    .select()
    .from(schema.savedMeals)
    .orderBy(desc(schema.savedMeals.isFavorite), asc(schema.savedMeals.name))
    .all()
    .map(mapRowToSavedMeal);

  return meals.map((meal): SavedMealWithItems => {
    const items = db
      .select()
      .from(schema.savedMealItems)
      .where(eq(schema.savedMealItems.savedMealId, meal.id))
      .orderBy(asc(schema.savedMealItems.itemOrder), asc(schema.savedMealItems.id))
      .all()
      .map(mapRowToSavedMealItem)
      .map((item): SavedMealItemWithFood => ({
        ...item,
        food: getFoodItem(item.foodId),
      }));

    return {
      ...meal,
      defaultMealType: meal.defaultMealType as MealType,
      items,
    };
  });
};

export const getSavedMeal = (id: string): SavedMealWithItems | null => {
  return getSavedMeals().find((meal) => meal.id === id) ?? null;
};

export const createSavedMeal = ({
  name,
  defaultMealType,
  notes,
  isFavorite = false,
  items,
}: {
  name: string;
  defaultMealType: MealType;
  notes?: string;
  isFavorite?: boolean;
  items: { foodId: string; quantity: number; unit?: string }[];
}): SavedMealWithItems => {
  const now = Date.now();
  const mealId = `saved-meal-${now}`;

  db.insert(schema.savedMeals).values({
    id: mealId,
    name,
    defaultMealType,
    notes: notes ?? null,
    isFavorite,
    createdAt: now,
    updatedAt: now,
  }).run();

  items.forEach((item, index) => {
    const food = getFoodItem(item.foodId);
    db.insert(schema.savedMealItems).values({
      id: `${mealId}-item-${index}-${now}`,
      savedMealId: mealId,
      foodId: item.foodId,
      quantity: item.quantity,
      unit: item.unit ?? food?.servingUnit ?? 'g',
      itemOrder: index,
    }).run();
  });

  return getSavedMeal(mealId)!;
};

export const deleteSavedMeal = (id: string): void => {
  db.delete(schema.savedMealItems).where(eq(schema.savedMealItems.savedMealId, id)).run();
  db.delete(schema.savedMeals).where(eq(schema.savedMeals.id, id)).run();
};

