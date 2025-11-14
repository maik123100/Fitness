// ============================================================================
// Application Types - Non-Database Entities
// ============================================================================
// This file contains only types that are NOT directly mapped to database tables.
// For database entity types, import directly from '@/services/db/schema'
//
// Exception: Some Drizzle types have JSON fields stored as strings that need
// to be parsed. For these, we provide application-level types with the parsed structure.
// ============================================================================

import type * as Schema from '@/services/db/schema';

// ============================================================================
// Composed/Helper Types - These are NOT database tables
// ============================================================================

// Base nutrition field types for composition
export interface BaseNutritionFields {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface VitaminFields {
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

export interface MineralFields {
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

// Complete nutrition fields combining all nutrients
export interface CompleteNutritionFields extends BaseNutritionFields, VitaminFields, MineralFields { }

// ============================================================================
// Non-Database Entity Types
// ============================================================================

// SetTarget is used in workout exercises but stored as JSON in the database
export interface SetTarget {
  reps: number;
  weight: number;
}

// WorkoutSet is used during active workouts and stored as JSON in the database
export interface WorkoutSet {
  id: string;
  workoutTemplateExerciseId: string;
  weight: number;
  reps: number;
  targetReps: number;
  targetWeight: number;
  completed: boolean;
}

// NutritionSummary is a computed type for displaying aggregated nutrition data
export interface NutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalVitamins: VitaminFields;
  totalMinerals: MineralFields;
  caloriesBurned: number;
  netCalories: number;
}

// ============================================================================
// Application-level types for entities with JSON fields
// ============================================================================
// These types transform Drizzle string fields (JSON) into their parsed form

export interface ExerciseTemplate {
  id: string;
  name: string;
  defaultSetTargets: SetTarget[];
}

export interface WorkoutTemplateExercise {
  id: string;
  workoutTemplateId: string;
  exerciseTemplateId: string;
  setTargets: SetTarget[];
  order: number;
}

export interface WorkoutEntry {
  id: string;
  workoutTemplateId: string;
  date: string;
  duration: number;
  caloriesBurned: number;
  sets: WorkoutSet[];
  createdAt: number;
}

export interface ActiveWorkoutSession {
  id: string;
  workoutTemplateId: string;
  startTime: number;
  date: string;
  sets: WorkoutSet[];
}

