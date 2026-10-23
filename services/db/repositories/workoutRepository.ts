import { db } from "@/services/db";
import * as schema from "@/services/db/schema";
import type { WorkoutTemplate } from "@/services/db/schema";
import type { ActiveWorkoutSession, ExerciseTemplate, WorkoutEntry, WorkoutSet, WorkoutTemplateExercise } from "@/types/types";
import { asc, desc, eq } from "drizzle-orm";
// ============== Workout Functions ==============

export const addWorkoutTemplate = (template: WorkoutTemplate): void => {
  db.insert(schema.workoutTemplates).values({
    id: template.id,
    name: template.name,
  }).run();
};

export const getWorkoutTemplates = (): WorkoutTemplate[] => {
  return db.select().from(schema.workoutTemplates).all();
};

export const getWorkoutTemplate = (id: string): WorkoutTemplate | null => {
  return db.select().from(schema.workoutTemplates).where(eq(schema.workoutTemplates.id, id)).get() ?? null;
};

export const addExerciseTemplate = (template: ExerciseTemplate): void => {
  db.insert(schema.exerciseTemplates).values({
    id: template.id,
    name: template.name,
    defaultSetTargets: JSON.stringify(template.defaultSetTargets),
  }).run();
};

export const getExerciseTemplates = (): ExerciseTemplate[] => {
  return db.select().from(schema.exerciseTemplates).all().map(row => ({
    id: row.id,
    name: row.name,
    defaultSetTargets: JSON.parse(row.defaultSetTargets),
  }));
};

export const getExerciseTemplate = (id: string): ExerciseTemplate | null => {
  const row = db.select().from(schema.exerciseTemplates).where(eq(schema.exerciseTemplates.id, id)).get();
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    defaultSetTargets: JSON.parse(row.defaultSetTargets),
  };
};

export const deleteExerciseTemplate = (id: string): void => {
  db.delete(schema.exerciseTemplates).where(eq(schema.exerciseTemplates.id, id)).run();
};

export const updateExerciseTemplate = (template: ExerciseTemplate): void => {
  db.update(schema.exerciseTemplates)
    .set({
      name: template.name,
      defaultSetTargets: JSON.stringify(template.defaultSetTargets),
    })
    .where(eq(schema.exerciseTemplates.id, template.id))
    .run();
};

export const addWorkoutTemplateExercise = (exercise: WorkoutTemplateExercise): void => {
  db.insert(schema.workoutTemplateExercises).values({
    id: exercise.id,
    workoutTemplateId: exercise.workoutTemplateId,
    exerciseTemplateId: exercise.exerciseTemplateId,
    setTargets: JSON.stringify(exercise.setTargets),
    order: exercise.order,
  }).run();
};

export const getWorkoutTemplateExercises = (templateId: string): WorkoutTemplateExercise[] => {
  return db
    .select()
    .from(schema.workoutTemplateExercises)
    .where(eq(schema.workoutTemplateExercises.workoutTemplateId, templateId))
    .orderBy(asc(schema.workoutTemplateExercises.order))
    .all()
    .map(row => ({
      id: row.id,
      workoutTemplateId: row.workoutTemplateId,
      exerciseTemplateId: row.exerciseTemplateId,
      setTargets: JSON.parse(row.setTargets),
      order: row.order,
    }));
};

// ============== Active Workout Session Functions ==============

export const startWorkoutSession = (templateId: string, date: string): ActiveWorkoutSession => {
  // Delete any existing session
  db.delete(schema.activeWorkoutSession).run();

  const exercises = getWorkoutTemplateExercises(templateId);
  const sets: WorkoutSet[] = exercises.flatMap(exercise => {
    const exerciseTemplate = getExerciseTemplate(exercise.exerciseTemplateId);
    if (!exerciseTemplate) return [];
    return exercise.setTargets.map((target, index) => ({
      id: `${exercise.id}-${index}`,
      workoutTemplateExerciseId: exercise.id,
      weight: 0,
      reps: 0,
      targetReps: target.reps,
      targetWeight: target.weight,
      completed: false,
    }));
  });

  const newSession: ActiveWorkoutSession = {
    id: Date.now().toString(),
    workoutTemplateId: templateId,
    startTime: Date.now(),
    date: date,
    sets,
  };

  db.insert(schema.activeWorkoutSession).values({
    id: newSession.id,
    workoutTemplateId: newSession.workoutTemplateId,
    startTime: newSession.startTime,
    date: newSession.date,
    sets: JSON.stringify(newSession.sets),
  }).run();

  return newSession;
};

export const getActiveWorkoutSession = (): ActiveWorkoutSession | null => {
  const row = db.select().from(schema.activeWorkoutSession).limit(1).get();
  if (!row) return null;

  return {
    id: row.id,
    workoutTemplateId: row.workoutTemplateId,
    startTime: row.startTime,
    date: row.date,
    sets: JSON.parse(row.sets),
  };
};

export const updateActiveWorkoutSession = (session: ActiveWorkoutSession): void => {
  db.update(schema.activeWorkoutSession)
    .set({ sets: JSON.stringify(session.sets) })
    .where(eq(schema.activeWorkoutSession.id, session.id))
    .run();
};

export const finishWorkoutSession = (session: ActiveWorkoutSession, caloriesBurned: number = 0): void => {
  const newEntry: WorkoutEntry = {
    id: Date.now().toString(),
    workoutTemplateId: session.workoutTemplateId,
    date: session.date,
    duration: Math.round((Date.now() - session.startTime) / 60000),
    caloriesBurned: caloriesBurned,
    sets: session.sets.filter((set) => set.completed),
    createdAt: Date.now(),
  };

  db.insert(schema.workoutEntries).values({
    id: newEntry.id,
    workoutTemplateId: newEntry.workoutTemplateId,
    date: newEntry.date,
    duration: newEntry.duration,
    caloriesBurned: newEntry.caloriesBurned,
    sets: JSON.stringify(newEntry.sets),
    createdAt: newEntry.createdAt,
  }).run();

  db.delete(schema.activeWorkoutSession).run();
};

// ============== Workout Entry Functions ==============

export const getWorkoutEntries = (date: string): WorkoutEntry[] => {
  return db
    .select()
    .from(schema.workoutEntries)
    .where(eq(schema.workoutEntries.date, date))
    .orderBy(desc(schema.workoutEntries.createdAt))
    .all()
    .map(row => ({
      id: row.id,
      workoutTemplateId: row.workoutTemplateId,
      date: row.date,
      duration: row.duration,
      caloriesBurned: row.caloriesBurned || 0,
      sets: JSON.parse(row.sets),
      createdAt: row.createdAt,
    }));
};

export const getWorkoutEntry = (id: string): WorkoutEntry | null => {
  const row = db.select().from(schema.workoutEntries).where(eq(schema.workoutEntries.id, id)).get();
  if (!row) return null;
  return {
    id: row.id,
    workoutTemplateId: row.workoutTemplateId,
    date: row.date,
    duration: row.duration,
    caloriesBurned: row.caloriesBurned || 0,
    sets: JSON.parse(row.sets),
    createdAt: row.createdAt,
  };
};

export const updateWorkoutEntry = (entry: WorkoutEntry): void => {
  db.update(schema.workoutEntries)
    .set({
      duration: entry.duration,
      caloriesBurned: entry.caloriesBurned,
      sets: JSON.stringify(entry.sets),
    })
    .where(eq(schema.workoutEntries.id, entry.id))
    .run();
};

export const deleteWorkoutEntry = (id: string): void => {
  db.delete(schema.workoutEntries).where(eq(schema.workoutEntries.id, id)).run();
};

