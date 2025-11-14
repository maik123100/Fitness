import { ExerciseTemplate } from '@/types/types';

export const mockExerciseTemplates: ExerciseTemplate[] = [
  // Chest Exercises
  {
    id: 'exercise-bench-press',
    name: 'Bench Press',
    defaultSetTargets: [
      { reps: 8, weight: 60 },
      { reps: 8, weight: 60 },
      { reps: 8, weight: 60 },
      { reps: 8, weight: 60 },
    ],
  },
  {
    id: 'exercise-incline-bench-press',
    name: 'Incline Bench Press',
    defaultSetTargets: [
      { reps: 10, weight: 50 },
      { reps: 10, weight: 50 },
      { reps: 10, weight: 50 },
    ],
  },
  {
    id: 'exercise-dumbbell-flyes',
    name: 'Dumbbell Flyes',
    defaultSetTargets: [
      { reps: 12, weight: 20 },
      { reps: 12, weight: 20 },
      { reps: 12, weight: 20 },
    ],
  },
  {
    id: 'exercise-push-ups',
    name: 'Push-ups',
    defaultSetTargets: [
      { reps: 15, weight: 0 },
      { reps: 15, weight: 0 },
      { reps: 15, weight: 0 },
    ],
  },

  // Back Exercises
  {
    id: 'exercise-deadlift',
    name: 'Deadlift',
    defaultSetTargets: [
      { reps: 5, weight: 100 },
      { reps: 5, weight: 100 },
      { reps: 5, weight: 100 },
    ],
  },
  {
    id: 'exercise-pull-ups',
    name: 'Pull-ups',
    defaultSetTargets: [
      { reps: 8, weight: 0 },
      { reps: 8, weight: 0 },
      { reps: 8, weight: 0 },
    ],
  },
  {
    id: 'exercise-barbell-row',
    name: 'Barbell Row',
    defaultSetTargets: [
      { reps: 8, weight: 60 },
      { reps: 8, weight: 60 },
      { reps: 8, weight: 60 },
    ],
  },
  {
    id: 'exercise-lat-pulldown',
    name: 'Lat Pulldown',
    defaultSetTargets: [
      { reps: 10, weight: 50 },
      { reps: 10, weight: 50 },
      { reps: 10, weight: 50 },
    ],
  },

  // Leg Exercises
  {
    id: 'exercise-squat',
    name: 'Squat',
    defaultSetTargets: [
      { reps: 8, weight: 80 },
      { reps: 8, weight: 80 },
      { reps: 8, weight: 80 },
      { reps: 8, weight: 80 },
    ],
  },
  {
    id: 'exercise-leg-press',
    name: 'Leg Press',
    defaultSetTargets: [
      { reps: 10, weight: 120 },
      { reps: 10, weight: 120 },
      { reps: 10, weight: 120 },
    ],
  },
  {
    id: 'exercise-lunges',
    name: 'Lunges',
    defaultSetTargets: [
      { reps: 12, weight: 20 },
      { reps: 12, weight: 20 },
      { reps: 12, weight: 20 },
    ],
  },
  {
    id: 'exercise-leg-curl',
    name: 'Leg Curl',
    defaultSetTargets: [
      { reps: 12, weight: 40 },
      { reps: 12, weight: 40 },
      { reps: 12, weight: 40 },
    ],
  },

  // Shoulder Exercises
  {
    id: 'exercise-overhead-press',
    name: 'Overhead Press',
    defaultSetTargets: [
      { reps: 8, weight: 40 },
      { reps: 8, weight: 40 },
      { reps: 8, weight: 40 },
    ],
  },
  {
    id: 'exercise-lateral-raises',
    name: 'Lateral Raises',
    defaultSetTargets: [
      { reps: 12, weight: 10 },
      { reps: 12, weight: 10 },
      { reps: 12, weight: 10 },
    ],
  },
  {
    id: 'exercise-front-raises',
    name: 'Front Raises',
    defaultSetTargets: [
      { reps: 12, weight: 10 },
      { reps: 12, weight: 10 },
      { reps: 12, weight: 10 },
    ],
  },

  // Arm Exercises
  {
    id: 'exercise-bicep-curl',
    name: 'Bicep Curl',
    defaultSetTargets: [
      { reps: 10, weight: 15 },
      { reps: 10, weight: 15 },
      { reps: 10, weight: 15 },
    ],
  },
  {
    id: 'exercise-hammer-curl',
    name: 'Hammer Curl',
    defaultSetTargets: [
      { reps: 10, weight: 15 },
      { reps: 10, weight: 15 },
      { reps: 10, weight: 15 },
    ],
  },
  {
    id: 'exercise-tricep-dips',
    name: 'Tricep Dips',
    defaultSetTargets: [
      { reps: 10, weight: 0 },
      { reps: 10, weight: 0 },
      { reps: 10, weight: 0 },
    ],
  },
  {
    id: 'exercise-tricep-extension',
    name: 'Tricep Extension',
    defaultSetTargets: [
      { reps: 12, weight: 20 },
      { reps: 12, weight: 20 },
      { reps: 12, weight: 20 },
    ],
  },

  // Core Exercises
  {
    id: 'exercise-plank',
    name: 'Plank',
    defaultSetTargets: [
      { reps: 60, weight: 0 }, // 60 seconds
      { reps: 60, weight: 0 },
      { reps: 60, weight: 0 },
    ],
  },
  {
    id: 'exercise-crunches',
    name: 'Crunches',
    defaultSetTargets: [
      { reps: 20, weight: 0 },
      { reps: 20, weight: 0 },
      { reps: 20, weight: 0 },
    ],
  },
  {
    id: 'exercise-russian-twists',
    name: 'Russian Twists',
    defaultSetTargets: [
      { reps: 20, weight: 10 },
      { reps: 20, weight: 10 },
      { reps: 20, weight: 10 },
    ],
  },
];
