import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { getActiveWorkoutSession, updateActiveWorkoutSession, finishWorkoutSession, getWorkoutTemplateExercises, getExerciseTemplate } from '../services/database';
import { draculaTheme, spacing, borderRadius, typography } from '../styles/theme';
import { useRouter } from 'expo-router';

export default function WorkoutSessionScreen() {
  const [session, setSession] = useState<any | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const router = useRouter();

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
      setSession(activeSession);
      setExercises(exercisesWithDetails);
    }
  };

  const handleSetUpdate = (setId: string, field: string, value: string) => {
    if (session) {
      const newSets = session.sets.map((set: any) => {
        if (set.id === setId) {
          return { ...set, [field]: value };
        }
        return set;
      });
      const newSession = { ...session, sets: newSets };
      setSession(newSession);
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
      <View style={styles.container}>
        <Text style={styles.errorText}>No active workout session found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseTitle}>{item.exercise_name} ({item.default_sets}x{item.default_reps})</Text>
            {session.sets.filter((set: any) => set.workout_template_exercise_id === item.id).map((set: any, index: number) => (
              <View key={set.id} style={styles.setContainer}>
                <Text style={styles.setText}>Set {index + 1}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Weight"
                  placeholderTextColor={draculaTheme.comment}
                  keyboardType="numeric"
                  value={set.weight.toString()}
                  onChangeText={(value) => handleSetUpdate(set.id, 'weight', value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Reps"
                  placeholderTextColor={draculaTheme.comment}
                  keyboardType="numeric"
                  value={set.reps.toString()}
                  onChangeText={(value) => handleSetUpdate(set.id, 'reps', value)}
                />
                <TouchableOpacity onPress={() => handleSetUpdate(set.id, 'completed', (!set.completed).toString())}>
                  <Text>{set.completed ? '✅' : '🔲'}</Text>
                </TouchableOpacity>
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
