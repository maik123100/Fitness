import { eq, like, and, desc, asc, sql } from 'drizzle-orm';
import { db } from '@/services/db';
import * as schema from '@/services/db/schema';
import {
  Activity,
  DailyNutrition,
  FoodItem,
  FoodEntry,
  Recipe,
  RecipeIngredient,
  WorkoutTemplate,
  WorkoutTemplateExercise,
  ExerciseTemplate,
  WorkoutEntry,
  ActiveWorkoutSession,
  UserProfile,
  WeightEntry,
  VitaminFields,
  MineralFields,
} from '@/types/types';
import { parseDateFromYYYYMMDD, formatDateToYYYYMMDD } from '@/app/utils/dateHelpers';

// ============== Food Database Functions ==============

export const addFoodItem = (food: FoodItem): void => {
  const now = Date.now();
  db.insert(schema.foodItems).values({
    id: food.id,
    name: food.name,
    brand: food.brand ?? null,
    barcode: food.barcode ?? null,
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

export const getAllFoodItems = (): FoodItem[] => {
  const rows = db.select().from(schema.foodItems).all();
  return rows.map(mapRowToFoodItem);
};

export const searchFoodItems = (query: string, category?: string, limit: number = 20): FoodItem[] => {
  const conditions = [like(schema.foodItems.name, `%${query}%`)];
  
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
  return db
    .select()
    .from(schema.foodEntries)
    .where(eq(schema.foodEntries.date, date))
    .orderBy(desc(schema.foodEntries.createdAt))
    .all()
    .map(row => ({
      id: row.id,
      foodId: row.foodId,
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
};

export const deleteFoodEntry = (id: string): void => {
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
    defaultSetTargets: JSON.stringify(template.default_set_targets),
  }).run();
};

export const getExerciseTemplates = (): ExerciseTemplate[] => {
  return db.select().from(schema.exerciseTemplates).all().map(row => ({
    id: row.id,
    name: row.name,
    default_set_targets: JSON.parse(row.defaultSetTargets),
  }));
};

export const getExerciseTemplate = (id: string): ExerciseTemplate | null => {
  const row = db.select().from(schema.exerciseTemplates).where(eq(schema.exerciseTemplates.id, id)).get();
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    default_set_targets: JSON.parse(row.defaultSetTargets),
  };
};

export const deleteExerciseTemplate = (id: string): void => {
  db.delete(schema.exerciseTemplates).where(eq(schema.exerciseTemplates.id, id)).run();
};

export const updateExerciseTemplate = (template: ExerciseTemplate): void => {
  db.update(schema.exerciseTemplates)
    .set({
      name: template.name,
      defaultSetTargets: JSON.stringify(template.default_set_targets),
    })
    .where(eq(schema.exerciseTemplates.id, template.id))
    .run();
};

export const addWorkoutTemplateExercise = (exercise: WorkoutTemplateExercise): void => {
  db.insert(schema.workoutTemplateExercises).values({
    id: exercise.id,
    workoutTemplateId: exercise.workout_template_id,
    exerciseTemplateId: exercise.exercise_template_id,
    setTargets: JSON.stringify(exercise.set_targets),
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
      workout_template_id: row.workoutTemplateId,
      exercise_template_id: row.exerciseTemplateId,
      set_targets: JSON.parse(row.setTargets),
      order: row.order,
    }));
};

// ============== Active Workout Session Functions ==============

export const startWorkoutSession = (templateId: string, date: string): ActiveWorkoutSession => {
  // Delete any existing session
  db.delete(schema.activeWorkoutSession).run();
  
  const exercises = getWorkoutTemplateExercises(templateId);
  const sets: any[] = exercises.flatMap(exercise => {
    const exerciseTemplate = getExerciseTemplate(exercise.exercise_template_id);
    if (!exerciseTemplate) return [];
    return exercise.set_targets.map((target: any, index: number) => ({
      id: `${exercise.id}-${index}`,
      workout_template_exercise_id: exercise.id,
      weight: 0,
      reps: 0,
      targetReps: target.reps,
      targetWeight: target.weight,
      completed: false,
    }));
  });

  const newSession: ActiveWorkoutSession = {
    id: Date.now().toString(),
    workout_template_id: templateId,
    start_time: Date.now(),
    date: date,
    sets,
  };

  db.insert(schema.activeWorkoutSession).values({
    id: newSession.id,
    workoutTemplateId: newSession.workout_template_id,
    startTime: newSession.start_time,
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
    workout_template_id: row.workoutTemplateId,
    start_time: row.startTime,
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
    workout_template_id: session.workout_template_id,
    date: session.date,
    duration: Math.round((Date.now() - session.start_time) / 60000),
    caloriesBurned: caloriesBurned,
    sets: session.sets.filter((s: any) => s.completed),
    createdAt: Date.now(),
  };

  db.insert(schema.workoutEntries).values({
    id: newEntry.id,
    workoutTemplateId: newEntry.workout_template_id,
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
      workout_template_id: row.workoutTemplateId,
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
    workout_template_id: row.workoutTemplateId,
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

  return {
    id: row.id,
    birthdate: row.birthdate,
    gender: row.gender as any,
    height: row.height,
    weight: row.weight,
    activityLevel: row.activityLevel as any,
    goalType: row.goalType as any,
    targetWeight: row.targetWeight ?? undefined,
    targetCalories: row.targetCalories,
    targetProtein: row.targetProtein,
    targetCarbs: row.targetCarbs,
    targetFat: row.targetFat,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
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
  const foodEntries = getFoodEntriesForDate(date);
  const allFoodItems = getAllFoodItems();
  const foodItemsById = allFoodItems.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as { [key: string]: FoodItem });

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  const totalVitamins: any = {};
  const totalMinerals: any = {};

  for (const entry of foodEntries) {
    const foodItem = foodItemsById[entry.foodId];
    if (foodItem) {
      const ratio = entry.quantity / foodItem.servingSize;
      totalCalories += foodItem.calories * ratio;
      totalProtein += foodItem.protein * ratio;
      totalCarbs += foodItem.carbs * ratio;
      totalFat += foodItem.fat * ratio;
      totalFiber += foodItem.fiber * ratio;

      // Aggregate vitamins
      const vitaminKeys: (keyof VitaminFields)[] = [
        'vitaminA', 'vitaminC', 'vitaminD', 'vitaminB6', 'vitaminE', 'vitaminK',
        'thiamin', 'vitaminB12', 'riboflavin', 'folate', 'niacin', 'choline',
        'pantothenicAcid', 'biotin', 'carotenoids'
      ];
      for (const key of vitaminKeys) {
        if (foodItem[key] != null) {
          totalVitamins[key] = (totalVitamins[key] || 0) + (foodItem[key] || 0) * ratio;
        }
      }

      // Aggregate minerals
      const mineralKeys: (keyof MineralFields)[] = [
        'calcium', 'chloride', 'chromium', 'copper', 'fluoride', 'iodine', 'iron',
        'magnesium', 'manganese', 'molybdenum', 'phosphorus', 'potassium',
        'selenium', 'sodium', 'zinc'
      ];
      for (const key of mineralKeys) {
        if (foodItem[key] != null) {
          totalMinerals[key] = (totalMinerals[key] || 0) + (foodItem[key] || 0) * ratio;
        }
      }
    }
  }

  const workoutEntries = getWorkoutEntries(date);
  const caloriesBurned = workoutEntries.reduce((total, workout) => {
    return total + (workout.caloriesBurned || 0);
  }, 0);

  return {
    date,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    totalVitamins,
    totalMinerals,
    caloriesBurned: caloriesBurned,
    netCalories: totalCalories - caloriesBurned,
  };
};

export const getCalorieIntakeForPeriod = (startDate: string, endDate: string): { date: string, totalCalories: number, targetCalories: number }[] => {
  const userProfile = getUserProfile();
  const baseTargetCalories = userProfile?.targetCalories || 0;

  const foodEntries = db
    .select()
    .from(schema.foodEntries)
    .where(and(
      sql`${schema.foodEntries.date} >= ${startDate}`,
      sql`${schema.foodEntries.date} <= ${endDate}`
    ))
    .all();

  const workoutEntries = db
    .select()
    .from(schema.workoutEntries)
    .where(and(
      sql`${schema.workoutEntries.date} >= ${startDate}`,
      sql`${schema.workoutEntries.date} <= ${endDate}`
    ))
    .all();

  const allFoodItems = getAllFoodItems();
  const foodItemsById = allFoodItems.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as { [key: string]: FoodItem });

  const dailyCalories: { [date: string]: number } = {};
  const dailyBurned: { [date: string]: number } = {};

  for (const entry of foodEntries) {
    const foodItem = foodItemsById[entry.foodId];
    if (foodItem) {
      const ratio = entry.quantity / foodItem.servingSize;
      const calories = foodItem.calories * ratio;
      if (!dailyCalories[entry.date]) {
        dailyCalories[entry.date] = 0;
      }
      dailyCalories[entry.date] += calories;
    }
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
    const relevantSets = sets.filter(set => workoutTemplateExerciseIds.includes(set.workout_template_exercise_id));

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
