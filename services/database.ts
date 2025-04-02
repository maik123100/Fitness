import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

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

export const initDatabase = (): void => {
  if (!db) {
    db = SQLite.openDatabaseSync('fitness.db');
    
    db.execSync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        activity TEXT NOT NULL,
        calories INTEGER NOT NULL,
        type TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS daily_nutrition (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fat REAL NOT NULL
      );
    `);
  }
};

export const addActivity = (activity: Activity): void => {
  db.runSync(
    'INSERT INTO activities (id, activity, calories, type, timestamp) VALUES (?, ?, ?, ?, ?)',
    [activity.id, activity.activity, activity.calories, activity.type, activity.timestamp]
  );
};

export const getRecentActivities = (limit: number = 10): Activity[] => {
  if(!db) {
    console.error('Database not initialized. Call initDatabase() first.');
    return [];
  }
  console.log('Fetching recent activities from database...');
  return db.getAllSync<Activity>(
    'SELECT * FROM activities ORDER BY timestamp DESC LIMIT ?',
    [limit]
  );
};

export const updateDailyNutrition = (nutrition: DailyNutrition): void => {
  db.runSync(
    `INSERT OR REPLACE INTO daily_nutrition (id, date, protein, carbs, fat) 
     VALUES (?, ?, ?, ?, ?)`,
    [nutrition.id, nutrition.date, nutrition.protein, nutrition.carbs, nutrition.fat]
  );
};

export const getDailyNutrition = (date: string): DailyNutrition | null => {
  return db.getFirstSync<DailyNutrition>(
    'SELECT * FROM daily_nutrition WHERE date = ?',
    [date]
  );
};

export const resetDatabase = (): void => {
  db.execSync(`
    DELETE FROM activities;
    DELETE FROM daily_nutrition;
  `);
};

export const updateActivity = (activity: Activity): void => {
  db.runSync(
    'UPDATE activities SET activity = ?, calories = ? WHERE id = ?',
    [activity.activity, activity.calories, activity.id]
  );
};

export const deleteActivity = (id: string): void => {
  db.runSync('DELETE FROM activities WHERE id = ?', [id]);
};
