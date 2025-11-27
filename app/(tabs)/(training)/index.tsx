import { useTheme } from '@/app/contexts/ThemeContext';
import { useDate } from '@/app/contexts/DateContext';
import { formatDateToYYYYMMDD } from '@/app/utils/dateHelpers';
import { deleteWorkoutEntry, getActiveWorkoutSession, getWorkoutEntries, getWorkoutTemplate, getWorkoutTemplates, startWorkoutSession } from '@/services/database';
import { borderRadius, spacing, typography } from '@/styles/theme';
import { ActiveWorkoutSession, WorkoutEntry } from '@/types/types';
import { WorkoutTemplate } from '@/services/db/schema';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

interface TrainingState {
  templates: WorkoutTemplate[];
  activeSession: ActiveWorkoutSession | null;
  workoutEntries: WorkoutEntry[];
}

export default function WorkoutScreen() {
  const router = useRouter();
  const { theme } = useTheme();
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
    if (activeSession && activeSession.workoutTemplateId !== templateId) {
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
        <TouchableOpacity onPress={() => router.navigate({ pathname: '/(tabs)/(training)/workoutSession', params: { workoutEntryId: item.id } })} style={[styles.actionButton, styles.editButton, { backgroundColor: theme.green }]}>
          <Animated.View style={{ transform: [{ translateX: trans }] }}>
            <MaterialCommunityIcons name="pencil" size={24} color={theme.text.inverse} />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          console.log('Attempting to delete workout entry:', item.id);
          deleteWorkoutEntry(item.id);
          console.log('Workout entry deleted from DB. Reloading data...');
          loadData();
          console.log('Data reloaded.');
          swipeableRef.current?.close(); // Close the swipeable after deletion
        }} style={[styles.actionButton, { backgroundColor: theme.red }]}>
          <Animated.View style={{ transform: [{ translateX: trans }] }}>
            <MaterialCommunityIcons name="delete" size={24} color={theme.text.inverse} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {activeSession && (
        <TouchableOpacity onPress={() => router.navigate('/(tabs)/(training)/workoutSession')}>
          <View style={[styles.activeSessionCard, { backgroundColor: theme.surface.card, borderLeftColor: theme.cyan }]}>
            <Text style={[styles.activeSessionTitle, { color: theme.foreground }]}>Active Workout</Text>
          </View>
        </TouchableOpacity>
      )}

      <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Workout Templates</Text>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleTemplatePress(item.id)}>
            <View style={[styles.templateCard, { backgroundColor: theme.surface.card }]}>
              <Text style={[styles.templateTitle, { color: theme.foreground }]}>{ item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Completed Workouts</Text>
      <FlatList
        data={workoutEntries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable ref={swipeableRef} renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}>
            <View style={[styles.completedWorkoutCard, { backgroundColor: theme.surface.card, borderLeftColor: theme.purple }]}>
              <Text style={[styles.completedWorkoutTitle, { color: theme.foreground }]}>{ getWorkoutTemplate(item.workoutTemplateId)?.name}</Text>
              <Text style={[styles.completedWorkoutDetails, { color: theme.comment }]}>Duration: {item.duration} mins</Text>
              <Text style={[styles.completedWorkoutDetails, { color: theme.comment }]}>Sets: {item.sets.length}</Text>
            </View>
          </Swipeable>
        )}
      />

      <TouchableOpacity style={[styles.createButton, { backgroundColor: theme.cyan }]} onPress={() => router.navigate('/(tabs)/(training)/createWorkoutTemplate')}>
        <Text style={[styles.createButtonText, { color: theme.text.inverse }]}>Create New Workout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.createButton, { backgroundColor: theme.green }]} onPress={() => router.navigate('/(tabs)/(training)/manageExerciseTemplates')}>
        <Text style={[styles.createButtonText, { color: theme.text.inverse }]}>Manage Exercise Templates</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  activeSessionCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
  },
  activeSessionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  templateCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  templateTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  completedWorkoutCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
  },
  completedWorkoutTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  completedWorkoutDetails: {
    fontSize: typography.sizes.sm,
  },
  createButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  createButtonText: {
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
    marginRight: spacing.sm
  },
});
