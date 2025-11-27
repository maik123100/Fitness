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
import { Animated, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
        <TouchableOpacity 
          onPress={() => router.navigate({ pathname: '/(tabs)/(training)/workoutSession', params: { workoutEntryId: item.id } })} 
          style={[styles.actionButton, styles.editButton, { backgroundColor: theme.green }]}
        >
          <Animated.View style={{ transform: [{ translateX: trans }] }}>
            <MaterialCommunityIcons name="pencil" size={24} color={theme.text.inverse} />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => {
            deleteWorkoutEntry(item.id);
            loadData();
            swipeableRef.current?.close();
          }} 
          style={[styles.actionButton, { backgroundColor: theme.red }]}
        >
          <Animated.View style={{ transform: [{ translateX: trans }] }}>
            <MaterialCommunityIcons name="delete" size={24} color={theme.text.inverse} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollContent}>
      {/* Active Session Banner */}
      {activeSession && (
        <TouchableOpacity onPress={() => router.navigate('/(tabs)/(training)/workoutSession')} activeOpacity={0.7}>
          <View style={[styles.activeSessionCard, { backgroundColor: theme.cyan }]}>
            <View style={styles.activeSessionContent}>
              <View style={styles.activeSessionIconContainer}>
                <MaterialCommunityIcons name="dumbbell" size={28} color={theme.text.inverse} />
              </View>
              <View style={styles.activeSessionTextContainer}>
                <Text style={[styles.activeSessionTitle, { color: theme.text.inverse }]}>Active Workout</Text>
                <Text style={[styles.activeSessionSubtitle, { color: theme.text.inverse, opacity: 0.9 }]}>Tap to continue</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={theme.text.inverse} />
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity 
          style={[styles.quickActionButton, { backgroundColor: theme.surface.card, borderColor: theme.cyan }]} 
          onPress={() => router.navigate('/(tabs)/(training)/createWorkoutTemplate')}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIconCircle, { backgroundColor: theme.cyan + '20' }]}>
            <MaterialCommunityIcons name="plus" size={24} color={theme.cyan} />
          </View>
          <Text style={[styles.quickActionText, { color: theme.foreground }]}>Create Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.quickActionButton, { backgroundColor: theme.surface.card, borderColor: theme.green }]} 
          onPress={() => router.navigate('/(tabs)/(training)/manageExerciseTemplates')}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIconCircle, { backgroundColor: theme.green + '20' }]}>
            <MaterialCommunityIcons name="cog" size={24} color={theme.green} />
          </View>
          <Text style={[styles.quickActionText, { color: theme.foreground }]}>Manage Exercises</Text>
        </TouchableOpacity>
      </View>

      {/* Workout Templates Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={24} color={theme.cyan} />
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Workout Templates</Text>
        </View>
        
        {templates.length === 0 ? (
          <View style={[styles.emptyStateContainer, { backgroundColor: theme.surface.card }]}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={theme.comment} />
            <Text style={[styles.emptyStateText, { color: theme.comment }]}>No templates yet</Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.comment }]}>Create your first workout template</Text>
          </View>
        ) : (
          <View>
            {templates.map((item) => (
              <TouchableOpacity key={item.id} onPress={() => handleTemplatePress(item.id)} activeOpacity={0.7}>
                <View style={[styles.templateCard, { backgroundColor: theme.surface.card }]}>
                  <View style={styles.templateCardContent}>
                    <View style={[styles.templateIconCircle, { backgroundColor: theme.cyan + '20' }]}>
                      <MaterialCommunityIcons name="weight-lifter" size={24} color={theme.cyan} />
                    </View>
                    <View style={styles.templateTextContainer}>
                      <Text style={[styles.templateTitle, { color: theme.foreground }]}>{item.name}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.comment} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Completed Workouts Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="check-circle-outline" size={24} color={theme.green} />
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Today's Workouts</Text>
        </View>
        
        {workoutEntries.length === 0 ? (
          <View style={[styles.emptyStateContainer, { backgroundColor: theme.surface.card }]}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={48} color={theme.comment} />
            <Text style={[styles.emptyStateText, { color: theme.comment }]}>No workouts today</Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.comment }]}>Start a workout from templates</Text>
          </View>
        ) : (
          <View>
            {workoutEntries.map((item) => (
              <Swipeable key={item.id} ref={swipeableRef} renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}>
                <View style={[styles.completedWorkoutCard, { backgroundColor: theme.surface.card }]}>
                  <View style={styles.completedWorkoutContent}>
                    <View style={[styles.completedIconCircle, { backgroundColor: theme.green + '20' }]}>
                      <MaterialCommunityIcons name="check" size={20} color={theme.green} />
                    </View>
                    <View style={styles.completedTextContainer}>
                      <Text style={[styles.completedWorkoutTitle, { color: theme.foreground }]}>
                        {getWorkoutTemplate(item.workoutTemplateId)?.name}
                      </Text>
                      <View style={styles.completedWorkoutDetailsRow}>
                        <View style={styles.completedWorkoutDetailItem}>
                          <MaterialCommunityIcons name="clock-outline" size={14} color={theme.comment} />
                          <Text style={[styles.completedWorkoutDetails, { color: theme.comment }]}>{item.duration} min</Text>
                        </View>
                        <View style={styles.completedWorkoutDetailItem}>
                          <MaterialCommunityIcons name="weight" size={14} color={theme.comment} />
                          <Text style={[styles.completedWorkoutDetails, { color: theme.comment }]}>{item.sets.length} sets</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </Swipeable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  
  // Active Session Banner
  activeSessionCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  activeSessionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeSessionIconContainer: {
    marginRight: spacing.md,
  },
  activeSessionTextContainer: {
    flex: 1,
  },
  activeSessionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  activeSessionSubtitle: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  quickActionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },

  // Empty State
  emptyStateContainer: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },

  // Template Cards
  templateCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  templateCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  templateTextContainer: {
    flex: 1,
  },
  templateTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },

  // Completed Workout Cards
  completedWorkoutCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  completedWorkoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  completedTextContainer: {
    flex: 1,
  },
  completedWorkoutTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  completedWorkoutDetailsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  completedWorkoutDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  completedWorkoutDetails: {
    fontSize: typography.sizes.sm,
  },

  // Swipe Actions
  rightActionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: borderRadius.lg,
  },
  editButton: {
    marginRight: spacing.sm,
  },
});
