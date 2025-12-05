
import { useTheme } from '@/app/contexts/ThemeContext';
import { getFoodItem, getWorkoutTemplate } from '@/services/database';
import { FoodEntry } from '@/services/db/schema';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import { WorkoutEntry } from '@/types/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';


// Helper to check if an item is a FoodEntry
function isFoodEntry(item: any): item is FoodEntry {
  return 'foodId' in item;
}

export default function RecentActivities({ recentActivities }: { recentActivities: (FoodEntry | WorkoutEntry)[] }) {
  const { theme } = useTheme();
  
  const renderItem = ({ item }: { item: FoodEntry | WorkoutEntry }) => {
    if (isFoodEntry(item)) {
      const foodItem = getFoodItem(item.foodId);
      return (
        <View style={[styles.activityItem, { backgroundColor: theme.surface.elevated }, shadows.sm]}>
          <View style={styles.activityLeft}>
            <View style={[styles.iconContainer, { backgroundColor: theme.orange + '20' }]}>
              <Ionicons name="fast-food" size={18} color={theme.orange} />
            </View>
            <Text style={[styles.activityText, { color: theme.foreground }]}>{foodItem?.name || 'Food Entry'}</Text>
          </View>
          <Text style={[styles.activityValue, { color: theme.orange }]}>{Math.round(item.totalCalories)} kcal</Text>
        </View>
      );
    } else {
      const workoutTemplate = getWorkoutTemplate(item.workoutTemplateId);
      return (
        <View style={[styles.activityItem, { backgroundColor: theme.surface.elevated }, shadows.sm]}>
          <View style={styles.activityLeft}>
            <View style={[styles.iconContainer, { backgroundColor: theme.red + '20' }]}>
              <Ionicons name="barbell" size={18} color={theme.red} />
            </View>
            <Text style={[styles.activityText, { color: theme.foreground }]}>{workoutTemplate?.name || 'Workout'}</Text>
          </View>
          <Text style={[styles.activityValue, { color: theme.red }]}>{item.duration} min</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.activitiesSection}>
      <Text style={[styles.activitiesTitle, { color: theme.foreground }]}>Recent Activity</Text>
      {recentActivities.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.surface.card }, shadows.sm]}>
          <Ionicons name="time-outline" size={48} color={theme.comment} style={styles.emptyIcon} />
          <Text style={[styles.noActivitiesText, { color: theme.foreground }]}>No recent activities</Text>
          <Text style={[styles.noActivitiesSubtext, { color: theme.comment }]}>Your food and workout logs will appear here</Text>
        </View>
      ) : (
        <View style={styles.activitiesListContainer}>
          {recentActivities.slice(0, 8).map((item) => <View key={item.id}>{renderItem({ item })}</View>)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  activitiesSection: {
    flex: 1,
  },
  activitiesTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  emptyIcon: {
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  noActivitiesText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  noActivitiesSubtext: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  activitiesListContainer: {
    gap: spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  activityValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
