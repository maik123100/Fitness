export function getDatabaseSchema(): string {
  return `
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  activity TEXT NOT NULL,
  calories INTEGER NOT NULL,
  type TEXT NOT NULL,
  timestamp INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_nutrition (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS food_items (
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
);

CREATE TABLE IF NOT EXISTS food_entries (
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
);

CREATE TABLE IF NOT EXISTS recipes (
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
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  food_id TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id),
  FOREIGN KEY (food_id) REFERENCES food_items(id)
);

CREATE TABLE IF NOT EXISTS workout_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_template_exercises (
  id TEXT PRIMARY KEY,
  workout_template_id TEXT NOT NULL,
  exercise_template_id TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (workout_template_id) REFERENCES workout_templates(id),
  FOREIGN KEY (exercise_template_id) REFERENCES exercise_templates(id)
);

CREATE TABLE IF NOT EXISTS exercise_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  default_sets INTEGER NOT NULL,
  default_reps TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_entries (
  id TEXT PRIMARY KEY,
  workout_template_id TEXT NOT NULL,
  date TEXT NOT NULL,
  duration INTEGER NOT NULL,
  sets TEXT NOT NULL, -- JSON string of WorkoutSet[]
  created_at INTEGER NOT NULL,
  FOREIGN KEY (workout_template_id) REFERENCES workout_templates(id)
);

CREATE TABLE IF NOT EXISTS active_workout_session (
  id TEXT PRIMARY KEY,
  workout_template_id TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  sets TEXT NOT NULL, -- JSON string of WorkoutSet[]
  FOREIGN KEY (workout_template_id) REFERENCES workout_templates(id)
);

CREATE TABLE IF NOT EXISTS user_profile (
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
);

CREATE TABLE IF NOT EXISTS weight_entries (
  id TEXT PRIMARY KEY,
  weight REAL NOT NULL,
  date TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_food_entries_date ON food_entries(date);
CREATE INDEX IF NOT EXISTS idx_food_entries_meal_type ON food_entries(meal_type);
CREATE INDEX IF NOT EXISTS idx_workout_entries_date ON workout_entries(date);
CREATE INDEX IF NOT EXISTS idx_food_items_name ON food_items(name);
CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items(category);
CREATE INDEX IF NOT EXISTS idx_weight_entries_date ON weight_entries(date);
`;
}
