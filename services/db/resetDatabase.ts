import { rawDb } from '@/services/db/rawDb';
import type { SQLiteDatabase } from 'expo-sqlite';

const hasTable = (dbInstance: SQLiteDatabase, tableName: string): boolean => {
  try {
    const result = dbInstance.getFirstSync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [tableName]
    );
    return result !== null;
  } catch {
    return false;
  }
};

export const resetDatabase = (): void => {
  console.log('⚠️ Database reset requested. Clearing app data...');

  try {
    rawDb.execSync('PRAGMA foreign_keys = OFF;');
    rawDb.execSync('BEGIN;');

    const tablesToClear = [
      'meal_log_items',
      'meal_logs',
      'saved_meal_items',
      'saved_meals',
      'food_entries',
      'weight_entries',
      'active_workout_session',
      'workout_entries',
      'workout_template_exercises',
      'exercise_templates',
      'workout_templates',
      'recipe_ingredients',
      'recipes',
      'daily_nutrition',
      'activities',
      'target_micro_nutrients',
      'user_profile',
      'food_items',
    ];

    for (const tableName of tablesToClear) {
      if (!hasTable(rawDb, tableName)) {
        continue;
      }

      rawDb.execSync(`DELETE FROM ${tableName};`);
    }

    rawDb.execSync('COMMIT;');
    rawDb.execSync('PRAGMA foreign_keys = ON;');
    console.log('✅ Database data cleared.');
  } catch (error) {
    try {
      rawDb.execSync('ROLLBACK;');
      rawDb.execSync('PRAGMA foreign_keys = ON;');
    } catch {
      // Ignore cleanup errors after failed reset
    }

    console.error('Error resetting database:', error);
    throw error;
  }
};
