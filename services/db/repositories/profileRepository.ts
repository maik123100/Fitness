import { db } from "@/services/db";
import * as schema from "@/services/db/schema";
import type { UserProfile, WeightEntry } from "@/services/db/schema";
import { desc } from "drizzle-orm";
// ============== User Profile Functions ==============

export const saveUserProfile = (profile: UserProfile): void => {
  const now = Date.now();

  db.insert(schema.userProfile).values({
    id: profile.id,
    birthdate: profile.birthdate,
    gender: profile.gender,
    height: profile.height,
    weight: profile.weight,
    activityLevel: profile.activityLevel,
    goalType: profile.goalType,
    targetWeight: profile.targetWeight ?? null,
    targetCalories: profile.targetCalories,
    targetProtein: profile.targetProtein,
    targetCarbs: profile.targetCarbs,
    targetFat: profile.targetFat,
    createdAt: profile.createdAt || now,
    updatedAt: now,
  }).onConflictDoUpdate({
    target: schema.userProfile.id,
    set: {
      birthdate: profile.birthdate,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      activityLevel: profile.activityLevel,
      goalType: profile.goalType,
      targetWeight: profile.targetWeight ?? null,
      targetCalories: profile.targetCalories,
      targetProtein: profile.targetProtein,
      targetCarbs: profile.targetCarbs,
      targetFat: profile.targetFat,
      updatedAt: now,
    },
  }).run();

  // Add a corresponding weight entry
  const weightEntry: WeightEntry = {
    id: `weight-${now}`,
    weight: profile.weight,
    date: new Date().toISOString().split('T')[0],
    createdAt: now,
  };
  addWeightEntry(weightEntry);
};

export const getUserProfile = (): UserProfile | null => {
  const row = db
    .select()
    .from(schema.userProfile)
    .orderBy(desc(schema.userProfile.updatedAt))
    .limit(1)
    .get();

  if (!row) return null;

  return row as UserProfile;
};

// ============== Weight Tracking Functions ==============

export const addWeightEntry = (entry: WeightEntry): void => {
  db.insert(schema.weightEntries).values({
    id: entry.id,
    weight: entry.weight,
    date: entry.date,
    createdAt: entry.createdAt,
  }).run();
};

export const getWeightEntries = (limit: number = 30): WeightEntry[] => {
  return db
    .select()
    .from(schema.weightEntries)
    .orderBy(desc(schema.weightEntries.date))
    .limit(limit)
    .all();
};

