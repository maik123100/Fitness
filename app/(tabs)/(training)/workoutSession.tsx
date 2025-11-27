import { useTheme } from '@/app/contexts/ThemeContext';
import { finishWorkoutSession, getActiveWorkoutSession, getExerciseTemplate, getWorkoutEntry, getWorkoutTemplateExercises, updateActiveWorkoutSession, updateWorkoutEntry } from '@/services/database';
import { borderRadius, spacing, typography } from '@/styles/theme';
import { ActiveWorkoutSession, WorkoutEntry, WorkoutTemplateExercise, WorkoutSet } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WorkoutSessionScreen() {
  // Separate state for clarity
  const { theme } = useTheme();
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
    if (!activeSession.startTime) {
      return;
    }

    // Update elapsed time every second
    const updateTimer = () => {
      const secondsElapsed = Math.floor((Date.now() - activeSession.startTime) / 1000);
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
      const exerciseTemplate = getExerciseTemplate(te.exerciseTemplateId);
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
      const exercisesWithDetails = loadExercisesForWorkout(activeSession.workoutTemplateId);
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
          ex => activeSession.sets.some((s: WorkoutSet) => s.id === firstUncompletedSet.id && s.workoutTemplateExerciseId === ex.id)
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
      const exercisesWithDetails = loadExercisesForWorkout(workoutEntry.workoutTemplateId);
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
        (set: WorkoutSet) => set.workoutTemplateExerciseId === exercise.id
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
        (set: WorkoutSet) => set.workoutTemplateExerciseId === exerciseId && !set.completed
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Workout Progress Overview */}
      {!isEditing && (
        <View style={[styles.progressContainer, { backgroundColor: theme.surface.card, marginTop: insets.top }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: theme.foreground }]}>Workout Session</Text>
            <View style={[styles.timerBadge, { backgroundColor: theme.purple }]}>
              <Ionicons name="timer-outline" size={16} color={theme.text.inverse} />
              <Text style={[styles.timerText, { color: theme.text.inverse }]}>{ formatTime(elapsedTime)}</Text>
            </View>
          </View>
          <View style={[styles.progressBarContainer, { backgroundColor: theme.surface.secondary }]}>
            <View style={[styles.progressBar, { backgroundColor: theme.green, width: `${progress.percentage}%` }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.comment }]}>
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
          <View style={[styles.modalContent, { backgroundColor: theme.surface.card }]}>
            <Text style={[styles.modalTitle, { color: theme.foreground }]}>Finish Workout</Text>
            <Text style={[styles.modalDescription, { color: theme.comment }]}>
              Enter calories burned (optional)
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Calories burned"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={caloriesBurned}
              onChangeText={setCaloriesBurned}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { backgroundColor: theme.surface.secondary }]}
                onPress={() => setShowFinishModal(false)}
              >
                <Text style={[styles.modalCancelButtonText, { color: theme.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmButton, { backgroundColor: theme.cyan }]}
                onPress={confirmFinishWorkout}
              >
                <Text style={[styles.modalConfirmButtonText, { color: theme.text.inverse }]}>Finish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rest Timer Modal */}
      {isResting && (
        <View style={styles.restTimerOverlay}>
          <View style={[styles.restTimerCard, { backgroundColor: theme.surface.card }]}>
            <Text style={[styles.restTimerTitle, { color: theme.foreground }]}>Rest Timer</Text>
            <Text style={[styles.restTimerValue, { color: theme.green }]}>{ formatTime(restTimer)}</Text>
            <View style={styles.restTimerDots}>
              {[...Array(6)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.restDot,
                    { backgroundColor: i < Math.ceil((restTimer / 90) * 6) ? theme.green : theme.surface.secondary }
                  ]}
                />
              ))}
            </View>
            <View style={styles.restTimerButtons}>
              <TouchableOpacity style={[styles.restButton, { backgroundColor: theme.cyan }]} onPress={skipRest}>
                <Text style={[styles.restButtonText, { color: theme.text.inverse }]}>Skip Rest</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.restButton, { backgroundColor: theme.cyan }]} onPress={() => addRestTime(30)}>
                <Text style={[styles.restButtonText, { color: theme.text.inverse }]}>Add 30s</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Exercise Selection - Only for active workouts */}
      {!isEditing && exercises.length > 0 && (
        <View style={[styles.exerciseSelectionContainer, { backgroundColor: theme.surface.card }]}>
          <Text style={[styles.exerciseSelectionTitle, { color: theme.comment }]}>Select Exercise</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exerciseChips}>
            {exercises.map((exercise) => {
              const exerciseSets = session?.sets.filter(
                (set: WorkoutSet) => set.workoutTemplateExerciseId === exercise.id
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
                    { backgroundColor: theme.surface.card },
                    isCurrent && { backgroundColor: theme.cyan, borderColor: theme.cyan },
                    isComplete && { backgroundColor: theme.green },
                  ]}
                  onPress={() => switchToExercise(exercise.id)}
                >
                  {isRecommended && !isCurrent && (
                    <View style={[styles.recommendedBadge, { backgroundColor: theme.surface.card }]}>
                      <Ionicons name="star" size={12} color={theme.yellow} />
                    </View>
                  )}
                  {isComplete && (
                    <Ionicons name="checkmark-circle" size={16} color={theme.green} style={styles.completeIcon} />
                  )}
                  <Text style={[styles.exerciseChipText, { color: theme.foreground }, isCurrent && { color: theme.text.inverse }]}>
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
          <View style={[styles.durationContainer, { backgroundColor: theme.surface.card }]}>
            <Text style={[styles.durationLabel, { color: theme.comment }]}>Duration (mins)</Text>
            <TextInput
              style={[styles.durationInput, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Duration"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={workoutEntry.duration.toString()}
              onChangeText={(value) => {
                const updatedEntry = { ...workoutEntry, duration: parseInt(value) || 0 };
                setSession(updatedEntry);
              }}
            />

            <Text style={[styles.durationLabel, { color: theme.foreground, marginTop: spacing.md }]}>Calories Burned</Text>
            <TextInput
              style={[styles.durationInput, { backgroundColor: theme.surface.input, color: theme.foreground }]}
              placeholder="Calories"
              placeholderTextColor={theme.comment}
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
              (set: WorkoutSet) => set.workoutTemplateExerciseId === exercise.id
            );

            const completedSets = exerciseSets.filter((s: WorkoutSet) => s.completed).length;
            const totalSets = exerciseSets.length;

            return (
              <View key={exercise.id} style={[styles.exerciseCard, { backgroundColor: theme.surface.card }]}>
                <View style={styles.exerciseHeader}>
                  <Text style={[styles.exerciseTitle, { color: theme.foreground }]}>{exercise.exercise_name}</Text>
                  <Text style={[styles.exerciseProgress, { color: theme.cyan }]}>{completedSets}/{totalSets}</Text>
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
                        { backgroundColor: theme.surface.secondary },
                        set.completed && { ...styles.setCardCompleted, backgroundColor: theme.surface.input },
                        isCurrentSet && { borderColor: theme.cyan, backgroundColor: theme.surface.input },
                      ]}
                    >
                      <View style={styles.setHeader}>
                        <View style={styles.setNumberContainer}>
                          {set.completed ? (
                            <Ionicons name="checkmark-circle" size={24} color={theme.green} />
                          ) : isCurrentSet ? (
                            <Ionicons name="play-circle" size={24} color={theme.cyan} />
                          ) : (
                            <Ionicons name="ellipse-outline" size={24} color={theme.comment} />
                          )}
                          <Text style={[styles.setNumber, { color: theme.foreground }, isCurrentSet && { color: theme.cyan }]}>
                            Set {index + 1}
                          </Text>
                        </View>
                        {isCurrentSet && <Text style={[styles.currentLabel, { color: theme.cyan }]}>CURRENT</Text>}
                      </View>

                      <View style={styles.setContent}>
                        {/* Target */}
                        <View style={styles.targetSection}>
                          <Text style={[styles.sectionLabel, { color: theme.comment }]}>Target</Text>
                          <Text style={[styles.targetText, { color: theme.foreground }]}>
                            {set.targetWeight} kg × {set.targetReps} reps
                          </Text>
                        </View>

                        {/* Actual Input */}
                        <View style={styles.actualSection}>
                          <Text style={[styles.sectionLabel, { color: theme.comment }]}>Actual</Text>
                          <View style={styles.inputRow}>
                            <TextInput
                              style={[styles.input, { backgroundColor: theme.surface.card, color: theme.foreground }, isPendingSet && styles.inputDisabled]}
                              placeholder={`${set.targetWeight}`}
                              placeholderTextColor={theme.comment}
                              keyboardType="numeric"
                              value={set.weight.toString()}
                              onChangeText={(value) => handleSetUpdate(set.id, 'weight', parseFloat(value) || 0)}
                              editable={!isPendingSet}
                            />
                            <Text style={[styles.inputUnit, { color: theme.comment }]}>kg</Text>
                            <Text style={[styles.inputSeparator, { color: theme.comment }]}>×</Text>
                            <TextInput
                              style={[styles.input, { backgroundColor: theme.surface.card, color: theme.foreground }, isPendingSet && styles.inputDisabled]}
                              placeholder={`${set.targetReps}`}
                              placeholderTextColor={theme.comment}
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
                          style={[styles.completeButton, { backgroundColor: theme.green }]}
                          onPress={() => handleCompleteSet(set.id)}
                        >
                          <Text style={[styles.completeButtonText, { color: theme.text.inverse }]}>Complete Set</Text>
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
      <TouchableOpacity style={[styles.finishButton, { backgroundColor: theme.cyan }]} onPress={handleFinishWorkout}>
        <Text style={[styles.finishButtonText, { color: theme.text.inverse }]}>
          {isEditing ? 'Update Workout' : 'Finish Workout'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  progressContainer: {
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
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  timerText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginLeft: spacing.xs,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  progressText: {
    fontSize: typography.sizes.sm,
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
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 280,
  },
  restTimerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  restTimerValue: {
    fontSize: 48,
    fontWeight: typography.weights.bold,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  restButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  durationContainer: {
    flexDirection: 'column',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  durationLabel: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    alignSelf: 'flex-end',
  },
  durationInput: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    alignSelf: 'center',
    width: '80%',
  },
  errorText: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  exerciseCard: {
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
  },
  exerciseProgress: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  setCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  setCardCompleted: {
    opacity: 0.7,
  },
  setCardCurrent: {
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
  },
  setNumberCurrent: {
    fontWeight: typography.weights.bold,
  },
  currentLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
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
    fontWeight: typography.weights.semibold,
  },
  targetText: {
    fontSize: typography.sizes.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    minWidth: 60,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  inputUnit: {
    fontSize: typography.sizes.sm,
  },
  inputSeparator: {
    fontSize: typography.sizes.md,
    marginHorizontal: spacing.xs,
  },
  completeButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  completeButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  finishButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },
  finishButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  exerciseSelectionContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  exerciseSelectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  exerciseChips: {
    flexDirection: 'row',
  },
  exerciseChip: {
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
  },
  exerciseChipComplete: {
    opacity: 0.6,
  },
  exerciseChipText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  exerciseChipTextActive: {
  },
  exerciseChipCount: {
    fontSize: typography.sizes.sm,
    marginLeft: spacing.xs,
  },
  exerciseChipCountActive: {
  },
  recommendedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
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
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalInput: {
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
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  modalConfirmButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
