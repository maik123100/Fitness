import { finishWorkoutSession, getActiveWorkoutSession, getExerciseTemplate, getWorkoutEntry, getWorkoutTemplateExercises, updateActiveWorkoutSession, updateWorkoutEntry } from '@/services/database';
import { borderRadius, draculaTheme, spacing, typography } from '@/styles/theme';
import { ActiveWorkoutSession, WorkoutEntry, WorkoutSet, WorkoutTemplateExercise } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WorkoutSessionScreen() {
  // Separate state for clarity
  const [session, setSession] = useState<ActiveWorkoutSession | WorkoutEntry | null>(null);
  const [exercises, setExercises] = useState<(WorkoutTemplateExercise & { exercise_name: string })[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState('0');
  const [currentSetId, setCurrentSetId] = useState<string | null>(null);
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null);
  const [restTimer, setRestTimer] = useState<number>(0);
  const [isResting, setIsResting] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

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

  // Rest timer countdown
  useEffect(() => {
    if (!isResting || restTimer <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setRestTimer(prev => {
        if (prev <= 1) {
          setIsResting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isResting, restTimer]);

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

      // Find the first uncompleted set as current
      const firstUncompletedSet = activeSession.sets.find((s: WorkoutSet) => !s.completed);
      setCurrentSetId(firstUncompletedSet?.id || null);

      // Set current exercise based on first uncompleted set or first exercise
      if (firstUncompletedSet) {
        const exerciseForSet = exercisesWithDetails.find(
          ex => activeSession.sets.some((s: WorkoutSet) => s.id === firstUncompletedSet.id && s.workout_template_exercise_id === ex.id)
        );
        setCurrentExerciseId(exerciseForSet?.id || exercisesWithDetails[0]?.id || null);
      } else {
        setCurrentExerciseId(exercisesWithDetails[0]?.id || null);
      }
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
      setCurrentSetId(null);
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

  // Complete set and start rest timer
  const handleCompleteSet = (setId: string) => {
    if (!session) return;

    const set = session.sets.find((s: WorkoutSet) => s.id === setId);
    if (!set || set.completed) return;

    // Mark set as completed
    handleSetUpdate(setId, 'completed', true);

    // Find next uncompleted set
    const currentSetIndex = session.sets.findIndex((s: WorkoutSet) => s.id === setId);
    const nextSet = session.sets.find((s: WorkoutSet, index: number) => index > currentSetIndex && !s.completed);

    if (nextSet) {
      setCurrentSetId(nextSet.id);
      // Start rest timer (90 seconds default)
      setRestTimer(90);
      setIsResting(true);
    } else {
      setCurrentSetId(null);
    }
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimer(0);
  };

  const addRestTime = (seconds: number) => {
    setRestTimer(prev => prev + seconds);
  };

  // Get recommended next exercise (first exercise with incomplete sets)
  const getRecommendedExercise = () => {
    if (!session) return null;

    for (const exercise of exercises) {
      const exerciseSets = session.sets.filter(
        (set: WorkoutSet) => set.workout_template_exercise_id === exercise.id
      );
      const hasIncompleteSets = exerciseSets.some((s: WorkoutSet) => !s.completed);
      if (hasIncompleteSets) {
        return exercise;
      }
    }
    return null;
  };

  // Switch to a different exercise
  const switchToExercise = (exerciseId: string) => {
    setCurrentExerciseId(exerciseId);

    // Find first incomplete set for this exercise
    if (session) {
      const exerciseSets = session.sets.filter(
        (set: WorkoutSet) => set.workout_template_exercise_id === exerciseId && !set.completed
      );
      if (exerciseSets.length > 0) {
        setCurrentSetId(exerciseSets[0].id);
      }
    }
  };

  // Calculate workout progress
  const calculateProgress = () => {
    if (!session) return { completedSets: 0, totalSets: 0, percentage: 0 };

    const completedSets = session.sets.filter((s: WorkoutSet) => s.completed).length;
    const totalSets = session.sets.length;
    const percentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

    return { completedSets, totalSets, percentage };
  };

  // Finish or update the workout
  const handleFinishWorkout = () => {
    if (!session) return;

    if (isEditing) {
      // Editing a finished workout - update it directly
      const calories = parseFloat(caloriesBurned) || 0;
      const updatedEntry = { ...(session as WorkoutEntry), caloriesBurned: calories };
      updateWorkoutEntry(updatedEntry);
      router.back();
    } else {
      // For active workouts, show modal to input calories
      setShowFinishModal(true);
    }
  };

  const confirmFinishWorkout = () => {
    if (!session) return;

    const calories = parseFloat(caloriesBurned) || 0;
    finishWorkoutSession(session as ActiveWorkoutSession, calories);
    setShowFinishModal(false);
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
  const progress = calculateProgress();

  return (
    <View style={styles.container}>
      {/* Workout Progress Overview */}
      {!isEditing && (
        <View style={[styles.progressContainer, { marginTop: insets.top }]}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Workout Session</Text>
            <View style={styles.timerBadge}>
              <Ionicons name="timer-outline" size={16} color={draculaTheme.text.inverse} />
              <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress.percentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {progress.completedSets}/{progress.totalSets} sets complete ({progress.percentage}%)
          </Text>
        </View>
      )}

      {/* Finish Workout Modal */}
      <Modal
        visible={showFinishModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFinishModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Finish Workout</Text>
            <Text style={styles.modalDescription}>
              Enter calories burned (optional)
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Calories burned"
              placeholderTextColor={draculaTheme.comment}
              keyboardType="numeric"
              value={caloriesBurned}
              onChangeText={setCaloriesBurned}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowFinishModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmFinishWorkout}
              >
                <Text style={styles.modalConfirmButtonText}>Finish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rest Timer Modal */}
      {isResting && (
        <View style={styles.restTimerOverlay}>
          <View style={styles.restTimerCard}>
            <Text style={styles.restTimerTitle}>Rest Timer</Text>
            <Text style={styles.restTimerValue}>{formatTime(restTimer)}</Text>
            <View style={styles.restTimerDots}>
              {[...Array(6)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.restDot,
                    { backgroundColor: i < Math.ceil((restTimer / 90) * 6) ? draculaTheme.green : draculaTheme.surface.secondary }
                  ]}
                />
              ))}
            </View>
            <View style={styles.restTimerButtons}>
              <TouchableOpacity style={styles.restButton} onPress={skipRest}>
                <Text style={styles.restButtonText}>Skip Rest</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.restButton} onPress={() => addRestTime(30)}>
                <Text style={styles.restButtonText}>Add 30s</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Exercise Selection - Only for active workouts */}
      {!isEditing && exercises.length > 0 && (
        <View style={styles.exerciseSelectionContainer}>
          <Text style={styles.exerciseSelectionTitle}>Select Exercise</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exerciseChips}>
            {exercises.map((exercise) => {
              const exerciseSets = session?.sets.filter(
                (set: WorkoutSet) => set.workout_template_exercise_id === exercise.id
              ) || [];
              const completedCount = exerciseSets.filter((s: WorkoutSet) => s.completed).length;
              const totalCount = exerciseSets.length;
              const isRecommended = getRecommendedExercise()?.id === exercise.id;
              const isCurrent = currentExerciseId === exercise.id;
              const isComplete = completedCount === totalCount;

              return (
                <TouchableOpacity
                  key={exercise.id}
                  style={[
                    styles.exerciseChip,
                    isCurrent && styles.exerciseChipActive,
                    isComplete && styles.exerciseChipComplete,
                  ]}
                  onPress={() => switchToExercise(exercise.id)}
                >
                  {isRecommended && !isCurrent && (
                    <View style={styles.recommendedBadge}>
                      <Ionicons name="star" size={12} color={draculaTheme.yellow} />
                    </View>
                  )}
                  {isComplete && (
                    <Ionicons name="checkmark-circle" size={16} color={draculaTheme.green} style={styles.completeIcon} />
                  )}
                  <Text style={[styles.exerciseChipText, isCurrent && styles.exerciseChipTextActive]}>
                    {exercise.exercise_name}
                  </Text>
                  <Text style={[styles.exerciseChipCount, isCurrent && styles.exerciseChipCountActive]}>
                    {completedCount}/{totalCount}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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

        {/* List of exercises - Show only current exercise during active workout, all when editing */}
        {exercises
          .filter(exercise => isEditing || exercise.id === currentExerciseId)
          .map((exercise) => {
            // Get sets for this exercise
            const exerciseSets = session.sets.filter(
              (set: WorkoutSet) => set.workout_template_exercise_id === exercise.id
            );

            const completedSets = exerciseSets.filter((s: WorkoutSet) => s.completed).length;
            const totalSets = exerciseSets.length;

            return (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseTitle}>{exercise.exercise_name}</Text>
                  <Text style={styles.exerciseProgress}>{completedSets}/{totalSets}</Text>
                </View>

                {/* Render each set with improved UI */}
                {exerciseSets.map((set: WorkoutSet, index: number) => {
                  const isCurrentSet = !isEditing && set.id === currentSetId;
                  const isPendingSet = !set.completed && !isCurrentSet;

                  return (
                    <View
                      key={set.id}
                      style={[
                        styles.setCard,
                        set.completed && styles.setCardCompleted,
                        isCurrentSet && styles.setCardCurrent,
                      ]}
                    >
                      <View style={styles.setHeader}>
                        <View style={styles.setNumberContainer}>
                          {set.completed ? (
                            <Ionicons name="checkmark-circle" size={24} color={draculaTheme.green} />
                          ) : isCurrentSet ? (
                            <Ionicons name="play-circle" size={24} color={draculaTheme.cyan} />
                          ) : (
                            <Ionicons name="ellipse-outline" size={24} color={draculaTheme.comment} />
                          )}
                          <Text style={[styles.setNumber, isCurrentSet && styles.setNumberCurrent]}>
                            Set {index + 1}
                          </Text>
                        </View>
                        {isCurrentSet && <Text style={styles.currentLabel}>CURRENT</Text>}
                      </View>

                      <View style={styles.setContent}>
                        {/* Target */}
                        <View style={styles.targetSection}>
                          <Text style={styles.sectionLabel}>Target</Text>
                          <Text style={styles.targetText}>
                            {set.targetWeight} kg × {set.targetReps} reps
                          </Text>
                        </View>

                        {/* Actual Input */}
                        <View style={styles.actualSection}>
                          <Text style={styles.sectionLabel}>Actual</Text>
                          <View style={styles.inputRow}>
                            <TextInput
                              style={[styles.input, isPendingSet && styles.inputDisabled]}
                              placeholder={`${set.targetWeight}`}
                              placeholderTextColor={draculaTheme.comment}
                              keyboardType="numeric"
                              value={set.weight.toString()}
                              onChangeText={(value) => handleSetUpdate(set.id, 'weight', parseFloat(value) || 0)}
                              editable={!isPendingSet}
                            />
                            <Text style={styles.inputUnit}>kg</Text>
                            <Text style={styles.inputSeparator}>×</Text>
                            <TextInput
                              style={[styles.input, isPendingSet && styles.inputDisabled]}
                              placeholder={`${set.targetReps}`}
                              placeholderTextColor={draculaTheme.comment}
                              keyboardType="numeric"
                              value={set.reps.toString()}
                              onChangeText={(value) => handleSetUpdate(set.id, 'reps', parseInt(value) || 0)}
                              editable={!isPendingSet}
                            />
                            <Text style={styles.inputUnit}>reps</Text>
                          </View>
                        </View>
                      </View>

                      {/* Complete Set Button */}
                      {isCurrentSet && !set.completed && (
                        <TouchableOpacity
                          style={styles.completeButton}
                          onPress={() => handleCompleteSet(set.id)}
                        >
                          <Text style={styles.completeButtonText}>Complete Set</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
      </ScrollView>

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
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  progressContainer: {
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: draculaTheme.purple,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  timerText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginLeft: spacing.xs,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: draculaTheme.surface.secondary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: draculaTheme.green,
    borderRadius: borderRadius.sm,
  },
  progressText: {
    fontSize: typography.sizes.sm,
    color: draculaTheme.comment,
    textAlign: 'center',
  },
  restTimerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  restTimerCard: {
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 280,
  },
  restTimerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
    marginBottom: spacing.md,
  },
  restTimerValue: {
    fontSize: 48,
    fontWeight: typography.weights.bold,
    color: draculaTheme.green,
    marginBottom: spacing.md,
  },
  restTimerDots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  restDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  restTimerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  restButton: {
    backgroundColor: draculaTheme.purple,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  restButtonText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
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
  exerciseCard: {
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  exerciseTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
  },
  exerciseProgress: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: draculaTheme.cyan,
  },
  setCard: {
    backgroundColor: draculaTheme.surface.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  setCardCompleted: {
    backgroundColor: draculaTheme.surface.input,
    opacity: 0.7,
  },
  setCardCurrent: {
    borderColor: draculaTheme.cyan,
    backgroundColor: draculaTheme.surface.input,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  setNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  setNumber: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: draculaTheme.foreground,
  },
  setNumberCurrent: {
    color: draculaTheme.cyan,
    fontWeight: typography.weights.bold,
  },
  currentLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: draculaTheme.cyan,
    backgroundColor: draculaTheme.surface.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  setContent: {
    gap: spacing.md,
  },
  targetSection: {
    gap: spacing.xs,
  },
  actualSection: {
    gap: spacing.xs,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    color: draculaTheme.comment,
    fontWeight: typography.weights.semibold,
  },
  targetText: {
    fontSize: typography.sizes.md,
    color: draculaTheme.foreground,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    backgroundColor: draculaTheme.surface.card,
    color: draculaTheme.foreground,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    minWidth: 60,
    textAlign: 'center',
  },
  inputDisabled: {
    opacity: 0.5,
  },
  inputUnit: {
    fontSize: typography.sizes.sm,
    color: draculaTheme.comment,
  },
  inputSeparator: {
    fontSize: typography.sizes.md,
    color: draculaTheme.comment,
    marginHorizontal: spacing.xs,
  },
  completeButton: {
    backgroundColor: draculaTheme.green,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  completeButtonText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
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
  exerciseSelectionContainer: {
    backgroundColor: draculaTheme.surface.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  exerciseSelectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: draculaTheme.comment,
    marginBottom: spacing.sm,
  },
  exerciseChips: {
    flexDirection: 'row',
  },
  exerciseChip: {
    backgroundColor: draculaTheme.surface.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  exerciseChipActive: {
    backgroundColor: draculaTheme.cyan,
    borderColor: draculaTheme.cyan,
  },
  exerciseChipComplete: {
    opacity: 0.6,
  },
  exerciseChipText: {
    fontSize: typography.sizes.md,
    color: draculaTheme.foreground,
    fontWeight: typography.weights.semibold,
  },
  exerciseChipTextActive: {
    color: draculaTheme.text.inverse,
  },
  exerciseChipCount: {
    fontSize: typography.sizes.sm,
    color: draculaTheme.comment,
    marginLeft: spacing.xs,
  },
  exerciseChipCountActive: {
    color: draculaTheme.text.inverse,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: draculaTheme.surface.card,
    borderRadius: 10,
    padding: 2,
  },
  completeIcon: {
    marginRight: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: typography.sizes.md,
    color: draculaTheme.comment,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.lg,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: draculaTheme.surface.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: draculaTheme.cyan,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
