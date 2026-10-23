import migrations from '@/drizzle/migrations';
import * as schema from '@/services/db/schema';
import { rawDb } from '@/services/db/rawDb';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

export const db = drizzle(rawDb, { schema });

export function useDatabaseBootstrap() {
  const { success, error } = useMigrations(db, migrations);
  if (error) console.error('Database migration failed:', error);
  return { success, error };
}
