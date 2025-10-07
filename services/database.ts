import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export interface Activity {
  id: string;
  activity: string;
  calories: number;
  type: 'eaten' | 'burned';
  timestamp: number;
}

export interface DailyNutrition {
  id: string;
  date: string;
  protein: number;
  carbs: number;
  fat: number;
}

// Enhanced Food Database Interfaces
export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  category: FoodCategory;
  // Nutritional info per 100g
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  saturatedFat: number;
  transFat: number;
  // Micronutrients (mg or mcg per 100g)
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
  // Serving information
  servingSize: number;
  servingUnit: string;
  isVerified: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface FoodEntry {
  id: string;
  foodId: string;
  userId?: string;
  date: string;
  mealType: MealType;
  quantity: number;
  unit: string;
  // Calculated nutritional values for this entry
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  createdAt: number;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  servings: number;
  prepTime?: number;
  cookTime?: number;
  ingredients: RecipeIngredient[];
  // Calculated per serving
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  createdAt: number;
  updatedAt: number;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  foodId: string;
  quantity: number;
  unit: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
}

export interface WorkoutTemplateExercise {
  id: string;
  workout_template_id: string;
  exercise_template_id: string;
  sets: number;
  reps: string;
  order: number;
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  default_sets: number;
  default_reps: string;
}

export interface WorkoutSet {
  id: string;
  workout_template_exercise_id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface ActiveWorkoutSession {
  id: string;
  workout_template_id: string;
  start_time: number;
  sets: WorkoutSet[];
}

export interface WorkoutEntry {
  id: string;
  workout_template_id: string;
  date: string;
  duration: number; // in minutes
  sets: WorkoutSet[];
  createdAt: number;
}

export interface UserProfile {
  id: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  activityLevel: ActivityLevel;
  goalType: GoalType;
  targetWeight?: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  createdAt: number;
  updatedAt: number;
}

export interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  createdAt: number;
}

export type FoodCategory = 
  | 'vegetables'
  | 'fruits'
  | 'grains'
  | 'proteins'
  | 'dairy'
  | 'fats'
  | 'beverages'
  | 'snacks'
  | 'prepared'
  | 'supplements'
  | 'condiments'
  | 'other';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type ExerciseCategory = 
  | 'cardio'
  | 'strength'
  | 'flexibility'
  | 'sports'
  | 'daily';

export type MuscleGroup = 
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'full-body';

export type ActivityLevel = 
  | 'sedentary'
  | 'lightly-active'
  | 'moderately-active'
  | 'very-active'
  | 'extremely-active';

export type GoalType = 
  | 'lose-weight'
  | 'maintain-weight'
  | 'gain-weight'
  | 'build-muscle'
  | 'improve-fitness';

export let dbInitialized: Promise<void>;

const DATABASE_VERSION = 2;

const createSchemaVersionTable = async (db: SQLite.SQLiteDatabase) => {
  await db.runAsync(
    `CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY)`
  );
};

const getDatabaseVersion = async (db: SQLite.SQLiteDatabase): Promise<number> => {
  const result = await db.getFirstAsync<{version: number}>(
    `SELECT version FROM schema_version LIMIT 1`
  );
  return result ? result.version : 0;
};

const updateDatabaseVersion = async (db: SQLite.SQLiteDatabase, version: number) => {
  await db.runAsync(
    `INSERT OR REPLACE INTO schema_version (version) VALUES (?)`,
    [version]
  );
};

export const initDatabase = (): void => {
  dbInitialized = new Promise<void>(async (resolve, reject) => {
    try {
      db = SQLite.openDatabaseSync('fitness.db');

      await db.withTransactionAsync(async () => {
        await createSchemaVersionTable(db);
        const currentVersion = await getDatabaseVersion(db);

        if (currentVersion < DATABASE_VERSION) {
          console.log(`Database schema mismatch. Found version ${currentVersion}, expected ${DATABASE_VERSION}. Resetting database.`);

          const tablesResult = await db.getAllAsync<{ name: string }>(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`);
          const tables = tablesResult.map(row => row.name);
          for (const table of tables) {
            if (table !== 'schema_version') {
              await db.runAsync(`DROP TABLE IF EXISTS ${table};`);
            }
          }

          await createSchemaVersionTable(db);

          await db.runAsync(`
            PRAGMA journal_mode = WAL;
          `);

          // Create all tables if they don't exist
          await db.runAsync(`CREATE TABLE IF NOT EXISTS activities (
              id TEXT PRIMARY KEY,
              activity TEXT NOT NULL,
              calories INTEGER NOT NULL,
              type TEXT NOT NULL,
              timestamp INTEGER NOT NULL
            );`);

          await db.runAsync(`CREATE TABLE IF NOT EXISTS daily_nutrition (
              id TEXT PRIMARY KEY,
              date TEXT NOT NULL,
              protein REAL NOT NULL,
              carbs REAL NOT NULL,
              fat REAL NOT NULL
            );`);

          await db.runAsync(`CREATE TABLE IF NOT EXISTS food_items (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              brand TEXT,
              barcode TEXT,
              category TEXT NOT NULL,
              calories REAL NOT NULL,
              protein REAL NOT NULL,
              carbs REAL NOT NULL,
              fat REAL NOT NULL,
              fiber REAL NOT NULL DEFAULT 0,
              sugar REAL NOT NULL DEFAULT 0,
              sodium REAL NOT NULL DEFAULT 0,
              cholesterol REAL NOT NULL DEFAULT 0,
              saturated_fat REAL NOT NULL DEFAULT 0,
              trans_fat REAL NOT NULL DEFAULT 0,
              vitamin_a REAL DEFAULT 0,
              vitamin_c REAL DEFAULT 0,
              vitamin_d REAL DEFAULT 0,
              calcium REAL DEFAULT 0,
              iron REAL DEFAULT 0,
              potassium REAL DEFAULT 0,
              serving_size REAL NOT NULL,
              serving_unit TEXT NOT NULL,
              is_verified INTEGER NOT NULL DEFAULT 0,
              created_at INTEGER NOT NULL,
              updated_at INTEGER NOT NULL
            );`);

          await db.runAsync(`CREATE TABLE IF NOT EXISTS food_entries (
              id TEXT PRIMARY KEY,
              food_id TEXT NOT NULL,
              user_id TEXT,
              date TEXT NOT NULL,
              meal_type TEXT NOT NULL,
              quantity REAL NOT NULL,
              unit TEXT NOT NULL,
              total_calories REAL NOT NULL,
              total_protein REAL NOT NULL,
              total_carbs REAL NOT NULL,
              total_fat REAL NOT NULL,
              total_fiber REAL NOT NULL,
              total_sugar REAL NOT NULL,
              total_sodium REAL NOT NULL,
              created_at INTEGER NOT NULL,
              FOREIGN KEY (food_id) REFERENCES food_items(id)
            );`);

          await db.runAsync(`CREATE TABLE IF NOT EXISTS recipes (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              description TEXT,
              instructions TEXT,
              servings INTEGER NOT NULL,
              prep_time INTEGER,
              cook_time INTEGER,
              calories_per_serving REAL NOT NULL,
              protein_per_serving REAL NOT NULL,
              carbs_per_serving REAL NOT NULL,
              fat_per_serving REAL NOT NULL,
              created_at INTEGER NOT NULL,
              updated_at INTEGER NOT NULL
            );`);

          await db.runAsync(`CREATE TABLE IF NOT EXISTS recipe_ingredients (
              id TEXT PRIMARY KEY,
              recipe_id TEXT NOT NULL,
              food_id TEXT NOT NULL,
              quantity REAL NOT NULL,
              unit TEXT NOT NULL,
              FOREIGN KEY (recipe_id) REFERENCES recipes(id),
              FOREIGN KEY (food_id) REFERENCES food_items(id)
            );`);

          await db.runAsync(`CREATE TABLE IF NOT EXISTS workout_templates (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL
            );`);

          await db.runAsync(`CREATE TABLE IF NOT EXISTS workout_template_exercises (
              id TEXT PRIMARY KEY,
              workout_template_id TEXT NOT NULL,
              exercise_template_id TEXT NOT NULL,
              sets INTEGER NOT NULL,
              reps TEXT NOT NULL,
              "order" INTEGER NOT NULL DEFAULT 0,
              FOREIGN KEY (workout_template_id) REFERENCES workout_templates(id),
              FOREIGN KEY (exercise_template_id) REFERENCES exercise_templates(id)
            );`);

          await db.runAsync(`CREATE TABLE IF NOT EXISTS exercise_templates (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              default_sets INTEGER NOT NULL,
              default_reps TEXT NOT NULL
            );`);

          await db.runAsync(`CREATE TABLE IF NOT EXISTS workout_entries (
              id TEXT PRIMARY KEY,
              workout_template_id TEXT NOT NULL,
              date TEXT NOT NULL,
              duration INTEGER NOT NULL,
              sets TEXT NOT NULL, -- JSON string of WorkoutSet[]
              created_at INTEGER NOT NULL,
              FOREIGN KEY (workout_template_id) REFERENCES workout_templates(id)
            );`);

          await db.runAsync(`CREATE TABLE IF NOT EXISTS active_workout_session (
              id TEXT PRIMARY KEY,
              workout_template_id TEXT NOT NULL,
              start_time INTEGER NOT NULL,
              sets TEXT NOT NULL, -- JSON string of WorkoutSet[]
              FOREIGN KEY (workout_template_id) REFERENCES workout_templates(id)
            );`);

          await db.runAsync(`CREATE TABLE IF NOT EXISTS user_profile (
              id TEXT PRIMARY KEY,
              age INTEGER NOT NULL,
              gender TEXT NOT NULL,
              height REAL NOT NULL,
              weight REAL NOT NULL,
              activity_level TEXT NOT NULL,
              goal_type TEXT NOT NULL,
              target_weight REAL,
              target_calories REAL NOT NULL,
              target_protein REAL NOT NULL,
              target_carbs REAL NOT NULL,
              target_fat REAL NOT NULL,
              created_at INTEGER NOT NULL,
              updated_at INTEGER NOT NULL
            );`);

          await db.runAsync(`CREATE TABLE IF NOT EXISTS weight_entries (
              id TEXT PRIMARY KEY,
              weight REAL NOT NULL,
              date TEXT NOT NULL,
              created_at INTEGER NOT NULL
            );`);

          // Create indexes for better performance
          await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_food_entries_date ON food_entries(date);`);
          await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_food_entries_meal_type ON food_entries(meal_type);`);
          await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_workout_entries_date ON workout_entries(date);`);
          await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_food_items_name ON food_items(name);`);
          await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items(category);`);
          await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_weight_entries_date ON weight_entries(date);`);

          await updateDatabaseVersion(db, DATABASE_VERSION);
          populateSampleData();
        }
      });
      resolve();
    } catch (error) {
      reject(error);
    }
  });
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

// Nutrition Summary Functions
export interface NutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  caloriesBurned: number;
  netCalories: number;
}

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

// Populate sample data for offline use
const populateSampleData = (): void => {
  // Check if we already have data
  const workoutTemplateCount = db.getFirstSync<{count: number}>('SELECT COUNT(*) as count FROM workout_templates');
  if (workoutTemplateCount && workoutTemplateCount.count > 0) return;

  const now = Date.now();

  // Sample food items
  const sampleFoods: FoodItem[] = [
    {
      id: '1', name: 'Banana', category: 'fruits',
      calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2, sodium: 1,
      cholesterol: 0, saturatedFat: 0.1, transFat: 0, servingSize: 100, servingUnit: 'g',
      isVerified: true, createdAt: now, updatedAt: now
    },
    {
      id: '2', name: 'Chicken Breast', category: 'proteins',
      calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74,
      cholesterol: 85, saturatedFat: 1, transFat: 0, servingSize: 100, servingUnit: 'g',
      isVerified: true, createdAt: now, updatedAt: now
    },
    {
      id: '3', name: 'Brown Rice', category: 'grains',
      calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, sugar: 0.4, sodium: 5,
      cholesterol: 0, saturatedFat: 0.2, transFat: 0, servingSize: 100, servingUnit: 'g',
      isVerified: true, createdAt: now, updatedAt: now
    },
    {
      id: '4', name: 'Broccoli', category: 'vegetables',
      calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.5, sodium: 33,
      cholesterol: 0, saturatedFat: 0.1, transFat: 0, servingSize: 100, servingUnit: 'g',
      isVerified: true, createdAt: now, updatedAt: now
    },
    {
      id: '5', name: 'Greek Yogurt', category: 'dairy',
      calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.6, sodium: 36,
      cholesterol: 5, saturatedFat: 0.1, transFat: 0, servingSize: 100, servingUnit: 'g',
      isVerified: true, createdAt: now, updatedAt: now
    },
    {
      id: '6', name: 'Oats', category: 'grains',
      calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, sugar: 0.99, sodium: 2,
      cholesterol: 0, saturatedFat: 1.2, transFat: 0, servingSize: 100, servingUnit: 'g',
      isVerified: true, createdAt: now, updatedAt: now
    },
    {
      id: '7', name: 'Salmon Fillet', category: 'proteins',
      calories: 208, protein: 20, carbs: 0, fat: 12.4, fiber: 0, sugar: 0, sodium: 59,
      cholesterol: 55, saturatedFat: 3.8, transFat: 0, servingSize: 100, servingUnit: 'g',
      isVerified: true, createdAt: now, updatedAt: now
    },
    {
      id: '8', name: 'Avocado', category: 'fats',
      calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, sugar: 0.7, sodium: 7,
      cholesterol: 0, saturatedFat: 2.1, transFat: 0, servingSize: 100, servingUnit: 'g',
      isVerified: true, createdAt: now, updatedAt: now
    },
  ];

  // Sample exercises
  const sampleWorkoutTemplates: WorkoutTemplate[] = [
    { id: '1', name: 'Leg Day' },
    { id: '2', name: 'Push Day' },
    { id: '3', name: 'Pull Day' },
  ];

  const sampleExerciseTemplates: ExerciseTemplate[] = [
    { id: '1', name: 'Squats', default_sets: 3, default_reps: '8-12' },
    { id: '2', name: 'Leg Press', default_sets: 3, default_reps: '8-12' },
    { id: '3', name: 'Leg Curls', default_sets: 3, default_reps: '10-15' },
    { id: '4', name: 'Bench Press', default_sets: 3, default_reps: '8-12' },
    { id: '5', name: 'Overhead Press', default_sets: 3, default_reps: '8-12' },
    { id: '6', name: 'Tricep Pushdowns', default_sets: 3, default_reps: '10-15' },
    { id: '7', name: 'Pull Ups', default_sets: 3, default_reps: '5-10' },
    { id: '8', name: 'Rows', default_sets: 3, default_reps: '8-12' },
    { id: '9', name: 'Bicep Curls', default_sets: 3, default_reps: '10-15' },
  ];

  const sampleWorkoutTemplateExercises: WorkoutTemplateExercise[] = [
    { id: '1', workout_template_id: '1', exercise_template_id: '1', sets: 3, reps: '8-12', order: 0 },
    { id: '2', workout_template_id: '1', exercise_template_id: '2', sets: 3, reps: '8-12', order: 1 },
    { id: '3', workout_template_id: '1', exercise_template_id: '3', sets: 3, reps: '10-15', order: 2 },
    { id: '4', workout_template_id: '2', exercise_template_id: '4', sets: 3, reps: '8-12', order: 0 },
    { id: '5', workout_template_id: '2', exercise_template_id: '5', sets: 3, reps: '8-12', order: 1 },
    { id: '6', workout_template_id: '2', exercise_template_id: '6', sets: 3, reps: '10-15', order: 2 },
    { id: '7', workout_template_id: '3', exercise_template_id: '7', sets: 3, reps: '5-10', order: 0 },
    { id: '8', workout_template_id: '3', exercise_template_id: '8', sets: 3, reps: '8-12', order: 1 },
    { id: '9', workout_template_id: '3', exercise_template_id: '9', sets: 3, reps: '10-15', order: 2 },
  ];

  // Insert sample data
  sampleFoods.forEach(food => addFoodItem(food));
  sampleExerciseTemplates.forEach(template => addExerciseTemplate(template));
  sampleWorkoutTemplates.forEach(template => addWorkoutTemplate(template));
  sampleWorkoutTemplateExercises.forEach(exercise => addWorkoutTemplateExercise(exercise));
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
  if(!db) {
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
  db.execSync(`
    DELETE FROM activities;
    DELETE FROM daily_nutrition;
    DELETE FROM food_items;
    DELETE FROM food_entries;
    DELETE FROM recipes;
    DELETE FROM recipe_ingredients;
    DELETE FROM workout_entries;
    DELETE FROM user_profile;
    DELETE FROM weight_entries;
  `);
  // Re-populate sample data
  populateSampleData();
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
