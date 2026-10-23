import { db } from "@/services/db";
import * as schema from "@/services/db/schema";
import type { Activity } from "@/services/db/schema";
import { desc, eq } from "drizzle-orm";

// ============== Activity Functions ==============

export const addActivity = (activity: Activity): void => {
  db.insert(schema.activities).values({
    id: activity.id,
    activity: activity.activity,
    calories: activity.calories,
    type: activity.type,
    timestamp: activity.timestamp,
  }).run();
};

export const getRecentActivities = (limit: number = 10): Activity[] => {
  return db
    .select()
    .from(schema.activities)
    .orderBy(desc(schema.activities.timestamp))
    .limit(limit)
    .all() as Activity[];
};

export const updateActivity = (activity: Activity): void => {
  db.update(schema.activities)
    .set({
      activity: activity.activity,
      calories: activity.calories,
    })
    .where(eq(schema.activities.id, activity.id))
    .run();
};

export const deleteActivity = (id: string): void => {
  db.delete(schema.activities).where(eq(schema.activities.id, id)).run();
};

