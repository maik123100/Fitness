import migrations from '@/drizzle/migrations';
import * as schema from '@/services/db/schema';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { openDatabaseSync } from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'fitness.db';

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

const expoDb = openDatabaseSync(DATABASE_NAME);

export const db = drizzle(expoDb, { schema });

// Hook to initialize migrations
export function useDatabase() {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    console.error('❌ Migration error:', error);
  } else if (success) {
    console.log('✅ Database migrations completed successfully');
  }

  return { success, error };
}

// Reset database (for development/testing)
export const resetDatabase = (): void => {
  console.log('⚠️ Database reset requested. Clearing app data...');
  try {
    expoDb.execSync('PRAGMA foreign_keys = OFF;');
    expoDb.execSync('BEGIN;');

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
      if (!hasTable(expoDb, tableName)) {
        continue;
      }
      expoDb.execSync(`DELETE FROM ${tableName};`);
    }

    expoDb.execSync('COMMIT;');
    expoDb.execSync('PRAGMA foreign_keys = ON;');
    console.log('✅ Database data cleared.');
  } catch (error) {
    try {
      expoDb.execSync('ROLLBACK;');
      expoDb.execSync('PRAGMA foreign_keys = ON;');
    } catch {
      // Ignore cleanup errors after failed reset
    }
    console.error('Error resetting database:', error);
    throw error;
  }
};

// Export the database instance for direct use
export default db;
