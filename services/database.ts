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
  NutritionSummary
} from '@/types/types';

  let db: SQLite.SQLiteDatabase;

  const DATABASE_VERSION = 2;

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
      id, name, brand, barcode, category, calories, protein, carbs, fat, fiber, sugar, sodium,
      cholesterol, saturated_fat, trans_fat, vitamin_a, vitamin_c, vitamin_d, calcium, iron, potassium,
      serving_size, serving_unit, is_verified, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      food.id, food.name, food.brand ?? null, food.barcode ?? null, food.category,
      food.calories, food.protein, food.carbs, food.fat, food.fiber, food.sugar, food.sodium,
      food.cholesterol, food.saturatedFat, food.transFat, food.vitaminA ?? 0, food.vitaminC ?? 0, food.vitaminD ?? 0,
      food.calcium ?? 0, food.iron ?? 0, food.potassium ?? 0, food.servingSize, food.servingUnit,
      food.isVerified ? 1 : 0, food.createdAt || now, food.updatedAt || now
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
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    fiber: row.fiber,
    sugar: row.sugar,
    sodium: row.sodium,
    cholesterol: row.cholesterol,
    saturatedFat: row.saturated_fat,
    transFat: row.trans_fat,
    vitaminA: row.vitamin_a,
    vitaminC: row.vitamin_c,
    vitaminD: row.vitamin_d,
    calcium: row.calcium,
    iron: row.iron,
    potassium: row.potassium,
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
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    fiber: row.fiber,
    sugar: row.sugar,
    sodium: row.sodium,
    cholesterol: row.cholesterol,
    saturatedFat: row.saturated_fat,
    transFat: row.trans_fat,
    vitaminA: row.vitamin_a,
    vitaminC: row.vitamin_c,
    vitaminD: row.vitamin_d,
    calcium: row.calcium,
    iron: row.iron,
    potassium: row.potassium,
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
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    fiber: row.fiber,
    sugar: row.sugar,
    sodium: row.sodium,
    cholesterol: row.cholesterol,
    saturatedFat: row.saturated_fat,
    transFat: row.trans_fat,
    vitaminA: row.vitamin_a,
    vitaminC: row.vitamin_c,
    vitaminD: row.vitamin_d,
    calcium: row.calcium,
    iron: row.iron,
    potassium: row.potassium,
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
      total_calories, total_protein, total_carbs, total_fat, total_fiber, total_sugar, total_sodium, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id, entry.foodId, entry.userId ?? null, entry.date, entry.mealType, entry.quantity, entry.unit,
      entry.totalCalories, entry.totalProtein, entry.totalCarbs, entry.totalFat,
      entry.totalFiber, entry.totalSugar, entry.totalSodium, entry.createdAt
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
      totalSugar: row.total_sugar,
      totalSodium: row.total_sodium,
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
  return db.getFirstSync<ExerciseTemplate>('SELECT * FROM exercise_templates WHERE id = ?', [id]);
};

export const addWorkoutTemplateExercise = (exercise: WorkoutTemplateExercise): void => {
  db.runSync(
    'INSERT INTO workout_template_exercises (id, workout_template_id, exercise_template_id, sets, reps, "order") VALUES (?, ?, ?, ?, ?, ?)',
    [exercise.id, exercise.workout_template_id, exercise.exercise_template_id, exercise.sets, exercise.reps, exercise.order]
  );
};

export const addExerciseTemplate = (template: ExerciseTemplate): void => {
  db.runSync('INSERT INTO exercise_templates (id, name, default_sets, default_reps) VALUES (?, ?, ?, ?)', [template.id, template.name, template.default_sets, template.default_reps]);
};

export const getExerciseTemplates = (): ExerciseTemplate[] => {
  return db.getAllSync<ExerciseTemplate>('SELECT * FROM exercise_templates');
};

export const getWorkoutTemplateExercises = (templateId: string): WorkoutTemplateExercise[] => {
  return db.getAllSync<WorkoutTemplateExercise>(
    'SELECT * FROM workout_template_exercises WHERE workout_template_id = ? ORDER BY "order" ASC',
    [templateId]
  );
};

export const startWorkoutSession = (templateId: string): ActiveWorkoutSession => {
  db.runSync('DELETE FROM active_workout_session');
  const exercises = getWorkoutTemplateExercises(templateId);
  const sets: WorkoutSet[] = exercises.flatMap(exercise => {
    const exerciseTemplate = getExerciseTemplate(exercise.exercise_template_id);
    if (!exerciseTemplate) return [];
    const sets: WorkoutSet[] = [];
    for (let i = 0; i < exerciseTemplate.default_sets; i++) {
      sets.push({
        id: `${exercise.id}-${i}`,
        workout_template_exercise_id: exercise.id,
        weight: 0,
        reps: 0,
        completed: false,
      });
    }
    return sets;
  });

  const newSession: ActiveWorkoutSession = {
    id: Date.now().toString(),
    workout_template_id: templateId,
    start_time: Date.now(),
    sets,
  };

  db.runSync(
    'INSERT INTO active_workout_session (id, workout_template_id, start_time, sets) VALUES (?, ?, ?, ?)',
    [newSession.id, newSession.workout_template_id, newSession.start_time, JSON.stringify(newSession.sets)]
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
    date: new Date().toISOString().split('T')[0],
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

export const getWorkoutEntries = (): WorkoutEntry[] => {
  return db.getAllSync<any>('SELECT * FROM workout_entries ORDER BY created_at DESC').map(row => ({
    ...row,
    sets: JSON.parse(row.sets),
  }));
};

// User Profile Functions
export const saveUserProfile = (profile: UserProfile): void => {
  const now = Date.now();
  db.runSync(
    `INSERT OR REPLACE INTO user_profile (
      id, age, gender, height, weight, activity_level, goal_type, target_weight,
      target_calories, target_protein, target_carbs, target_fat, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      profile.id, profile.age, profile.gender, profile.height, profile.weight,
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
    age: row.age,
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
  // Get food entries for the date
  const foodSummary = db.getFirstSync<any>(
    `SELECT 
      COALESCE(SUM(total_calories), 0) as total_calories,
      COALESCE(SUM(total_protein), 0) as total_protein,
      COALESCE(SUM(total_carbs), 0) as total_carbs,
      COALESCE(SUM(total_fat), 0) as total_fat,
      COALESCE(SUM(total_fiber), 0) as total_fiber,
      COALESCE(SUM(total_sugar), 0) as total_sugar,
      COALESCE(SUM(total_sodium), 0) as total_sodium
    FROM food_entries WHERE date = ?`,
    [date]
  );

  // Get workout calories for the date
  const workoutSummary = { calories_burned: 0 };

  return {
    date,
    totalCalories: foodSummary?.total_calories || 0,
    totalProtein: foodSummary?.total_protein || 0,
    totalCarbs: foodSummary?.total_carbs || 0,
    totalFat: foodSummary?.total_fat || 0,
    totalFiber: foodSummary?.total_fiber || 0,
    totalSugar: foodSummary?.total_sugar || 0,
    totalSodium: foodSummary?.total_sodium || 0,
    caloriesBurned: workoutSummary?.calories_burned || 0,
    netCalories: (foodSummary?.total_calories || 0) - (workoutSummary?.calories_burned || 0),
  };
};


export const deleteExerciseTemplate = (id: string): void => {
  db.runSync('DELETE FROM exercise_templates WHERE id = ?', [id]);
};

export const updateExerciseTemplate = (template: ExerciseTemplate): void => {
  db.runSync(
    'UPDATE exercise_templates SET name = ?, default_sets = ?, default_reps = ? WHERE id = ?',
    [template.name, template.default_sets, template.default_reps, template.id]
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
  initDatabase(); // Re-initialize the database, which will create schema if not exists
  console.log('Database reset complete.');
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
