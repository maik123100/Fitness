import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

// Activities table
export const activities = sqliteTable('activities', {
  id: text('id').primaryKey(),
  activity: text('activity').notNull(),
  calories: integer('calories').notNull(),
  type: text('type').notNull(),
  timestamp: integer('timestamp').notNull(),
});

// Daily nutrition table
export const dailyNutrition = sqliteTable('daily_nutrition', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  protein: real('protein').notNull(),
  carbs: real('carbs').notNull(),
  fat: real('fat').notNull(),
});

// Food items table
export const foodItems = sqliteTable('food_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  brand: text('brand'),
  barcode: text('barcode'),
  category: text('category').notNull(),
  calories: real('calories').notNull(),
  protein: real('protein').notNull(),
  carbs: real('carbs').notNull(),
  fat: real('fat').notNull(),
  fiber: real('fiber').notNull(),
  vitaminA: real('vitamin_a').default(0),
  vitaminC: real('vitamin_c').default(0),
  vitaminD: real('vitamin_d').default(0),
  vitaminB6: real('vitamin_b6').default(0),
  vitaminE: real('vitamin_e').default(0),
  vitaminK: real('vitamin_k').default(0),
  thiamin: real('thiamin').default(0),
  vitaminB12: real('vitamin_b12').default(0),
  riboflavin: real('riboflavin').default(0),
  folate: real('folate').default(0),
  niacin: real('niacin').default(0),
  choline: real('choline').default(0),
  pantothenicAcid: real('pantothenic_acid').default(0),
  biotin: real('biotin').default(0),
  carotenoids: real('carotenoids').default(0),
  calcium: real('calcium').default(0),
  chloride: real('chloride').default(0),
  chromium: real('chromium').default(0),
  copper: real('copper').default(0),
  fluoride: real('fluoride').default(0),
  iodine: real('iodine').default(0),
  iron: real('iron').default(0),
  magnesium: real('magnesium').default(0),
  manganese: real('manganese').default(0),
  molybdenum: real('molybdenum').default(0),
  phosphorus: real('phosphorus').default(0),
  potassium: real('potassium').default(0),
  selenium: real('selenium').default(0),
  sodium: real('sodium').default(0),
  zinc: real('zinc').default(0),
  servingSize: real('serving_size').notNull(),
  servingUnit: text('serving_unit').notNull(),
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (table) => ({
  nameIdx: index('idx_food_items_name').on(table.name),
  categoryIdx: index('idx_food_items_category').on(table.category),
}));

// Food entries table
export const foodEntries = sqliteTable('food_entries', {
  id: text('id').primaryKey(),
  foodId: text('food_id').notNull().references(() => foodItems.id),
  date: text('date').notNull(),
  mealType: text('meal_type').notNull(),
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull(),
  totalCalories: real('total_calories').notNull(),
  totalProtein: real('total_protein').notNull(),
  totalCarbs: real('total_carbs').notNull(),
  totalFat: real('total_fat').notNull(),
  totalFiber: real('total_fiber').notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => ({
  dateIdx: index('idx_food_entries_date').on(table.date),
  mealTypeIdx: index('idx_food_entries_meal_type').on(table.mealType),
}));

// Recipes table
export const recipes = sqliteTable('recipes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  instructions: text('instructions'),
  servings: integer('servings').notNull(),
  prepTime: integer('prep_time'),
  cookTime: integer('cook_time'),
  caloriesPerServing: real('calories_per_serving').notNull(),
  proteinPerServing: real('protein_per_serving').notNull(),
  carbsPerServing: real('carbs_per_serving').notNull(),
  fatPerServing: real('fat_per_serving').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// Recipe ingredients table
export const recipeIngredients = sqliteTable('recipe_ingredients', {
  id: text('id').primaryKey(),
  recipeId: text('recipe_id').notNull().references(() => recipes.id),
  foodId: text('food_id').notNull().references(() => foodItems.id),
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull(),
});

// Workout templates table
export const workoutTemplates = sqliteTable('workout_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

// Exercise templates table
export const exerciseTemplates = sqliteTable('exercise_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  defaultSetTargets: text('default_set_targets').notNull(), // JSON string
});

// Workout template exercises table
export const workoutTemplateExercises = sqliteTable('workout_template_exercises', {
  id: text('id').primaryKey(),
  workoutTemplateId: text('workout_template_id').notNull().references(() => workoutTemplates.id),
  exerciseTemplateId: text('exercise_template_id').notNull().references(() => exerciseTemplates.id),
  setTargets: text('set_targets').notNull(), // JSON string
  order: integer('order').notNull().default(0),
});

// Workout entries table
export const workoutEntries = sqliteTable('workout_entries', {
  id: text('id').primaryKey(),
  workoutTemplateId: text('workout_template_id').notNull().references(() => workoutTemplates.id),
  date: text('date').notNull(),
  duration: integer('duration').notNull(),
  sets: text('sets').notNull(), // JSON string of WorkoutSet[]
  createdAt: integer('created_at').notNull(),
}, (table) => ({
  dateIdx: index('idx_workout_entries_date').on(table.date),
}));

// Active workout session table
export const activeWorkoutSession = sqliteTable('active_workout_session', {
  id: text('id').primaryKey(),
  workoutTemplateId: text('workout_template_id').notNull().references(() => workoutTemplates.id),
  startTime: integer('start_time').notNull(),
  date: text('date').notNull(),
  sets: text('sets').notNull(), // JSON string of WorkoutSet[]
});

// User profile table
export const userProfile = sqliteTable('user_profile', {
  id: text('id').primaryKey(),
  birthdate: text('birthdate').notNull(),
  gender: text('gender').notNull(),
  height: real('height').notNull(),
  weight: real('weight').notNull(),
  activityLevel: text('activity_level').notNull(),
  goalType: text('goal_type').notNull(),
  targetWeight: real('target_weight'),
  targetCalories: real('target_calories').notNull(),
  targetProtein: real('target_protein').notNull(),
  targetCarbs: real('target_carbs').notNull(),
  targetFat: real('target_fat').notNull(),
  targetVitaminA: real('target_vitamin_a'),
  targetVitaminC: real('target_vitamin_c'),
  targetVitaminD: real('target_vitamin_d'),
  targetVitaminB6: real('target_vitamin_b6'),
  targetVitaminE: real('target_vitamin_e'),
  targetVitaminK: real('target_vitamin_k'),
  targetThiamin: real('target_thiamin'),
  targetVitaminB12: real('target_vitamin_b12'),
  targetRiboflavin: real('target_riboflavin'),
  targetFolate: real('target_folate'),
  targetNiacin: real('target_niacin'),
  targetCholine: real('target_choline'),
  targetPantothenicAcid: real('target_pantothenic_acid'),
  targetBiotin: real('target_biotin'),
  targetCarotenoids: real('target_carotenoids'),
  targetCalcium: real('target_calcium'),
  targetChloride: real('target_chloride'),
  targetChromium: real('target_chromium'),
  targetCopper: real('target_copper'),
  targetFluoride: real('target_fluoride'),
  targetIodine: real('target_iodine'),
  targetIron: real('target_iron'),
  targetMagnesium: real('target_magnesium'),
  targetManganese: real('target_manganese'),
  targetMolybdenum: real('target_molybdenum'),
  targetPhosphorus: real('target_phosphorus'),
  targetPotassium: real('target_potassium'),
  targetSelenium: real('target_selenium'),
  targetSodium: real('target_sodium'),
  targetZinc: real('target_zinc'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// Weight entries table
export const weightEntries = sqliteTable('weight_entries', {
  id: text('id').primaryKey(),
  weight: real('weight').notNull(),
  date: text('date').notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => ({
  dateIdx: index('idx_weight_entries_date').on(table.date),
}));

// Export types for use in the application
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

export type DailyNutrition = typeof dailyNutrition.$inferSelect;
export type NewDailyNutrition = typeof dailyNutrition.$inferInsert;

export type FoodItem = typeof foodItems.$inferSelect;
export type NewFoodItem = typeof foodItems.$inferInsert;

export type FoodEntry = typeof foodEntries.$inferSelect;
export type NewFoodEntry = typeof foodEntries.$inferInsert;

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;

export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type NewRecipeIngredient = typeof recipeIngredients.$inferInsert;

export type WorkoutTemplate = typeof workoutTemplates.$inferSelect;
export type NewWorkoutTemplate = typeof workoutTemplates.$inferInsert;

export type ExerciseTemplate = typeof exerciseTemplates.$inferSelect;
export type NewExerciseTemplate = typeof exerciseTemplates.$inferInsert;

export type WorkoutTemplateExercise = typeof workoutTemplateExercises.$inferSelect;
export type NewWorkoutTemplateExercise = typeof workoutTemplateExercises.$inferInsert;

export type WorkoutEntry = typeof workoutEntries.$inferSelect;
export type NewWorkoutEntry = typeof workoutEntries.$inferInsert;

export type ActiveWorkoutSession = typeof activeWorkoutSession.$inferSelect;
export type NewActiveWorkoutSession = typeof activeWorkoutSession.$inferInsert;

export type UserProfile = typeof userProfile.$inferSelect;
export type NewUserProfile = typeof userProfile.$inferInsert;

export type WeightEntry = typeof weightEntries.$inferSelect;
export type NewWeightEntry = typeof weightEntries.$inferInsert;
