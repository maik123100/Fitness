import { db } from "@/services/db";
import * as schema from "@/services/db/schema";
import type { DailyNutrition } from "@/services/db/schema";
import { eq } from "drizzle-orm";

// ============== Daily Nutrition Functions ==============

export const updateDailyNutrition = (nutrition: DailyNutrition): void => {
  db.insert(schema.dailyNutrition).values({
    id: nutrition.id,
    date: nutrition.date,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat,
  }).onConflictDoUpdate({
    target: schema.dailyNutrition.id,
    set: {
      date: nutrition.date,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
    },
  }).run();
};

export const getDailyNutrition = (date: string): DailyNutrition | null => {
  return db
    .select()
    .from(schema.dailyNutrition)
    .where(eq(schema.dailyNutrition.date, date))
    .get() ?? null;
};
