import migrations from '@/drizzle/migrations';
import * as schema from '@/services/db/schema';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

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

const hasColumn = (dbInstance: SQLiteDatabase, tableName: string, columnName: string): boolean => {
  try {
    const columns = dbInstance.getAllSync<{ name: string }>(`PRAGMA table_info(${tableName})`);
    return columns.some((column) => column.name === columnName);
  } catch {
    return false;
  }
};

// Function to check if database has old schema
const hasOldSchema = (dbInstance: SQLiteDatabase): boolean => {
  try {
    // Check if schema_version table exists (from old database system)
    const result = dbInstance.getFirstSync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'"
    );
    return result !== null;
  } catch {
    return false;
  }
};

const makeCreateStatementsIdempotent = (statement: string): string => {
  if (statement.startsWith('CREATE TABLE ') && !statement.startsWith('CREATE TABLE IF NOT EXISTS ')) {
    return statement.replace('CREATE TABLE ', 'CREATE TABLE IF NOT EXISTS ');
  }

  if (statement.startsWith('CREATE INDEX ') && !statement.startsWith('CREATE INDEX IF NOT EXISTS ')) {
    return statement.replace('CREATE INDEX ', 'CREATE INDEX IF NOT EXISTS ');
  }

  return statement;
};

const ensureSchemaInitialized = (dbInstance: SQLiteDatabase): void => {
  // Always attempt to apply bootstrap/migration SQL idempotently on startup.
  // This ensures ALTER TABLE migrations (like adding new columns) are applied
  // before any runtime code performs writes against the database.
  console.log('🛠️ Applying bootstrap/migrations (idempotent) on startup...');

  const migrationEntries = [...migrations.journal.entries].sort((a, b) => a.idx - b.idx);

  for (const entry of migrationEntries) {
    const migrationKey = `m${entry.idx.toString().padStart(4, '0')}`;
    const migrationSql = migrations.migrations[migrationKey as keyof typeof migrations.migrations];

    if (!migrationSql) {
      throw new Error(`Missing migration SQL for key ${migrationKey}`);
    }

    const statements = migrationSql
      .split('--> statement-breakpoint')
      .map((statement: string) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      const safeStatement = makeCreateStatementsIdempotent(statement);

      try {
        dbInstance.execSync(safeStatement);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const isIgnorableAlterError = safeStatement.startsWith('ALTER TABLE ') &&
          (message.includes('duplicate column name') || message.includes('already exists'));

        if (!isIgnorableAlterError) {
          throw error;
        }
      }
    }
  }
};

// Initialize database - check for old schema and reset if needed BEFORE any drizzle operations
const expoDb = (() => {
  const database = openDatabaseSync(DATABASE_NAME);

  if (hasOldSchema(database)) {
    console.log('🔄 Legacy database schema detected. Continuing with migrations...');
  }

  ensureSchemaInitialized(database);

  return database;
})();

// Create Drizzle instance with schema AFTER database is properly initialized
export const db = drizzle(expoDb, { schema });

// Export the raw expo database for compatibility
export const rawDb = expoDb;

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
