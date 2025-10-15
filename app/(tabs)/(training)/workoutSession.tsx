import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { getActiveWorkoutSession, updateActiveWorkoutSession, finishWorkoutSession, getWorkoutTemplateExercises, getExerciseTemplate } from '@/services/database';
import { ActiveWorkoutSession, WorkoutTemplateExercise, WorkoutSet } from '@/types/types'
import { draculaTheme, spacing, borderRadius, typography } from '@/styles/theme';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface WorkoutSessionState {
  session: ActiveWorkoutSession | null;
  exercises: (WorkoutTemplateExercise & { exercise_name: string; default_sets: number; default_reps: string })[];
}

export default function WorkoutSessionScreen() {
  const [state, setState] = useState<WorkoutSessionState>({ session: null, exercises: [] });
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { session, exercises } = state;

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = () => {
    const activeSession = getActiveWorkoutSession();
    if (activeSession) {
      const templateExercises = getWorkoutTemplateExercises(activeSession.workout_template_id);
      const exercisesWithDetails = templateExercises.map(te => {
        const exerciseTemplate = getExerciseTemplate(te.exercise_template_id);
        return {
          ...te,
          exercise_name: exerciseTemplate?.name || 'Unknown Exercise',
          default_sets: exerciseTemplate?.default_sets || 0,
          default_reps: exerciseTemplate?.default_reps || '0',
        };
      });
      setState({ session: activeSession, exercises: exercisesWithDetails });
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
      updateActiveWorkoutSession(newSession);
    }
  };

  const handleFinishWorkout = () => {
    if (session) {
      finishWorkoutSession(session);
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
    <View style={[styles.container, { paddingTop: insets.top * 2 }]}>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseTitle}>{item.exercise_name} ({item.default_sets}x{item.default_reps})</Text>
            {session.sets.filter((set: WorkoutSet) => set.workout_template_exercise_id === item.id).map((set: WorkoutSet, index: number) => (
              <View key={set.id}>
                {index === 0 && (
                  <View style={styles.setLabelsRow}>
                    <View style={styles.setNumberPlaceholder} />
                    <Text style={styles.inputLabel}>Weight</Text>
                    <Text style={styles.inputLabel}>Reps</Text>
                    <View style={styles.checkboxPlaceholder} />
                  </View>
                )}
                <View style={styles.setContainer}>
                  <Text style={styles.setText}>Set {index + 1}</Text>
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
                    <Text>{set.completed ? '✅' : '🔲'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      />
      <TouchableOpacity style={styles.finishButton} onPress={handleFinishWorkout}>
        <Text style={styles.finishButtonText}>Finish Workout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: draculaTheme.background,
    padding: spacing.md,
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
  exerciseTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
    marginBottom: spacing.md,
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
  finishButton: {
    backgroundColor: draculaTheme.cyan,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  finishButtonText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
