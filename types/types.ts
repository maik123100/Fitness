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

export interface Macronutrients {
  carbs: number;
  fat: number;
  protein: number;
  fiber: number;
}

export interface Vitamins {
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminB6?: number;
  vitaminE?: number;
  vitaminK?: number;
  thiamin?: number;
  vitaminB12?: number;
  riboflavin?: number;
  folate?: number;
  niacin?: number;
  choline?: number;
  pantothenicAcid?: number;
  biotin?: number;
  carotenoids?: number;
}

export interface Minerals {
  calcium?: number;
  chloride?: number;
  chromium?: number;
  copper?: number;
  fluoride?: number;
  iodine?: number;
  iron?: number;
  magnesium?: number;
  manganese?: number;
  molybdenum?: number;
  phosphorus?: number;
  potassium?: number;
  selenium?: number;
  sodium?: number;
  zinc?: number;
}

export interface FoodItem {
    id: string;
    name: string;
    brand?: string;
    barcode?: string;
    category: FoodCategory;
    calories: number;
    macronutrients: Macronutrients;
    vitamins: Vitamins;
    minerals: Minerals;
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
	totalCalories: number;
	totalProtein: number;
	totalCarbs: number;
	totalFat: number;
	totalFiber: number;
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

export interface SetTarget {
	reps: number;
	weight: number;
}

export interface ExerciseTemplate {
	id: string;
	name: string;
	default_set_targets: SetTarget[];
}

export interface WorkoutTemplateExercise {
	id: string;
	workout_template_id: string;
	exercise_template_id: string;
	set_targets: SetTarget[];
	order: number;
}

export interface WorkoutSet {
	id: string;
	workout_template_exercise_id: string;
	weight: number;
	reps: number;
	targetReps: number;
	targetWeight: number;
	completed: boolean;
}

export interface ActiveWorkoutSession {
	id: string;
	workout_template_id: string;
	start_time: number;
	date: string;
	sets: WorkoutSet[];
}

export interface WorkoutEntry {
	id: string;
	workout_template_id: string;
	date: string;
	duration: number;
	sets: WorkoutSet[];
	createdAt: number;
}

export interface UserProfile {
	id: string;
	birthdate: string;
	gender: 'male' | 'female';
	height: number;
	weight: number;
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

export interface NutritionSummary {
	date: string;
	totalCalories: number;
	totalProtein: number;
	totalCarbs: number;
	totalFat: number;
	totalFiber: number;
	totalVitamins: Vitamins;
	totalMinerals: Minerals;
	caloriesBurned: number;
	netCalories: number;
}
