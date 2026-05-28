import migrations from '@/drizzle/migrations';
import * as schema from '@/services/db/schema';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { rawDb } from '@/services/db/rawDb';

export const db = drizzle(rawDb, { schema });

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

// Export the database instance for direct use
export default db;
