import { useState, useRef , useCallback } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList , Animated } from 'react-native';
import { getWorkoutTemplates, getActiveWorkoutSession, startWorkoutSession, getWorkoutEntries, getWorkoutTemplate, deleteWorkoutEntry } from '@/services/database';
import { WorkoutTemplate, ActiveWorkoutSession, WorkoutEntry } from '@/types/types'
import { draculaTheme, spacing, borderRadius, typography } from '@/styles/theme';
import { useRouter, useFocusEffect } from 'expo-router';
import { useDate } from '@/app/contexts/DateContext';
import { formatDateToYYYYMMDD } from '@/app/utils/dateHelpers';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  const swipeableRef = useRef<Swipeable>(null);

  const { templates, activeSession, workoutEntries } = state;

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedDate])
  );

  const loadData = () => {
    const templatesData = getWorkoutTemplates();
    const activeSessionData = getActiveWorkoutSession();
    const workoutEntriesData = getWorkoutEntries(formatDateToYYYYMMDD(selectedDate));
    setState({ templates: templatesData, activeSession: activeSessionData, workoutEntries: workoutEntriesData });
  };

  const handleTemplatePress = (templateId: string) => {
    if (activeSession && activeSession.workout_template_id !== templateId) {
      // Ask user to discard active session
    router.navigate('/(tabs)/(training)/workoutSession')
    } else {
      startWorkoutSession(templateId, formatDateToYYYYMMDD(selectedDate));
      router.navigate('/(tabs)/(training)/workoutSession');
    }
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, item: WorkoutEntry) => {
    const trans = dragX.interpolate({
      inputRange: [-160, 0],
      outputRange: [0, 160],
      extrapolate: 'clamp',
    });
    return (
      <View style={styles.rightActionContainer}>
        <TouchableOpacity onPress={() => router.navigate({ pathname: '/(tabs)/(training)/workoutSession', params: { workoutEntryId: item.id }})} style={[styles.actionButton, styles.editButton]}>
          <Animated.View style={{ transform: [{ translateX: trans }] }}>
            <MaterialCommunityIcons name="pencil" size={24} color={draculaTheme.text.inverse} />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          console.log('Attempting to delete workout entry:', item.id);
          deleteWorkoutEntry(item.id);
          console.log('Workout entry deleted from DB. Reloading data...');
          loadData();
          console.log('Data reloaded.');
          swipeableRef.current?.close(); // Close the swipeable after deletion
        }} style={[styles.actionButton, styles.deleteButton]}>
          <Animated.View style={{ transform: [{ translateX: trans }] }}>
            <MaterialCommunityIcons name="delete" size={24} color={draculaTheme.text.inverse} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
      <View style={styles.container}>
        {activeSession && (
          <TouchableOpacity onPress={() => router.navigate('/(tabs)/(training)/workoutSession')}>
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
            <Swipeable ref={swipeableRef} renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}>
              <View style={styles.completedWorkoutCard}>
                <Text style={styles.completedWorkoutTitle}>{getWorkoutTemplate(item.workout_template_id)?.name}</Text>
                <Text style={styles.completedWorkoutDetails}>Duration: {item.duration} mins</Text>
                <Text style={styles.completedWorkoutDetails}>Sets: {item.sets.length}</Text>
              </View>
            </Swipeable>
          )}
        />

        <TouchableOpacity style={styles.createButton} onPress={() => router.navigate('/(tabs)/(training)/createWorkoutTemplate')}>
          <Text style={styles.createButtonText}>Create New Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.createButton} onPress={() => router.navigate('/(tabs)/(training)/manageExerciseTemplates')}>
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
  rightActionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: spacing.sm,

  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    paddingVertical: 20,
    borderRadius: borderRadius.md,
  },
  editButton: {
    backgroundColor: draculaTheme.green,
    marginRight: spacing.sm
  },
  deleteButton: {
    backgroundColor: draculaTheme.red,
  },
});
