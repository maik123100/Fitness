import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { getActiveWorkoutSession, updateActiveWorkoutSession, finishWorkoutSession, getWorkoutTemplateExercises, getExerciseTemplate, getWorkoutEntry, updateWorkoutEntry } from '@/services/database';
import { ActiveWorkoutSession, WorkoutTemplateExercise, WorkoutSet, WorkoutEntry } from '@/types/types'
import { draculaTheme, spacing, borderRadius, typography } from '@/styles/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface WorkoutSessionState {
  session: ActiveWorkoutSession | WorkoutEntry | null;
  exercises: (WorkoutTemplateExercise & { exercise_name: string })[];
  isEditing: boolean;
  elapsedTime: number; // Added for timer
}

export default function WorkoutSessionScreen() {
  const [state, setState] = useState<WorkoutSessionState>({ session: null, exercises: [], isEditing: false, elapsedTime: 0 });
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { workoutEntryId } = params;

  const { session, exercises, isEditing, elapsedTime } = state;

  useEffect(() => {
    if (workoutEntryId) {
      loadWorkoutEntry(workoutEntryId as string);
    } else {
      loadActiveSession();
    }
  }, [workoutEntryId]);

  useEffect(() => {
    let interval: number | undefined;
    if (session && !isEditing && 'start_time' in session) {
      const calculateElapsedTime = () => {
        setState(prev => ({
          ...prev,
          elapsedTime: Math.floor((Date.now() - (session as ActiveWorkoutSession).start_time) / 1000),
        }));
      };
      calculateElapsedTime(); // Initial calculation
      interval = setInterval(calculateElapsedTime, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [session, isEditing]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const loadActiveSession = () => {
    const activeSession = getActiveWorkoutSession();
    if (activeSession) {
      const templateExercises = getWorkoutTemplateExercises(activeSession.workout_template_id);
      const exercisesWithDetails = templateExercises.map(te => {
        const exerciseTemplate = getExerciseTemplate(te.exercise_template_id);
        return {
          ...te,
          exercise_name: exerciseTemplate?.name || 'Unknown Exercise',
        };
      });
      setState({ session: activeSession, exercises: exercisesWithDetails, isEditing: false, elapsedTime: 0 });
    }
  };

  const loadWorkoutEntry = (id: string) => {
    const workoutEntry = getWorkoutEntry(id);
    if (workoutEntry) {
      const templateExercises = getWorkoutTemplateExercises(workoutEntry.workout_template_id);
      const exercisesWithDetails = templateExercises.map(te => {
        const exerciseTemplate = getExerciseTemplate(te.exercise_template_id);
        return {
          ...te,
          exercise_name: exerciseTemplate?.name || 'Unknown Exercise',
        };
      });
      setState(prev => ({ ...prev, session: workoutEntry, exercises: exercisesWithDetails, isEditing: true }));
    }
  };

  const handleSetUpdate = (setId: string, field: keyof WorkoutSet, value: string | number | boolean) => {
    if (session) {
      const newSets = session.sets.map((set: WorkoutSet) => {
        if (set.id === setId) {
          return { ...set, [field]: value };
        }
        return set;
      });
      const newSession = { ...session, sets: newSets };
      setState(prev => ({ ...prev, session: newSession }));
      if (!isEditing) {
        updateActiveWorkoutSession(newSession as ActiveWorkoutSession);
      }
    }
  };

  const handleFinishWorkout = () => {
    if (session) {
      if (isEditing) {
        updateWorkoutEntry(session as WorkoutEntry);
      } else {
        finishWorkoutSession(session as ActiveWorkoutSession);
      }
      router.back();
    }
  };

  if (!session) {
    return (
      <View style={[styles.container, { paddingTop: insets.top * 2 }]}>
        <Text style={styles.errorText}>No active workout session found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

                      {isEditing && (
                        <View style={[styles.durationContainer, { paddingTop: insets.top }]}>
                            <Text style={styles.inputLabel}>Duration (mins)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Duration"
                                placeholderTextColor={draculaTheme.comment}
                                keyboardType="numeric"
                                value={isEditing && session && 'duration' in session ? session.duration.toString() : '0'}
                                onChangeText={(value) => {
                                  if (isEditing && session && 'duration' in session) {
                                    setState(prev => ({ ...prev, session: { ...prev.session, duration: parseInt(value) || 0 } as WorkoutEntry}));
                                  }
                                }}
                            />
                        </View>
                      )}

      {!isEditing && session && 'start_time' in session && (
        <View style={styles.embeddedTimerContainer}>
          <Text style={styles.embeddedTimerText}>Time: {formatTime(elapsedTime)}</Text>
        </View>
      )}
                      <FlatList
                        data={exercises}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingTop: insets.top, paddingHorizontal: spacing.md }}
                        renderItem={({ item }) => (
                          <View style={styles.exerciseCard}>
                            <View>
                              <Text style={styles.exerciseTitle}>{item.exercise_name}</Text>
                              {session.sets.filter((set: WorkoutSet) => set.workout_template_exercise_id === item.id).map((set: WorkoutSet, index: number) => (
                                <View key={set.id}>
                                  {index === 0 && (
                  <View style={styles.setLabelsRow}>
                    <View style={styles.setNumberPlaceholder} />
                    <Text style={styles.inputLabel}>Target Weight</Text>
                    <Text style={styles.inputLabel}>Target Reps</Text>
                    <Text style={styles.inputLabel}>Weight</Text>
                    <Text style={styles.inputLabel}>Reps</Text>
                    <View style={styles.checkboxPlaceholder} />
                  </View>
                )}
                <View style={styles.setContainer}>
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
              </View>
            ))}
            </View>
          </View>
        )}
      />
      <TouchableOpacity style={styles.finishButton} onPress={handleFinishWorkout}>
        <Text style={styles.finishButtonText}>{isEditing ? 'Update Workout' : 'Finish Workout'}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
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
