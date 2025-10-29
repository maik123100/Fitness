import * as SQLite from 'expo-sqlite';
import { getDatabaseSchema } from './dbschema';
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
  WorkoutSet,
  ActiveWorkoutSession,
  WorkoutEntry,
  UserProfile,
  WeightEntry,
  FoodCategory,
  MealType,
  ExerciseCategory,
  MuscleGroup,
  ActivityLevel,
  GoalType,
  NutritionSummary,
  Vitamins,
  Minerals
} from '@/types/types';

  let db: SQLite.SQLiteDatabase;

  const DATABASE_VERSION = 2;

  export function deleteFoodItem(foodItem: FoodItem): void {
    db.runSync('DELETE FROM food_items WHERE id = ?', [foodItem.id]);
  }

  const createSchemaVersionTable = (db: SQLite.SQLiteDatabase) => {
    db.runSync(
      'CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY)'
    );
  };

  const getDatabaseVersion = (db: SQLite.SQLiteDatabase): number => {
    const result = db.getFirstSync<{ version: number }>(
      'SELECT version FROM schema_version LIMIT 1'
    );
    return result ? result.version : 0;
  };

  const updateDatabaseVersion = (db: SQLite.SQLiteDatabase, version: number) => {
    db.runSync(
      'INSERT OR REPLACE INTO schema_version (version) VALUES (?)',
      [version]
    );
  };



export const initDatabase = (): void => {
  console.log('Initializing database...');
  try {
    db = SQLite.openDatabaseSync('fitness.db');

    db.withTransactionSync(() => {
      createSchemaVersionTable(db);
      const currentVersion = getDatabaseVersion(db);

      if (currentVersion < DATABASE_VERSION) {
        console.log(`Database schema mismatch. Found version ${currentVersion}, expected ${DATABASE_VERSION}. Resetting database.`);

        console.log('Getting all tables...');
        const tablesResult = db.getAllSync<{ name: string }>(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`);
        const tables = tablesResult.map(row => row.name);
        console.log('Dropping tables...');
        for (const table of tables) {
          if (table !== 'schema_version') {
            db.runSync(`DROP TABLE IF EXISTS ${table};`);
          }
        }

        console.log('Creating schema version table...');
        createSchemaVersionTable(db);

  console.log('Reading schema...');
  const schema = getDatabaseSchema();
  const schemaStatements = schema.split(';').filter((s: string) => s.trim().length > 0);

        console.log('Executing schema statements...');
        for (const statement of schemaStatements) {
          try {
            db.runSync(statement);
          } catch (error) {
            console.error('Error executing statement:', statement, error);
            throw error;
          }
        }

        console.log('Updating database version...');
        updateDatabaseVersion(db, DATABASE_VERSION);
      }
    });
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Enhanced Food Database Functions
export const addFoodItem = (food: FoodItem): void => {
  const now = Date.now();
  db.runSync(
    `INSERT INTO food_items (
      id, name, brand, barcode, category, calories, protein, carbs, fat, fiber, 
      vitamin_a, vitamin_c, vitamin_d, vitamin_b6, vitamin_e, vitamin_k, thiamin, 
      vitamin_b12, riboflavin, folate, niacin, choline, pantothenic_acid, biotin, 
      carotenoids, calcium, chloride, chromium, copper, fluoride, iodine, iron, 
      magnesium, manganese, molybdenum, phosphorus, potassium, selenium, sodium, zinc,
      serving_size, serving_unit, is_verified, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      food.id,
      food.name,
      food.brand ?? null,
      food.barcode ?? null,
      food.category,
      food.calories,
      food.macronutrients.protein,
      food.macronutrients.carbs,
      food.macronutrients.fat,
      food.macronutrients.fiber,
      food.vitamins.vitaminA ?? 0,
      food.vitamins.vitaminC ?? 0,
      food.vitamins.vitaminD ?? 0,
      food.vitamins.vitaminB6 ?? 0,
      food.vitamins.vitaminE ?? 0,
      food.vitamins.vitaminK ?? 0,
      food.vitamins.thiamin ?? 0,
      food.vitamins.vitaminB12 ?? 0,
      food.vitamins.riboflavin ?? 0,
      food.vitamins.folate ?? 0,
      food.vitamins.niacin ?? 0,
      food.vitamins.choline ?? 0,
      food.vitamins.pantothenicAcid ?? 0,
      food.vitamins.biotin ?? 0,
      food.vitamins.carotenoids ?? 0,
      food.minerals.calcium ?? 0,
      food.minerals.chloride ?? 0,
      food.minerals.chromium ?? 0,
      food.minerals.copper ?? 0,
      food.minerals.fluoride ?? 0,
      food.minerals.iodine ?? 0,
      food.minerals.iron ?? 0,
      food.minerals.magnesium ?? 0,
      food.minerals.manganese ?? 0,
      food.minerals.molybdenum ?? 0,
      food.minerals.phosphorus ?? 0,
      food.minerals.potassium ?? 0,
      food.minerals.selenium ?? 0,
      food.minerals.sodium ?? 0,
      food.minerals.zinc ?? 0,
      food.servingSize,
      food.servingUnit,
      food.isVerified ? 1 : 0,
      food.createdAt || now,
      food.updatedAt || now,
    ]
  );
};

export const getAllFoodItems = (): FoodItem[] => {
  return db.getAllSync<any>('SELECT * FROM food_items').map(row => ({
    id: row.id,
    name: row.name,
    brand: row.brand,
    barcode: row.barcode,
    category: row.category as FoodCategory,
    calories: row.calories,
    macronutrients: {
      protein: row.protein,
      carbs: row.carbs,
      fat: row.fat,
      fiber: row.fiber,
    },
    vitamins: {
      vitaminA: row.vitamin_a,
      vitaminC: row.vitamin_c,
      vitaminD: row.vitamin_d,
      vitaminB6: row.vitamin_b6,
      vitaminE: row.vitamin_e,
      vitaminK: row.vitamin_k,
      thiamin: row.thiamin,
      vitaminB12: row.vitamin_b12,
      riboflavin: row.riboflavin,
      folate: row.folate,
      niacin: row.niacin,
      choline: row.choline,
      pantothenicAcid: row.pantothenic_acid,
      biotin: row.biotin,
      carotenoids: row.carotenoids,
    },
    minerals: {
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
    },
    servingSize: row.serving_size,
    servingUnit: row.serving_unit,
    isVerified: row.is_verified === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

export const searchFoodItems = (query: string, category?: FoodCategory, limit: number = 20): FoodItem[] => {
  let sql = `
    SELECT * FROM food_items 
    WHERE name LIKE ? 
    ${category ? 'AND category = ?' : ''}
    ORDER BY is_verified DESC, name ASC 
    LIMIT ?
  `;

  const params: (string | number | null)[] = [`%${query}%`];
  if (category) params.push(category);
  params.push(limit);

  return db.getAllSync<any>(sql, params).map(row => ({
    id: row.id,
    name: row.name,
    brand: row.brand,
    barcode: row.barcode,
    category: row.category as FoodCategory,
    calories: row.calories,
    macronutrients: {
      protein: row.protein,
      carbs: row.carbs,
      fat: row.fat,
      fiber: row.fiber,
    },
    vitamins: {
      vitaminA: row.vitamin_a,
      vitaminC: row.vitamin_c,
      vitaminD: row.vitamin_d,
      vitaminB6: row.vitamin_b6,
      vitaminE: row.vitamin_e,
      vitaminK: row.vitamin_k,
      thiamin: row.thiamin,
      vitaminB12: row.vitamin_b12,
      riboflavin: row.riboflavin,
      folate: row.folate,
      niacin: row.niacin,
      choline: row.choline,
      pantothenicAcid: row.pantothenic_acid,
      biotin: row.biotin,
      carotenoids: row.carotenoids,
    },
    minerals: {
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
    },
    servingSize: row.serving_size,
    servingUnit: row.serving_unit,
    isVerified: row.is_verified === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

export const getFoodItem = (id: string): FoodItem | null => {
  const row = db.getFirstSync<any>('SELECT * FROM food_items WHERE id = ?', [id]);
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    barcode: row.barcode,
    category: row.category as FoodCategory,
    calories: row.calories,
    macronutrients: {
      protein: row.protein,
      carbs: row.carbs,
      fat: row.fat,
      fiber: row.fiber,
    },
    vitamins: {
      vitaminA: row.vitamin_a,
      vitaminC: row.vitamin_c,
      vitaminD: row.vitamin_d,
      vitaminB6: row.vitamin_b6,
      vitaminE: row.vitamin_e,
      vitaminK: row.vitamin_k,
      thiamin: row.thiamin,
      vitaminB12: row.vitamin_b12,
      riboflavin: row.riboflavin,
      folate: row.folate,
      niacin: row.niacin,
      choline: row.choline,
      pantothenicAcid: row.pantothenic_acid,
      biotin: row.biotin,
      carotenoids: row.carotenoids,
    },
    minerals: {
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
    },
    servingSize: row.serving_size,
    servingUnit: row.serving_unit,
    isVerified: row.is_verified === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const addFoodEntry = (entry: FoodEntry): void => {
  db.runSync(
    `INSERT INTO food_entries (
      id, food_id, user_id, date, meal_type, quantity, unit,
      total_calories, total_protein, total_carbs, total_fat, total_fiber, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id, entry.foodId, entry.userId ?? null, entry.date, entry.mealType, entry.quantity, entry.unit,
      entry.totalCalories, entry.totalProtein, entry.totalCarbs, entry.totalFat,
      entry.totalFiber, entry.createdAt
    ]
  );
};

export const getFoodEntriesForDate = (date: string): FoodEntry[] => {
  return db.getAllSync<any>('SELECT * FROM food_entries WHERE date = ? ORDER BY created_at DESC', [date])
    .map(row => ({
      id: row.id,
      foodId: row.food_id,
      userId: row.user_id,
      date: row.date,
      mealType: row.meal_type as MealType,
      quantity: row.quantity,
      unit: row.unit,
      totalCalories: row.total_calories,
      totalProtein: row.total_protein,
      totalCarbs: row.total_carbs,
      totalFat: row.total_fat,
      totalFiber: row.total_fiber,
      createdAt: row.created_at,
    }));
};

export const deleteFoodEntry = (id: string): void => {
  db.runSync('DELETE FROM food_entries WHERE id = ?', [id]);
};

// Workout Functions
export const addWorkoutTemplate = (template: WorkoutTemplate): void => {
  db.runSync('INSERT INTO workout_templates (id, name) VALUES (?, ?)', [template.id, template.name]);
};

export const getWorkoutTemplates = (): WorkoutTemplate[] => {
  return db.getAllSync<WorkoutTemplate>('SELECT * FROM workout_templates');
};

export const getWorkoutTemplate = (id: string): WorkoutTemplate | null => {
  return db.getFirstSync<WorkoutTemplate>('SELECT * FROM workout_templates WHERE id = ?', [id]);
};

export const getExerciseTemplate = (id: string): ExerciseTemplate | null => {
  const row = db.getFirstSync<any>('SELECT * FROM exercise_templates WHERE id = ?', [id]);
  if (!row) return null;
  return {
    ...row,
    default_set_targets: JSON.parse(row.default_set_targets),
  };
};

export const addWorkoutTemplateExercise = (exercise: WorkoutTemplateExercise): void => {
  db.runSync(
    'INSERT INTO workout_template_exercises (id, workout_template_id, exercise_template_id, set_targets, "order") VALUES (?, ?, ?, ?, ?)',
    [exercise.id, exercise.workout_template_id, exercise.exercise_template_id, JSON.stringify(exercise.set_targets), exercise.order]
  );
};

export const addExerciseTemplate = (template: ExerciseTemplate): void => {
  db.runSync('INSERT INTO exercise_templates (id, name, default_set_targets) VALUES (?, ?, ?)', [template.id, template.name, JSON.stringify(template.default_set_targets)]);
};

export const getExerciseTemplates = (): ExerciseTemplate[] => {
  return db.getAllSync<any>('SELECT * FROM exercise_templates').map(row => ({
    ...row,
    default_set_targets: JSON.parse(row.default_set_targets),
  }));
};

export const getWorkoutTemplateExercises = (templateId: string): WorkoutTemplateExercise[] => {
  return db.getAllSync<any>(
    'SELECT * FROM workout_template_exercises WHERE workout_template_id = ? ORDER BY "order" ASC',
    [templateId]
  ).map(row => ({
    ...row,
    set_targets: JSON.parse(row.set_targets),
  }));
};

export const startWorkoutSession = (templateId: string, date: string): ActiveWorkoutSession => {
  db.runSync('DELETE FROM active_workout_session');
  const exercises = getWorkoutTemplateExercises(templateId);
  const sets: WorkoutSet[] = exercises.flatMap(exercise => {
    const exerciseTemplate = getExerciseTemplate(exercise.exercise_template_id);
    if (!exerciseTemplate) return [];
    return exercise.set_targets.map((target, index) => ({
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

  db.runSync(
    'INSERT INTO active_workout_session (id, workout_template_id, start_time, date, sets) VALUES (?, ?, ?, ?, ?)',
    [newSession.id, newSession.workout_template_id, newSession.start_time, newSession.date, JSON.stringify(newSession.sets)]
  );

  return newSession;
};

export const getActiveWorkoutSession = (): ActiveWorkoutSession | null => {
  const row = db.getFirstSync<any>('SELECT * FROM active_workout_session LIMIT 1');
  if (!row) return null;

  return {
    id: row.id,
    workout_template_id: row.workout_template_id,
    start_time: row.start_time,
    date: row.date,
    sets: JSON.parse(row.sets),
  };
};

export const updateActiveWorkoutSession = (session: ActiveWorkoutSession): void => {
  db.runSync('UPDATE active_workout_session SET sets = ? WHERE id = ?', [JSON.stringify(session.sets), session.id]);
};

export const finishWorkoutSession = (session: ActiveWorkoutSession): void => {
  const newEntry: WorkoutEntry = {
    id: Date.now().toString(),
    workout_template_id: session.workout_template_id,
    date: session.date,
    duration: Math.round((Date.now() - session.start_time) / 60000), // duration in minutes
    sets: session.sets.filter(s => s.completed),
    createdAt: Date.now(),
  };

  db.runSync(
    'INSERT INTO workout_entries (id, workout_template_id, date, duration, sets, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [newEntry.id, newEntry.workout_template_id, newEntry.date, newEntry.duration, JSON.stringify(newEntry.sets), newEntry.createdAt]
  );

  db.runSync('DELETE FROM active_workout_session');
};

export const getWorkoutEntries = (date: string): WorkoutEntry[] => {
  return db.getAllSync<any>('SELECT * FROM workout_entries WHERE date = ? ORDER BY created_at DESC', [date])
    .map(row => ({
      ...row,
      sets: JSON.parse(row.sets),
    }));
};

export const getWorkoutEntry = (id: string): WorkoutEntry | null => {
  const row = db.getFirstSync<any>('SELECT * FROM workout_entries WHERE id = ?', [id]);
  if (!row) return null;
  return {
    ...row,
    sets: JSON.parse(row.sets),
  };
};

export const updateWorkoutEntry = (entry: WorkoutEntry): void => {
  db.runSync(
    'UPDATE workout_entries SET duration = ?, sets = ? WHERE id = ?',
    [entry.duration, JSON.stringify(entry.sets), entry.id]
  );
};

export const deleteWorkoutEntry = (id: string): void => {
  db.runSync('DELETE FROM workout_entries WHERE id = ?', [id]);
};

// User Profile Functions
export const saveUserProfile = (profile: UserProfile): void => {
  const now = Date.now();
  db.runSync(
    `INSERT OR REPLACE INTO user_profile (
      id, birthdate, gender, height, weight, activity_level, goal_type, target_weight,
      target_calories, target_protein, target_carbs, target_fat, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      profile.id, profile.birthdate, profile.gender, profile.height, profile.weight,
      profile.activityLevel, profile.goalType, profile.targetWeight ?? null,
      profile.targetCalories, profile.targetProtein, profile.targetCarbs, profile.targetFat,
      profile.createdAt || now, now
    ]
  );

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
  const row = db.getFirstSync<any>('SELECT * FROM user_profile ORDER BY updated_at DESC LIMIT 1');
  if (!row) return null;

  return {
    id: row.id,
    birthdate: row.birthdate,
    gender: row.gender,
    height: row.height,
    weight: row.weight,
    activityLevel: row.activity_level as ActivityLevel,
    goalType: row.goal_type as GoalType,
    targetWeight: row.target_weight,
    targetCalories: row.target_calories,
    targetProtein: row.target_protein,
    targetCarbs: row.target_carbs,
    targetFat: row.target_fat,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

// Weight Tracking Functions
export const addWeightEntry = (entry: WeightEntry): void => {
  db.runSync(
    'INSERT INTO weight_entries (id, weight, date, created_at) VALUES (?, ?, ?, ?)',
    [entry.id, entry.weight, entry.date, entry.createdAt]
  );
};

export const getWeightEntries = (limit: number = 30): WeightEntry[] => {
  return db.getAllSync<any>('SELECT * FROM weight_entries ORDER BY date DESC LIMIT ?', [limit])
    .map(row => ({
      id: row.id,
      weight: row.weight,
      date: row.date,
      createdAt: row.created_at,
    }));
};

export const getNutritionSummary = (date: string): NutritionSummary => {
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
  const totalVitamins: Vitamins = {};
  const totalMinerals: Minerals = {};

  for (const entry of foodEntries) {
    const foodItem = foodItemsById[entry.foodId];
    if (foodItem) {
      const ratio = entry.quantity / foodItem.servingSize;
      totalCalories += foodItem.calories * ratio;
      totalProtein += foodItem.macronutrients.protein * ratio;
      totalCarbs += foodItem.macronutrients.carbs * ratio;
      totalFat += foodItem.macronutrients.fat * ratio;
      totalFiber += foodItem.macronutrients.fiber * ratio;

      for (const key in foodItem.vitamins) {
        if (Object.prototype.hasOwnProperty.call(foodItem.vitamins, key)) {
            const vitaminKey = key as keyof Vitamins;
            totalVitamins[vitaminKey] = (totalVitamins[vitaminKey] || 0) + (foodItem.vitamins[vitaminKey] || 0) * ratio;
        }
      }
      for (const key in foodItem.minerals) {
        if (Object.prototype.hasOwnProperty.call(foodItem.minerals, key)) {
            const mineralKey = key as keyof Minerals;
            totalMinerals[mineralKey] = (totalMinerals[mineralKey] || 0) + (foodItem.minerals[mineralKey] || 0) * ratio;
        }
      }
    }
  }

  // Calculate calories burned from workout entries
  const workoutEntries = getWorkoutEntries(date);
  const caloriesBurned = workoutEntries.reduce((total, workout) => {
    return total + ((workout as any).calories_burned || 0);
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
  const targetCalories = userProfile?.targetCalories || 0;

  const foodEntries = db.getAllSync<any>('SELECT * FROM food_entries WHERE date >= ? AND date <= ?', [startDate, endDate]);
  const allFoodItems = getAllFoodItems();
  const foodItemsById = allFoodItems.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as { [key: string]: FoodItem });

  const dailyCalories: { [date: string]: number } = {};

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

  const result: { date: string, totalCalories: number, targetCalories: number }[] = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const dateString = currentDate.toISOString().split('T')[0];
    result.push({
      date: dateString,
      totalCalories: dailyCalories[dateString] || 0,
      targetCalories: targetCalories,
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

  const workoutTemplateExercises = db.getAllSync<any>('SELECT id FROM workout_template_exercises WHERE exercise_template_id = ?', [exerciseTemplateId]);
  const workoutTemplateExerciseIds = workoutTemplateExercises.map(wte => wte.id);

  if (workoutTemplateExerciseIds.length === 0) {
    return [];
  }

  const workoutEntries = db.getAllSync<any>('SELECT * FROM workout_entries WHERE date >= ? AND date <= ?', [startDateString, endDateString]);

  const progression: { [date: string]: { weight: number, reps: number }[] } = {};

  for (const entry of workoutEntries) {
    const sets = JSON.parse(entry.sets) as WorkoutSet[];
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


export const deleteExerciseTemplate = (id: string): void => {
  db.runSync('DELETE FROM exercise_templates WHERE id = ?', [id]);
};

export const updateExerciseTemplate = (template: ExerciseTemplate): void => {
  db.runSync(
    'UPDATE exercise_templates SET name = ?, default_set_targets = ? WHERE id = ?',
    [template.name, JSON.stringify(template.default_set_targets), template.id]
  );
};
export const addActivity = (activity: Activity): void => {
  db.runSync(
    'INSERT INTO activities (id, activity, calories, type, timestamp) VALUES (?, ?, ?, ?, ?)',
    [activity.id, activity.activity, activity.calories, activity.type, activity.timestamp]
  );
};

export const getRecentActivities = (limit: number = 10): Activity[] => {
  if (!db) {
    console.error('Database not initialized. Call initDatabase() first.');
    return [];
  }
  console.log('Fetching recent activities from database...');
  return db.getAllSync<Activity>(
    'SELECT * FROM activities ORDER BY timestamp DESC LIMIT ?',
    [limit]
  );
};

export const updateDailyNutrition = (nutrition: DailyNutrition): void => {
  db.runSync(
    `INSERT OR REPLACE INTO daily_nutrition (id, date, protein, carbs, fat) 
     VALUES (?, ?, ?, ?, ?)`,
    [nutrition.id, nutrition.date, nutrition.protein, nutrition.carbs, nutrition.fat]
  );
};

export const getDailyNutrition = (date: string): DailyNutrition | null => {
  return db.getFirstSync<DailyNutrition>(
    'SELECT * FROM daily_nutrition WHERE date = ?',
    [date]
  );
};

export const resetDatabase = (): void => {
  console.log('Performing full database reset (clearing data and re-initializing schema)...');
  try {
    if (db) {
      db.closeSync();
      console.log('Database closed.');
    }
    SQLite.deleteDatabaseSync('fitness.db');
    console.log('Database file deleted.');
    initDatabase(); // Re-initialize the database, which will create schema if not exists
    console.log('Database reset complete.');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
};

export const updateActivity = (activity: Activity): void => {
  db.runSync(
    'UPDATE activities SET activity = ?, calories = ? WHERE id = ?',
    [activity.activity, activity.calories, activity.id]
  );
};

export const deleteActivity = (id: string): void => {
  db.runSync('DELETE FROM activities WHERE id = ?', [id]);
};