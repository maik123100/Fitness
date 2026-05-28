import { openDatabaseSync } from 'expo-sqlite';

export const DATABASE_NAME = 'fitness.db';

export const rawDb = openDatabaseSync(DATABASE_NAME);
