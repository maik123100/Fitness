import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { getActiveWorkoutSession, updateActiveWorkoutSession, finishWorkoutSession, getWorkoutTemplateExercises, getExerciseTemplate, getWorkoutEntry, updateWorkoutEntry } from '@/services/database';
import { ActiveWorkoutSession, WorkoutTemplateExercise, WorkoutSet, WorkoutEntry } from '@/types/types'
import { draculaTheme, spacing, borderRadius, typography } from '@/styles/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function WorkoutSessionScreen() {
  // Separate state for clarity
  const [session, setSession] = useState<ActiveWorkoutSession | WorkoutEntry | null>(null);
  const [exercises, setExercises] = useState<(WorkoutTemplateExercise & { exercise_name: string })[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState('0');

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { workoutEntryId } = params;

  // Load workout on mount
  useEffect(() => {
    if (workoutEntryId) {
      loadWorkoutEntry(workoutEntryId as string);
    } else {
      loadActiveSession();
    }
  }, [workoutEntryId]);

  // Timer for active workouts
  useEffect(() => {
    // Only run timer for active sessions (not when editing finished workouts)
    if (!session || isEditing) {
      return;
    }

    const activeSession = session as ActiveWorkoutSession;
    if (!activeSession.start_time) {
      return;
    }

    // Update elapsed time every second
    const updateTimer = () => {
      const secondsElapsed = Math.floor((Date.now() - activeSession.start_time) / 1000);
      setElapsedTime(secondsElapsed);
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [session, isEditing]);

  // Helper function to format time as HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Helper function to load exercise details for a workout
  const loadExercisesForWorkout = (workoutTemplateId: string) => {
    const templateExercises = getWorkoutTemplateExercises(workoutTemplateId);
    return templateExercises.map(te => {
      const exerciseTemplate = getExerciseTemplate(te.exercise_template_id);
      return {
        ...te,
        exercise_name: exerciseTemplate?.name || 'Unknown Exercise',
      };
    });
  };

  // Load active workout session (for ongoing workouts)
  const loadActiveSession = () => {
    const activeSession = getActiveWorkoutSession();
    if (activeSession) {
      const exercisesWithDetails = loadExercisesForWorkout(activeSession.workout_template_id);
      setSession(activeSession);
      setExercises(exercisesWithDetails);
      setIsEditing(false);
      setElapsedTime(0);
    }
  };

  // Load finished workout entry (for editing completed workouts)
  const loadWorkoutEntry = (id: string) => {
    const workoutEntry = getWorkoutEntry(id);
    if (workoutEntry) {
      const exercisesWithDetails = loadExercisesForWorkout(workoutEntry.workout_template_id);
      setSession(workoutEntry);
      setExercises(exercisesWithDetails);
      setIsEditing(true);
      setCaloriesBurned(workoutEntry.caloriesBurned?.toString() || '0');
    }
  };

  // Update a specific set (weight, reps, or completion status)
  const handleSetUpdate = (setId: string, field: keyof WorkoutSet, value: string | number | boolean) => {
    if (!session) return;

    // Update the set in the session
    const updatedSets = session.sets.map((set: WorkoutSet) => {
      if (set.id === setId) {
        return { ...set, [field]: value };
      }
      return set;
    });

    const updatedSession = { ...session, sets: updatedSets };
    setSession(updatedSession);

    // Save changes for active workouts immediately
    if (!isEditing) {
      updateActiveWorkoutSession(updatedSession as ActiveWorkoutSession);
    }
  };

  // Finish or update the workout
  const handleFinishWorkout = () => {
    if (!session) return;

    const calories = parseFloat(caloriesBurned) || 0;

    if (isEditing) {
      // Editing a finished workout - update it
      const updatedEntry = { ...(session as WorkoutEntry), caloriesBurned: calories };
      updateWorkoutEntry(updatedEntry);
    } else {
      // Finishing an active workout
      finishWorkoutSession(session as ActiveWorkoutSession, calories);
    }

    router.back();
  };

  // Show error if no session found
  if (!session) {
    return (
      <View style={[styles.container, { paddingTop: insets.top * 2 }]}>
        <Text style={styles.errorText}>No active workout session found.</Text>
      </View>
    );
  }

  // Get the workout entry for editing mode
  const workoutEntry = isEditing ? (session as WorkoutEntry) : null;

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Show duration input when editing finished workout */}
        {isEditing && workoutEntry && (
          <View style={styles.durationContainer}>
            <Text style={styles.durationLabel}>Duration (mins)</Text>
            <TextInput
              style={styles.durationInput}
              placeholder="Duration"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={workoutEntry.duration.toString()}
              onChangeText={(value) => {
                const updatedEntry = { ...workoutEntry, duration: parseInt(value) || 0 };
                setSession(updatedEntry);
              }}
            />

            <Text style={[styles.durationLabel, { marginTop: spacing.md }]}>Calories Burned</Text>
            <TextInput
              style={styles.durationInput}
              placeholder="Calories"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={caloriesBurned}
              onChangeText={setCaloriesBurned}
            />
          </View>
        )}

        {/* Show live timer for active workout */}
        {!isEditing && (
          <View style={[styles.embeddedTimerContainer, { marginTop: insets.top }]}>
            <Text style={styles.embeddedTimerText}>{formatTime(elapsedTime)}</Text>
          </View>
        )}

        {/* List of exercises */}
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item: exercise }) => {
            // Get sets for this exercise
            const exerciseSets = session.sets.filter(
              (set: WorkoutSet) => set.workout_template_exercise_id === exercise.id
            );

            return (
              <View style={styles.exerciseCard}>
                <Text style={styles.exerciseTitle}>{exercise.exercise_name}</Text>

                {/* Column headers */}
                <View style={styles.setLabelsRow}>
                  <View style={styles.setNumberPlaceholder} />
                  <Text style={styles.inputLabel}>Target Weight</Text>
                  <Text style={styles.inputLabel}>Target Reps</Text>
                  <Text style={styles.inputLabel}>Weight</Text>
                  <Text style={styles.inputLabel}>Reps</Text>
                  <View style={styles.checkboxPlaceholder} />
                </View>

                {/* Render each set */}
                {exerciseSets.map((set: WorkoutSet, index: number) => (
                  <View key={set.id} style={styles.setContainer}>
                    <Text style={styles.setText}>Set {index + 1}</Text>
                    
                    <Text style={styles.targetValue}>{set.targetWeight} kg</Text>
                    <Text style={styles.targetValue}>{set.targetReps} reps</Text>
                    
                    <TextInput
                      style={styles.input}
                      placeholder="Weight"
                      placeholderTextColor={draculaTheme.comment}
                      keyboardType="numeric"
                      value={set.weight.toString()}
                      onChangeText={(value) => handleSetUpdate(set.id, 'weight', parseFloat(value) || 0)}
                    />
                    
                    <TextInput
                      style={styles.input}
                      placeholder="Reps"
                      placeholderTextColor={draculaTheme.comment}
                      keyboardType="numeric"
                      value={set.reps.toString()}
                      onChangeText={(value) => handleSetUpdate(set.id, 'reps', parseInt(value) || 0)}
                    />
                    
                    <TouchableOpacity onPress={() => handleSetUpdate(set.id, 'completed', !set.completed)}>
                      <Ionicons
                        name={set.completed ? 'checkbox-outline' : 'square-outline'}
                        size={24}
                        color={set.completed ? draculaTheme.cyan : draculaTheme.comment}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            );
          }}
        />
      </View>

      {/* Calories burned input for active workouts */}
      {!isEditing && (
        <View style={styles.caloriesInputContainer}>
          <Text style={styles.caloriesLabel}>Calories Burned (from smartwatch)</Text>
          <TextInput
            style={styles.caloriesInput}
            placeholder="Enter calories burned"
            placeholderTextColor={draculaTheme.comment}
            keyboardType="numeric"
            value={caloriesBurned}
            onChangeText={setCaloriesBurned}
          />
        </View>
      )}

      {/* Finish/Update button */}
      <TouchableOpacity style={styles.finishButton} onPress={handleFinishWorkout}>
        <Text style={styles.finishButtonText}>
          {isEditing ? 'Update Workout' : 'Finish Workout'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: draculaTheme.background,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  durationContainer: {
    flexDirection: 'column',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  durationLabel: {
    color: draculaTheme.comment,
    fontSize: typography.sizes.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    alignSelf: 'flex-end',
  },
  durationInput: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    alignSelf: 'center',
    width: '80%',
  },
  errorText: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  embeddedTimerContainer: {
    backgroundColor: draculaTheme.purple,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: 0, // Removed margin bottom
  },
  embeddedTimerText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.xl, // Larger font size
    fontWeight: typography.weights.bold,
  },
  exerciseCard: {
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  exerciseTitle: {
    fontSize: typography.sizes.xxl, // Even bigger font size
    fontWeight: typography.weights.bold, // Revert to bold
    color: draculaTheme.foreground,
    marginBottom: spacing.md,
    textAlign: 'center', // Center align
  },
  setLabelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  setNumberPlaceholder: {
    width: 50, // Approximate width of "Set X"
    marginRight: spacing.md,
  },
  inputLabel: {
    color: draculaTheme.comment,
    fontSize: typography.sizes.sm,
    flex: 1,
    textAlign: 'center',
    marginRight: spacing.md,
  },
  checkboxPlaceholder: {
    width: 24, // Approximate width of the checkbox/icon
  },
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  setText: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.md,
    marginRight: spacing.md,
  },
  input: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    marginRight: spacing.md,
    flex: 1,
  },
  targetValue: {
    color: draculaTheme.comment,
    fontSize: typography.sizes.md,
    marginRight: spacing.md,
    flex: 1,
    textAlign: 'center',
  },
  caloriesInputContainer: {
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  caloriesLabel: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.md,
    marginBottom: spacing.sm,
    fontWeight: typography.weights.semibold,
  },
  caloriesInput: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  finishButton: {
    backgroundColor: draculaTheme.cyan,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },
  finishButtonText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
