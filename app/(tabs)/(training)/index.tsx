import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { getWorkoutTemplates, getActiveWorkoutSession, startWorkoutSession, getWorkoutEntries, getWorkoutTemplate } from '@/services/database';
import { WorkoutTemplate, ActiveWorkoutSession, WorkoutEntry } from '@/types/types'
import { draculaTheme, spacing, borderRadius, typography } from '@/styles/theme';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useDate } from '@/app/contexts/DateContext';

interface TrainingState {
  templates: WorkoutTemplate[];
  activeSession: ActiveWorkoutSession | null;
  workoutEntries: WorkoutEntry[];
}

export default function WorkoutScreen() {
  const router = useRouter();
  const { selectedDate } = useDate();
  const [state, setState] = useState<TrainingState>({
    templates: [],
    activeSession: null,
    workoutEntries: [],
  });

  const { templates, activeSession, workoutEntries } = state;

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedDate])
  );

  const loadData = () => {
    const templatesData = getWorkoutTemplates();
    const activeSessionData = getActiveWorkoutSession();
    const workoutEntriesData = getWorkoutEntries(selectedDate.toISOString().split('T')[0]);
    setState({ templates: templatesData, activeSession: activeSessionData, workoutEntries: workoutEntriesData });
  };

  const handleTemplatePress = (templateId: string) => {
    if (activeSession && activeSession.workout_template_id !== templateId) {
      // Ask user to discard active session
    router.push('/workoutSession')
    } else {
      startWorkoutSession(templateId, selectedDate.toISOString().split('T')[0]);
      router.push('/workoutSession');
    }
  };

  return (
    <View style={styles.container}>
      {activeSession && (
        <TouchableOpacity onPress={() => router.push('/workoutSession')}>
          <View style={styles.activeSessionCard}>
            <Text style={styles.activeSessionTitle}>Active Workout</Text>
          </View>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>Workout Templates</Text>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleTemplatePress(item.id)}>
            <View style={styles.templateCard}>
              <Text style={styles.templateTitle}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.sectionTitle}>Completed Workouts</Text>
      <FlatList
        data={workoutEntries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.completedWorkoutCard}>
            <Text style={styles.completedWorkoutTitle}>{getWorkoutTemplate(item.workout_template_id)?.name}</Text>
            <Text style={styles.completedWorkoutDetails}>Duration: {item.duration} mins</Text>
            <Text style={styles.completedWorkoutDetails}>Sets: {item.sets.length}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.createButton} onPress={() => router.push('/createWorkoutTemplate')}>
        <Text style={styles.createButtonText}>Create New Workout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.createButton} onPress={() => router.push('/manageExerciseTemplates')}>
        <Text style={styles.createButtonText}>Manage Exercise Templates</Text>
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
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
    marginBottom: spacing.md,
  },
  activeSessionCard: {
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: draculaTheme.cyan,
  },
  activeSessionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
  },
  templateCard: {
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  templateTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
  },
  completedWorkoutCard: {
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: draculaTheme.purple,
  },
  completedWorkoutTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
  },
  completedWorkoutDetails: {
    fontSize: typography.sizes.sm,
    color: draculaTheme.comment,
  },
  createButton: {
    backgroundColor: draculaTheme.cyan,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  createButtonText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
