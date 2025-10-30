import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync, deleteDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';
import * as schema from '@/services/db/schema';

export const DATABASE_NAME = 'fitness.db';

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

// Initialize database - check for old schema and reset if needed BEFORE any drizzle operations
const expoDb = (() => {
  let database = openDatabaseSync(DATABASE_NAME);
  
  // If old schema detected, delete and recreate
  if (hasOldSchema(database)) {
    console.log('🔄 Old database schema detected. Resetting database...');
    try {
      database.closeSync();
      deleteDatabaseSync(DATABASE_NAME);
      console.log('✅ Old database deleted');
      // Reopen with fresh database
      database = openDatabaseSync(DATABASE_NAME);
      console.log('✅ New database created');
    } catch (error) {
      console.error('❌ Error resetting database:', error);
      throw error;
    }
  }
  
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
  console.log('⚠️ Database reset requested. Please restart the app after this.');
  try {
    expoDb.closeSync();
    console.log('Database closed.');
    deleteDatabaseSync(DATABASE_NAME);
    console.log('Database file deleted. Please restart the app to recreate.');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
};

// Export the database instance for direct use
export default db;
