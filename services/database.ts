import { formatDateToYYYYMMDD, parseDateFromYYYYMMDD } from '@/utils/dateHelpers';
import { db } from '@/services/db';
import * as schema from '@/services/db/schema';
import {
  Activity,
  DailyNutrition,
  FoodEntry,
  FoodItem,
  MealLog,
  MealLogItem,
  MealLogItemType,
  MealLogSourceType,
  MealType,
  Recipe,
  RecipeIngredient,
  SavedMeal,
  SavedMealItem,
  UserProfile,
  WeightEntry,
} from '@/services/db/schema';
import {
  ActiveWorkoutSession,
  MealLogItemDetail,
  MealLogWithItems,
  ExerciseTemplate,
  MineralFields,
  SavedMealItemWithFood,
  SavedMealWithItems,
  VitaminFields,
  WorkoutEntry,
  WorkoutTemplateExercise,
} from '@/types/types';
import { WorkoutTemplate } from '@/services/db/schema';
import { and, asc, desc, eq, like, sql } from 'drizzle-orm';

const VITAMIN_KEYS: (keyof VitaminFields)[] = [
  'vitaminA', 'vitaminC', 'vitaminD', 'vitaminB6', 'vitaminE', 'vitaminK',
  'thiamin', 'vitaminB12', 'riboflavin', 'folate', 'niacin', 'choline',
  'pantothenicAcid', 'biotin', 'carotenoids',
];

const MINERAL_KEYS: (keyof MineralFields)[] = [
  'calcium', 'chloride', 'chromium', 'copper', 'fluoride', 'iodine', 'iron',
  'magnesium', 'manganese', 'molybdenum', 'phosphorus', 'potassium',
  'selenium', 'sodium', 'zinc',
];

const ZERO_VITAMINS = (): VitaminFields => ({
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
});

const ZERO_MINERALS = (): MineralFields => ({
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
});

// ============== Food Database Functions ==============

export const addFoodItem = (food: FoodItem): void => {
  const now = Date.now();
  db.insert(schema.foodItems).values({
    id: food.id,
    name: food.name,
    brand: food.brand ?? null,
    barcode: food.barcode ?? null,
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
  db.delete(schema.foodItems).where(eq(schema.foodItems.id, foodItem.id)).run();
};

const mapRowToFoodItem = (row: any): FoodItem => ({
  id: row.id,
  name: row.name,
  brand: row.brand,
  barcode: row.barcode,
  sourceType: row.sourceType,
  category: row.category,
  calories: row.calories,
  protein: row.protein,
  carbs: row.carbs,
  fat: row.fat,
  fiber: row.fiber,
  vitaminA: row.vitaminA,
  vitaminC: row.vitaminC,
  vitaminD: row.vitaminD,
  vitaminB6: row.vitaminB6,
  vitaminE: row.vitaminE,
  vitaminK: row.vitaminK,
  thiamin: row.thiamin,
  vitaminB12: row.vitaminB12,
  riboflavin: row.riboflavin,
  folate: row.folate,
  niacin: row.niacin,
  choline: row.choline,
  pantothenicAcid: row.pantothenicAcid,
  biotin: row.biotin,
  carotenoids: row.carotenoids,
  calcium: row.calcium,
  chloride: row.chloride,
  chromium: row.chromium,
  copper: row.copper,
  fluoride: row.fluoride,
  iodine: row.iodine,
  iron: row.iron,
  magnesium: row.magnesium,
  manganese: row.manganese,
  molybdenum: row.molybdenum,
  phosphorus: row.phosphorus,
  potassium: row.potassium,
  selenium: row.selenium,
  sodium: row.sodium,
  zinc: row.zinc,
  servingSize: row.servingSize,
  servingUnit: row.servingUnit,
  isVerified: row.isVerified,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const mapRowToSavedMeal = (row: any): SavedMeal => ({
  id: row.id,
  name: row.name,
  defaultMealType: row.defaultMealType as MealType,
  notes: row.notes,
  isFavorite: row.isFavorite,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const mapRowToSavedMealItem = (row: any): SavedMealItem => ({
  id: row.id,
  savedMealId: row.savedMealId,
  foodId: row.foodId,
  quantity: row.quantity,
  unit: row.unit,
  itemOrder: row.itemOrder,
});

const mapRowToMealLog = (row: any): MealLog => ({
  id: row.id,
  date: row.date,
  mealType: row.mealType as MealType,
  title: row.title,
  sourceType: row.sourceType as MealLogSourceType,
  sourceId: row.sourceId,
  totalCalories: row.totalCalories,
  totalProtein: row.totalProtein,
  totalCarbs: row.totalCarbs,
  totalFat: row.totalFat,
  totalFiber: row.totalFiber,
  createdAt: row.createdAt,
});

const mapRowToMealLogItem = (row: any): MealLogItem => ({
  id: row.id,
  mealLogId: row.mealLogId,
  foodEntryId: row.foodEntryId,
  foodId: row.foodId,
  entryType: row.entryType as MealLogItemType,
  title: row.title,
  quantity: row.quantity,
  unit: row.unit,
  totalCalories: row.totalCalories,
  totalProtein: row.totalProtein,
  totalCarbs: row.totalCarbs,
  totalFat: row.totalFat,
  totalFiber: row.totalFiber,
  vitaminA: row.vitaminA ?? 0,
  vitaminC: row.vitaminC ?? 0,
  vitaminD: row.vitaminD ?? 0,
  vitaminB6: row.vitaminB6 ?? 0,
  vitaminE: row.vitaminE ?? 0,
  vitaminK: row.vitaminK ?? 0,
  thiamin: row.thiamin ?? 0,
  vitaminB12: row.vitaminB12 ?? 0,
  riboflavin: row.riboflavin ?? 0,
  folate: row.folate ?? 0,
  niacin: row.niacin ?? 0,
  choline: row.choline ?? 0,
  pantothenicAcid: row.pantothenicAcid ?? 0,
  biotin: row.biotin ?? 0,
  carotenoids: row.carotenoids ?? 0,
  calcium: row.calcium ?? 0,
  chloride: row.chloride ?? 0,
  chromium: row.chromium ?? 0,
  copper: row.copper ?? 0,
  fluoride: row.fluoride ?? 0,
  iodine: row.iodine ?? 0,
  iron: row.iron ?? 0,
  magnesium: row.magnesium ?? 0,
  manganese: row.manganese ?? 0,
  molybdenum: row.molybdenum ?? 0,
  phosphorus: row.phosphorus ?? 0,
  potassium: row.potassium ?? 0,
  selenium: row.selenium ?? 0,
  sodium: row.sodium ?? 0,
  zinc: row.zinc ?? 0,
  createdAt: row.createdAt,
});

const scaleMicros = (food: FoodItem, ratio: number) => {
  const vitamins = ZERO_VITAMINS();
  const minerals = ZERO_MINERALS();

  for (const key of VITAMIN_KEYS) {
    vitamins[key] = (food[key] || 0) * ratio;
  }

  for (const key of MINERAL_KEYS) {
    minerals[key] = (food[key] || 0) * ratio;
  }

  return { vitamins, minerals };
};

const createMealLogItemFromFood = (
  mealLogId: string,
  title: string,
  food: FoodItem,
  quantity: number,
  unit: string,
  createdAt: number,
  foodEntryId: string | null = null
): MealLogItem => {
  const ratio = food.servingSize > 0 ? quantity / food.servingSize : 0;
  const micros = scaleMicros(food, ratio);

  return {
    id: `${mealLogId}-${food.id}-${createdAt}`,
    mealLogId,
    foodEntryId,
    foodId: food.id,
    entryType: food.sourceType === 'direct' ? 'direct' : 'product',
    title,
    quantity,
    unit,
    totalCalories: food.calories * ratio,
    totalProtein: food.protein * ratio,
    totalCarbs: food.carbs * ratio,
    totalFat: food.fat * ratio,
    totalFiber: food.fiber * ratio,
    ...micros.vitamins,
    ...micros.minerals,
    createdAt,
  } as MealLogItem;
};

const aggregateMealLogItems = (items: Array<MealLogItem | MealLogItemDetail>) => {
  const totalVitamins = ZERO_VITAMINS();
  const totalMinerals = ZERO_MINERALS();

  const totals = items.reduce((acc, item) => {
    acc.totalCalories += item.totalCalories;
    acc.totalProtein += item.totalProtein;
    acc.totalCarbs += item.totalCarbs;
    acc.totalFat += item.totalFat;
    acc.totalFiber += item.totalFiber;

    for (const key of VITAMIN_KEYS) {
      totalVitamins[key] = (totalVitamins[key] || 0) + (item[key] || 0);
    }

    for (const key of MINERAL_KEYS) {
      totalMinerals[key] = (totalMinerals[key] || 0) + (item[key] || 0);
    }

    return acc;
  }, {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalFiber: 0,
  });

  return {
    ...totals,
    totalVitamins,
    totalMinerals,
  };
};

const getMealLogItems = (mealLogId: string): MealLogItemDetail[] => {
  return db
    .select()
    .from(schema.mealLogItems)
    .where(eq(schema.mealLogItems.mealLogId, mealLogId))
    .orderBy(asc(schema.mealLogItems.createdAt))
    .all()
    .map((row) => mapRowToMealLogItem(row) as MealLogItemDetail);
};

const getMealLogsForDateDetailed = (date: string): MealLogWithItems[] => {
  const logs = db
    .select()
    .from(schema.mealLogs)
    .where(eq(schema.mealLogs.date, date))
    .orderBy(desc(schema.mealLogs.createdAt))
    .all()
    .map(mapRowToMealLog);

  return logs.map((log): MealLogWithItems => ({
    ...log,
    mealType: log.mealType as MealType,
    sourceType: log.sourceType as MealLogSourceType,
    items: getMealLogItems(log.id),
  }));
};

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
  items: Array<{ foodId: string; quantity: number; unit?: string }>;
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

export const logQuickProductMeal = ({
  foodId,
  quantity,
  mealType,
  date,
}: {
  foodId: string;
  quantity: number;
  mealType: MealType;
  date: string;
}): MealLogWithItems | null => {
  const food = getFoodItem(foodId);
  if (!food) return null;

  const createdAt = Date.now();
  const mealLogId = `meal-log-${createdAt}`;
  const mealItem = createMealLogItemFromFood(mealLogId, food.name, food, quantity, food.servingUnit, createdAt);

  db.insert(schema.mealLogs).values({
    id: mealLogId,
    date,
    mealType,
    title: food.name,
    sourceType: 'quick_product',
    sourceId: food.id,
    totalCalories: mealItem.totalCalories,
    totalProtein: mealItem.totalProtein,
    totalCarbs: mealItem.totalCarbs,
    totalFat: mealItem.totalFat,
    totalFiber: mealItem.totalFiber,
    createdAt,
  }).run();

  const foodEntryId = `food-entry-${createdAt}`;
  addFoodEntry({
    id: foodEntryId,
    foodId: food.id,
    mealLogId,
    date,
    mealType,
    quantity,
    unit: food.servingUnit,
    totalCalories: mealItem.totalCalories,
    totalProtein: mealItem.totalProtein,
    totalCarbs: mealItem.totalCarbs,
    totalFat: mealItem.totalFat,
    totalFiber: mealItem.totalFiber,
    createdAt,
  });

  db.insert(schema.mealLogItems).values({
    ...mealItem,
    id: `${mealLogId}-item-0`,
    foodEntryId,
  }).run();

  return getMealLogsForDateDetailed(date).find((log) => log.id === mealLogId) ?? null;
};

export const logDirectMeal = ({
  title,
  mealType,
  date,
  nutrients,
}: {
  title: string;
  mealType: MealType;
  date: string;
  nutrients: Pick<FoodItem, 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber'> & Partial<VitaminFields> & Partial<MineralFields>;
}): MealLogWithItems => {
  const createdAt = Date.now();
  const mealLogId = `meal-log-${createdAt}`;
  const directFoodId = `direct-food-${createdAt}`;
  const directMicros = {
    ...ZERO_VITAMINS(),
    ...ZERO_MINERALS(),
    ...nutrients,
  };

  const directFood: FoodItem = {
    id: directFoodId,
    name: title,
    brand: 'Direct meal',
    barcode: null,
    sourceType: 'direct',
    category: 'prepared',
    calories: directMicros.calories,
    protein: directMicros.protein,
    carbs: directMicros.carbs,
    fat: directMicros.fat,
    fiber: directMicros.fiber,
    servingSize: 1,
    servingUnit: 'meal',
    isVerified: false,
    createdAt,
    updatedAt: createdAt,
    vitaminA: directMicros.vitaminA ?? 0,
    vitaminC: directMicros.vitaminC ?? 0,
    vitaminD: directMicros.vitaminD ?? 0,
    vitaminB6: directMicros.vitaminB6 ?? 0,
    vitaminE: directMicros.vitaminE ?? 0,
    vitaminK: directMicros.vitaminK ?? 0,
    thiamin: directMicros.thiamin ?? 0,
    vitaminB12: directMicros.vitaminB12 ?? 0,
    riboflavin: directMicros.riboflavin ?? 0,
    folate: directMicros.folate ?? 0,
    niacin: directMicros.niacin ?? 0,
    choline: directMicros.choline ?? 0,
    pantothenicAcid: directMicros.pantothenicAcid ?? 0,
    biotin: directMicros.biotin ?? 0,
    carotenoids: directMicros.carotenoids ?? 0,
    calcium: directMicros.calcium ?? 0,
    chloride: directMicros.chloride ?? 0,
    chromium: directMicros.chromium ?? 0,
    copper: directMicros.copper ?? 0,
    fluoride: directMicros.fluoride ?? 0,
    iodine: directMicros.iodine ?? 0,
    iron: directMicros.iron ?? 0,
    magnesium: directMicros.magnesium ?? 0,
    manganese: directMicros.manganese ?? 0,
    molybdenum: directMicros.molybdenum ?? 0,
    phosphorus: directMicros.phosphorus ?? 0,
    potassium: directMicros.potassium ?? 0,
    selenium: directMicros.selenium ?? 0,
    sodium: directMicros.sodium ?? 0,
    zinc: directMicros.zinc ?? 0,
  } as FoodItem;

  addFoodItem(directFood);
  const mealItem = createMealLogItemFromFood(mealLogId, title, directFood, 1, 'meal', createdAt);

  db.insert(schema.mealLogs).values({
    id: mealLogId,
    date,
    mealType,
    title,
    sourceType: 'direct_meal',
    sourceId: directFoodId,
    totalCalories: mealItem.totalCalories,
    totalProtein: mealItem.totalProtein,
    totalCarbs: mealItem.totalCarbs,
    totalFat: mealItem.totalFat,
    totalFiber: mealItem.totalFiber,
    createdAt,
  }).run();

  db.insert(schema.mealLogItems).values({
    ...mealItem,
    id: `${mealLogId}-item-0`,
  }).run();

  return getMealLogsForDateDetailed(date).find((log) => log.id === mealLogId)!;
};

export const logSavedMeal = ({
  savedMealId,
  mealType,
  date,
  itemQuantities,
}: {
  savedMealId: string;
  mealType: MealType;
  date: string;
  itemQuantities: Record<string, number>;
}): MealLogWithItems | null => {
  const savedMeal = getSavedMeal(savedMealId);
  if (!savedMeal) return null;

  const createdAt = Date.now();
  const mealLogId = `meal-log-${createdAt}`;
  const items = savedMeal.items
    .map((item, index) => {
      if (!item.food) return null;
      const quantity = itemQuantities[item.id] ?? item.quantity;
      const mealItem = createMealLogItemFromFood(
        mealLogId,
        item.food.name,
        item.food,
        quantity,
        item.unit || item.food.servingUnit,
        createdAt + index
      );

      return { item, mealItem, quantity };
    })
    .filter((value): value is NonNullable<typeof value> => value !== null);

  const totals = aggregateMealLogItems(items.map(({ mealItem }) => mealItem));

  db.insert(schema.mealLogs).values({
    id: mealLogId,
    date,
    mealType,
    title: savedMeal.name,
    sourceType: 'saved_meal',
    sourceId: savedMeal.id,
    totalCalories: totals.totalCalories,
    totalProtein: totals.totalProtein,
    totalCarbs: totals.totalCarbs,
    totalFat: totals.totalFat,
    totalFiber: totals.totalFiber,
    createdAt,
  }).run();

  items.forEach(({ item, mealItem, quantity }, index) => {
    const foodEntryId = `food-entry-${createdAt}-${index}`;
    addFoodEntry({
      id: foodEntryId,
      foodId: item.foodId,
      mealLogId,
      date,
      mealType,
      quantity,
      unit: mealItem.unit,
      totalCalories: mealItem.totalCalories,
      totalProtein: mealItem.totalProtein,
      totalCarbs: mealItem.totalCarbs,
      totalFat: mealItem.totalFat,
      totalFiber: mealItem.totalFiber,
      createdAt: mealItem.createdAt,
    });

    db.insert(schema.mealLogItems).values({
      ...mealItem,
      id: `${mealLogId}-item-${index}`,
      foodEntryId,
    }).run();
  });

  return getMealLogsForDateDetailed(date).find((log) => log.id === mealLogId) ?? null;
};

export const getAllFoodItems = (options?: { includeDirect?: boolean }): FoodItem[] => {
  const rows = db.select().from(schema.foodItems).orderBy(asc(schema.foodItems.name)).all();
  const includeDirect = options?.includeDirect ?? false;
  return rows
    .map(mapRowToFoodItem)
    .filter((item) => includeDirect || item.sourceType !== 'direct');
};

export const searchFoodItems = (query: string, category?: string, limit: number = 20): FoodItem[] => {
  const conditions = [like(schema.foodItems.name, `%${query}%`), eq(schema.foodItems.sourceType, 'product')];

  if (category) {
    conditions.push(eq(schema.foodItems.category, category));
  }

  const rows = db
    .select()
    .from(schema.foodItems)
    .where(conditions.length > 1 ? and(...conditions) : conditions[0])
    .orderBy(desc(schema.foodItems.isVerified), asc(schema.foodItems.name))
    .limit(limit)
    .all();

  return rows.map(mapRowToFoodItem);
};

export const getFoodItem = (id: string): FoodItem | null => {
  const row = db.select().from(schema.foodItems).where(eq(schema.foodItems.id, id)).get();
  return row ? mapRowToFoodItem(row) : null;
};

// ============== Food Entry Functions ==============

export const addFoodEntry = (entry: FoodEntry): void => {
  db.insert(schema.foodEntries).values({
    id: entry.id,
    foodId: entry.foodId,
    mealLogId: entry.mealLogId ?? null,
    date: entry.date,
    mealType: entry.mealType,
    quantity: entry.quantity,
    unit: entry.unit,
    totalCalories: entry.totalCalories,
    totalProtein: entry.totalProtein,
    totalCarbs: entry.totalCarbs,
    totalFat: entry.totalFat,
    totalFiber: entry.totalFiber,
    createdAt: entry.createdAt,
  }).run();
};

export const getFoodEntriesForDate = (date: string): FoodEntry[] => {
  const mealLogs = getMealLogsForDateDetailed(date);
  const legacyEntries = db
    .select()
    .from(schema.foodEntries)
    .where(eq(schema.foodEntries.date, date))
    .orderBy(desc(schema.foodEntries.createdAt))
    .all()
    .map(row => ({
      id: row.id,
      foodId: row.foodId,
      mealLogId: row.mealLogId,
      date: row.date,
      mealType: row.mealType as any,
      quantity: row.quantity,
      unit: row.unit,
      totalCalories: row.totalCalories,
      totalProtein: row.totalProtein,
      totalCarbs: row.totalCarbs,
      totalFat: row.totalFat,
      totalFiber: row.totalFiber,
      createdAt: row.createdAt,
    }));

  const mealLogBackedIds = new Set(legacyEntries.filter((entry) => entry.mealLogId).map((entry) => entry.id));
  const mealTypeByLogId = mealLogs.reduce((acc, log) => {
    acc[log.id] = log.mealType;
    return acc;
  }, {} as Record<string, MealType>);

  const mealLogEntries = mealLogs
    .flatMap((log) => log.items)
    .filter((item) => item.foodId)
    .filter((item) => !item.foodEntryId || !mealLogBackedIds.has(item.foodEntryId))
    .map((item) => ({
      id: item.foodEntryId ?? item.id,
      foodId: item.foodId!,
      mealLogId: item.mealLogId,
      date,
      mealType: mealTypeByLogId[item.mealLogId] ?? 'breakfast',
      quantity: item.quantity,
      unit: item.unit,
      totalCalories: item.totalCalories,
      totalProtein: item.totalProtein,
      totalCarbs: item.totalCarbs,
      totalFat: item.totalFat,
      totalFiber: item.totalFiber,
      createdAt: item.createdAt,
    } as FoodEntry));

  return [...legacyEntries, ...mealLogEntries].sort((a, b) => b.createdAt - a.createdAt);
};

export const deleteFoodEntry = (id: string): void => {
  const entry = db.select().from(schema.foodEntries).where(eq(schema.foodEntries.id, id)).get();
  if (!entry) {
    const mealLogItem = db.select().from(schema.mealLogItems).where(eq(schema.mealLogItems.id, id)).get();
    if (!mealLogItem) return;

    const mealLogId = mealLogItem.mealLogId;
    const mealLog = db.select().from(schema.mealLogs).where(eq(schema.mealLogs.id, mealLogId)).get();
    const directFoodIds = db
      .select()
      .from(schema.mealLogItems)
      .where(eq(schema.mealLogItems.mealLogId, mealLogId))
      .all()
      .map((item) => item.foodId)
      .filter((foodId): foodId is string => Boolean(foodId))
      .filter((foodId) => getFoodItem(foodId)?.sourceType === 'direct');

    db.delete(schema.mealLogItems).where(eq(schema.mealLogItems.mealLogId, mealLogId)).run();
    db.delete(schema.mealLogs).where(eq(schema.mealLogs.id, mealLogId)).run();

    directFoodIds.forEach((foodId) => {
      db.delete(schema.foodItems).where(eq(schema.foodItems.id, foodId)).run();
    });

    if (mealLog?.sourceType === 'saved_meal' || mealLog?.sourceType === 'direct_meal') {
      db.delete(schema.foodEntries).where(eq(schema.foodEntries.mealLogId, mealLogId)).run();
    }
    return;
  }

  if (entry.mealLogId) {
    db.delete(schema.mealLogItems).where(eq(schema.mealLogItems.mealLogId, entry.mealLogId)).run();
    db.delete(schema.mealLogs).where(eq(schema.mealLogs.id, entry.mealLogId)).run();
    const relatedEntries = db.select().from(schema.foodEntries).where(eq(schema.foodEntries.mealLogId, entry.mealLogId)).all();
    const relatedFoodIds = Array.from(new Set(relatedEntries.map((item) => item.foodId)));
    db.delete(schema.foodEntries).where(eq(schema.foodEntries.mealLogId, entry.mealLogId)).run();

    relatedFoodIds.forEach((foodId) => {
      const food = getFoodItem(foodId);
      if (food?.sourceType === 'direct') {
        db.delete(schema.foodItems).where(eq(schema.foodItems.id, foodId)).run();
      }
    });
    return;
  }

  db.delete(schema.foodEntries).where(eq(schema.foodEntries.id, id)).run();
};

// ============== Workout Functions ==============

export const addWorkoutTemplate = (template: WorkoutTemplate): void => {
  db.insert(schema.workoutTemplates).values({
    id: template.id,
    name: template.name,
  }).run();
};

export const getWorkoutTemplates = (): WorkoutTemplate[] => {
  return db.select().from(schema.workoutTemplates).all();
};

export const getWorkoutTemplate = (id: string): WorkoutTemplate | null => {
  return db.select().from(schema.workoutTemplates).where(eq(schema.workoutTemplates.id, id)).get() ?? null;
};

export const addExerciseTemplate = (template: ExerciseTemplate): void => {
  db.insert(schema.exerciseTemplates).values({
    id: template.id,
    name: template.name,
    defaultSetTargets: JSON.stringify(template.defaultSetTargets),
  }).run();
};

export const getExerciseTemplates = (): ExerciseTemplate[] => {
  return db.select().from(schema.exerciseTemplates).all().map(row => ({
    id: row.id,
    name: row.name,
    defaultSetTargets: JSON.parse(row.defaultSetTargets),
  }));
};

export const getExerciseTemplate = (id: string): ExerciseTemplate | null => {
  const row = db.select().from(schema.exerciseTemplates).where(eq(schema.exerciseTemplates.id, id)).get();
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    defaultSetTargets: JSON.parse(row.defaultSetTargets),
  };
};

export const deleteExerciseTemplate = (id: string): void => {
  db.delete(schema.exerciseTemplates).where(eq(schema.exerciseTemplates.id, id)).run();
};

export const updateExerciseTemplate = (template: ExerciseTemplate): void => {
  db.update(schema.exerciseTemplates)
    .set({
      name: template.name,
      defaultSetTargets: JSON.stringify(template.defaultSetTargets),
    })
    .where(eq(schema.exerciseTemplates.id, template.id))
    .run();
};

export const addWorkoutTemplateExercise = (exercise: WorkoutTemplateExercise): void => {
  db.insert(schema.workoutTemplateExercises).values({
    id: exercise.id,
    workoutTemplateId: exercise.workoutTemplateId,
    exerciseTemplateId: exercise.exerciseTemplateId,
    setTargets: JSON.stringify(exercise.setTargets),
    order: exercise.order,
  }).run();
};

export const getWorkoutTemplateExercises = (templateId: string): WorkoutTemplateExercise[] => {
  return db
    .select()
    .from(schema.workoutTemplateExercises)
    .where(eq(schema.workoutTemplateExercises.workoutTemplateId, templateId))
    .orderBy(asc(schema.workoutTemplateExercises.order))
    .all()
    .map(row => ({
      id: row.id,
      workoutTemplateId: row.workoutTemplateId,
      exerciseTemplateId: row.exerciseTemplateId,
      setTargets: JSON.parse(row.setTargets),
      order: row.order,
    }));
};

// ============== Active Workout Session Functions ==============

export const startWorkoutSession = (templateId: string, date: string): ActiveWorkoutSession => {
  // Delete any existing session
  db.delete(schema.activeWorkoutSession).run();

  const exercises = getWorkoutTemplateExercises(templateId);
  const sets: any[] = exercises.flatMap(exercise => {
    const exerciseTemplate = getExerciseTemplate(exercise.exerciseTemplateId);
    if (!exerciseTemplate) return [];
    return exercise.setTargets.map((target: any, index: number) => ({
      id: `${exercise.id}-${index}`,
      workoutTemplateExerciseId: exercise.id,
      weight: 0,
      reps: 0,
      targetReps: target.reps,
      targetWeight: target.weight,
      completed: false,
    }));
  });

  const newSession: ActiveWorkoutSession = {
    id: Date.now().toString(),
    workoutTemplateId: templateId,
    startTime: Date.now(),
    date: date,
    sets,
  };

  db.insert(schema.activeWorkoutSession).values({
    id: newSession.id,
    workoutTemplateId: newSession.workoutTemplateId,
    startTime: newSession.startTime,
    date: newSession.date,
    sets: JSON.stringify(newSession.sets),
  }).run();

  return newSession;
};

export const getActiveWorkoutSession = (): ActiveWorkoutSession | null => {
  const row = db.select().from(schema.activeWorkoutSession).limit(1).get();
  if (!row) return null;

  return {
    id: row.id,
    workoutTemplateId: row.workoutTemplateId,
    startTime: row.startTime,
    date: row.date,
    sets: JSON.parse(row.sets),
  };
};

export const updateActiveWorkoutSession = (session: ActiveWorkoutSession): void => {
  db.update(schema.activeWorkoutSession)
    .set({ sets: JSON.stringify(session.sets) })
    .where(eq(schema.activeWorkoutSession.id, session.id))
    .run();
};

export const finishWorkoutSession = (session: ActiveWorkoutSession, caloriesBurned: number = 0): void => {
  const newEntry: WorkoutEntry = {
    id: Date.now().toString(),
    workoutTemplateId: session.workoutTemplateId,
    date: session.date,
    duration: Math.round((Date.now() - session.startTime) / 60000),
    caloriesBurned: caloriesBurned,
    sets: session.sets.filter((s: any) => s.completed),
    createdAt: Date.now(),
  };

  db.insert(schema.workoutEntries).values({
    id: newEntry.id,
    workoutTemplateId: newEntry.workoutTemplateId,
    date: newEntry.date,
    duration: newEntry.duration,
    caloriesBurned: newEntry.caloriesBurned,
    sets: JSON.stringify(newEntry.sets),
    createdAt: newEntry.createdAt,
  }).run();

  db.delete(schema.activeWorkoutSession).run();
};

// ============== Workout Entry Functions ==============

export const getWorkoutEntries = (date: string): WorkoutEntry[] => {
  return db
    .select()
    .from(schema.workoutEntries)
    .where(eq(schema.workoutEntries.date, date))
    .orderBy(desc(schema.workoutEntries.createdAt))
    .all()
    .map(row => ({
      id: row.id,
      workoutTemplateId: row.workoutTemplateId,
      date: row.date,
      duration: row.duration,
      caloriesBurned: row.caloriesBurned || 0,
      sets: JSON.parse(row.sets),
      createdAt: row.createdAt,
    }));
};

export const getWorkoutEntry = (id: string): WorkoutEntry | null => {
  const row = db.select().from(schema.workoutEntries).where(eq(schema.workoutEntries.id, id)).get();
  if (!row) return null;
  return {
    id: row.id,
    workoutTemplateId: row.workoutTemplateId,
    date: row.date,
    duration: row.duration,
    caloriesBurned: row.caloriesBurned || 0,
    sets: JSON.parse(row.sets),
    createdAt: row.createdAt,
  };
};

export const updateWorkoutEntry = (entry: WorkoutEntry): void => {
  db.update(schema.workoutEntries)
    .set({
      duration: entry.duration,
      caloriesBurned: entry.caloriesBurned,
      sets: JSON.stringify(entry.sets),
    })
    .where(eq(schema.workoutEntries.id, entry.id))
    .run();
};

export const deleteWorkoutEntry = (id: string): void => {
  db.delete(schema.workoutEntries).where(eq(schema.workoutEntries.id, id)).run();
};

// ============== User Profile Functions ==============

export const saveUserProfile = (profile: UserProfile): void => {
  const now = Date.now();

  db.insert(schema.userProfile).values({
    id: profile.id,
    birthdate: profile.birthdate,
    gender: profile.gender,
    height: profile.height,
    weight: profile.weight,
    activityLevel: profile.activityLevel,
    goalType: profile.goalType,
    targetWeight: profile.targetWeight ?? null,
    targetCalories: profile.targetCalories,
    targetProtein: profile.targetProtein,
    targetCarbs: profile.targetCarbs,
    targetFat: profile.targetFat,
    createdAt: profile.createdAt || now,
    updatedAt: now,
  }).onConflictDoUpdate({
    target: schema.userProfile.id,
    set: {
      birthdate: profile.birthdate,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      activityLevel: profile.activityLevel,
      goalType: profile.goalType,
      targetWeight: profile.targetWeight ?? null,
      targetCalories: profile.targetCalories,
      targetProtein: profile.targetProtein,
      targetCarbs: profile.targetCarbs,
      targetFat: profile.targetFat,
      updatedAt: now,
    },
  }).run();

  // Add a corresponding weight entry
  const weightEntry: WeightEntry = {
    id: `weight-${now}`,
    weight: profile.weight,
    date: new Date().toISOString().split('T')[0],
    createdAt: now,
  };
  addWeightEntry(weightEntry);
};

export const getUserProfile = (): UserProfile | null => {
  const row = db
    .select()
    .from(schema.userProfile)
    .orderBy(desc(schema.userProfile.updatedAt))
    .limit(1)
    .get();

  if (!row) return null;

  return row as UserProfile;
};

// ============== Weight Tracking Functions ==============

export const addWeightEntry = (entry: WeightEntry): void => {
  db.insert(schema.weightEntries).values({
    id: entry.id,
    weight: entry.weight,
    date: entry.date,
    createdAt: entry.createdAt,
  }).run();
};

export const getWeightEntries = (limit: number = 30): WeightEntry[] => {
  return db
    .select()
    .from(schema.weightEntries)
    .orderBy(desc(schema.weightEntries.date))
    .limit(limit)
    .all();
};

// ============== Nutrition Summary Functions ==============

export const getNutritionSummary = (date: string): any => {
  const mealLogs = getMealLogsForDateDetailed(date);
  const totals = aggregateMealLogItems(mealLogs.flatMap((log) => log.items));
  const legacyEntries = db
    .select()
    .from(schema.foodEntries)
    .where(and(eq(schema.foodEntries.date, date), sql`${schema.foodEntries.mealLogId} IS NULL`))
    .all();
  const allFoodItems = getAllFoodItems({ includeDirect: true });
  const foodItemsById = allFoodItems.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string, FoodItem>);

  for (const entry of legacyEntries) {
    const food = foodItemsById[entry.foodId];
    if (!food || !food.servingSize) continue;
    const ratio = entry.quantity / food.servingSize;
    totals.totalCalories += food.calories * ratio;
    totals.totalProtein += food.protein * ratio;
    totals.totalCarbs += food.carbs * ratio;
    totals.totalFat += food.fat * ratio;
    totals.totalFiber += food.fiber * ratio;

    for (const key of VITAMIN_KEYS) {
      totals.totalVitamins[key] = (totals.totalVitamins[key] || 0) + ((food[key] || 0) * ratio);
    }

    for (const key of MINERAL_KEYS) {
      totals.totalMinerals[key] = (totals.totalMinerals[key] || 0) + ((food[key] || 0) * ratio);
    }
  }

  const workoutEntries = getWorkoutEntries(date);
  const caloriesBurned = workoutEntries.reduce((total, workout) => {
    return total + (workout.caloriesBurned || 0);
  }, 0);

  return {
    date,
    totalCalories: totals.totalCalories,
    totalProtein: totals.totalProtein,
    totalCarbs: totals.totalCarbs,
    totalFat: totals.totalFat,
    totalFiber: totals.totalFiber,
    totalVitamins: totals.totalVitamins,
    totalMinerals: totals.totalMinerals,
    caloriesBurned: caloriesBurned,
    netCalories: totals.totalCalories - caloriesBurned,
  };
};

export const getCalorieIntakeForPeriod = (startDate: string, endDate: string): { date: string, totalCalories: number, targetCalories: number }[] => {
  const userProfile = getUserProfile();
  const baseTargetCalories = userProfile?.targetCalories || 0;

  const workoutEntries = db
    .select()
    .from(schema.workoutEntries)
    .where(and(
      sql`${schema.workoutEntries.date} >= ${startDate}`,
      sql`${schema.workoutEntries.date} <= ${endDate}`
    ))
    .all();

  const dailyCalories: { [date: string]: number } = {};
  const dailyBurned: { [date: string]: number } = {};

  let currentNutritionDate = parseDateFromYYYYMMDD(startDate);
  const endNutritionDate = parseDateFromYYYYMMDD(endDate);

  while (currentNutritionDate <= endNutritionDate) {
    const dateString = formatDateToYYYYMMDD(currentNutritionDate);
    dailyCalories[dateString] = getNutritionSummary(dateString).totalCalories;
    currentNutritionDate.setDate(currentNutritionDate.getDate() + 1);
  }

  for (const entry of workoutEntries) {
    if (!dailyBurned[entry.date]) {
      dailyBurned[entry.date] = 0;
    }
    dailyBurned[entry.date] += entry.caloriesBurned || 0;
  }

  const result: { date: string, totalCalories: number, targetCalories: number }[] = [];

  // Parse the dates properly in local timezone to avoid timezone issues
  let currentDate = parseDateFromYYYYMMDD(startDate);
  const end = parseDateFromYYYYMMDD(endDate);

  while (currentDate <= end) {
    const dateString = formatDateToYYYYMMDD(currentDate);

    const burned = dailyBurned[dateString] || 0;
    result.push({
      date: dateString,
      totalCalories: dailyCalories[dateString] || 0,
      targetCalories: baseTargetCalories + burned,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
};

export const getExerciseProgression = (exerciseTemplateId: string, period: number): { date: string, sets: { weight: number, reps: number }[] }[] => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - period + 1);

  const startDateString = startDate.toISOString().split('T')[0];
  const endDateString = endDate.toISOString().split('T')[0];

  const workoutTemplateExercises = db
    .select()
    .from(schema.workoutTemplateExercises)
    .where(eq(schema.workoutTemplateExercises.exerciseTemplateId, exerciseTemplateId))
    .all();

  const workoutTemplateExerciseIds = workoutTemplateExercises.map(wte => wte.id);

  if (workoutTemplateExerciseIds.length === 0) {
    return [];
  }

  const workoutEntries = db
    .select()
    .from(schema.workoutEntries)
    .where(and(
      sql`${schema.workoutEntries.date} >= ${startDateString}`,
      sql`${schema.workoutEntries.date} <= ${endDateString}`
    ))
    .all();

  const progression: { [date: string]: { weight: number, reps: number }[] } = {};

  for (const entry of workoutEntries) {
    const sets = JSON.parse(entry.sets) as any[];
    const relevantSets = sets.filter(set => workoutTemplateExerciseIds.includes(set.workoutTemplateExerciseId));

    if (relevantSets.length > 0) {
      if (!progression[entry.date]) {
        progression[entry.date] = [];
      }
      progression[entry.date].push(...relevantSets.map(s => ({ weight: s.weight, reps: s.reps })));
    }
  }

  return Object.keys(progression).map(date => ({
    date,
    sets: progression[date],
  }));
};

// ============== Activity Functions ==============

export const addActivity = (activity: Activity): void => {
  db.insert(schema.activities).values({
    id: activity.id,
    activity: activity.activity,
    calories: activity.calories,
    type: activity.type,
    timestamp: activity.timestamp,
  }).run();
};

export const getRecentActivities = (limit: number = 10): Activity[] => {
  return db
    .select()
    .from(schema.activities)
    .orderBy(desc(schema.activities.timestamp))
    .limit(limit)
    .all() as Activity[];
};

export const updateActivity = (activity: Activity): void => {
  db.update(schema.activities)
    .set({
      activity: activity.activity,
      calories: activity.calories,
    })
    .where(eq(schema.activities.id, activity.id))
    .run();
};

export const deleteActivity = (id: string): void => {
  db.delete(schema.activities).where(eq(schema.activities.id, id)).run();
};

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
