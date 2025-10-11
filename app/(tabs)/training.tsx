import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { getWorkoutTemplates, getActiveWorkoutSession, startWorkoutSession } from '@/services/database';
import { WorkoutTemplate, ActiveWorkoutSession } from '@/types/types'
import { draculaTheme, spacing, borderRadius, typography } from '@/styles/theme';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

interface TrainingState {
  templates: WorkoutTemplate[];
  activeSession: ActiveWorkoutSession | null;
}

export default function WorkoutScreen() {
  const router = useRouter();
  const [state, setState] = useState<TrainingState>({
    templates: [],
    activeSession: null,
  });

  const { templates, activeSession } = state;

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = () => {
    const templatesData = getWorkoutTemplates();
    const activeSessionData = getActiveWorkoutSession();
    setState({ templates: templatesData, activeSession: activeSessionData });
  };

  const handleTemplatePress = (templateId: string) => {
    if (activeSession && activeSession.workout_template_id !== templateId) {
      // Ask user to discard active session
    } else if (activeSession && activeSession.workout_template_id === templateId) {
      router.push('/workoutSession');
    } else {
      startWorkoutSession(templateId);
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
