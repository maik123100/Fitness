
import { getFoodItem, getWorkoutTemplate } from '@/services/database';
import { borderRadius, draculaTheme, spacing, typography } from '@/styles/theme';
import { FoodEntry } from '@/services/db/schema';
import { WorkoutEntry } from '@/types/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';


// Helper to check if an item is a FoodEntry
function isFoodEntry(item: any): item is FoodEntry {
  return 'foodId' in item;
}

export default function RecentActivities({ recentActivities }: { recentActivities: (FoodEntry | WorkoutEntry)[] }) {
  const renderItem = ({ item }: { item: FoodEntry | WorkoutEntry }) => {
    if (isFoodEntry(item)) {
      const foodItem = getFoodItem(item.foodId);
      return (
        <View style={styles.activityItem}>
          <View style={styles.activityLeft}>
            <Ionicons name="fast-food" size={20} color={draculaTheme.nutrition.calories} />
            <Text style={styles.activityText}>{foodItem?.name || 'Food Entry'}</Text>
          </View>
          <Text style={styles.eatenCalories}>{Math.round(item.totalCalories)} kcal</Text>
        </View>
      );
    } else {
      const workoutTemplate = getWorkoutTemplate(item.workoutTemplateId);
      return (
        <View style={styles.activityItem}>
          <View style={styles.activityLeft}>
            <Ionicons name="barbell" size={20} color={draculaTheme.activity.cardio} />
            <Text style={styles.activityText}>{workoutTemplate?.name || 'Workout'}</Text>
          </View>
          <Text style={styles.burnedCalories}>{item.duration} min</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.activitiesSection}>
      <Text style={styles.activitiesTitle}>Recent Activities</Text>
      {recentActivities.length === 0 ? (
        <Text style={styles.noActivitiesText}>No recent activities to display.</Text>
      ) : (
        <View style={styles.activitiesListContainer}>
          {recentActivities.map((item) => <View key={item.id}>{renderItem({ item })}</View>)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  activitiesSection: {
    flex: 1,
    marginTop: spacing.lg,
  },
  activitiesTitle: {
    fontSize: typography.sizes.lg,
    color: draculaTheme.foreground,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  noActivitiesText: {
    fontSize: typography.sizes.md,
    color: draculaTheme.comment,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  activitiesList: {
    paddingBottom: spacing.md,
  },
  activitiesListContainer: {
    maxHeight: 400,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: draculaTheme.surface.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  activityText: {
    fontSize: typography.sizes.md,
    color: draculaTheme.foreground,
  },
  eatenCalories: {
    fontSize: typography.sizes.md,
    color: draculaTheme.nutrition.calories,
    fontWeight: typography.weights.semibold,
  },
  burnedCalories: {
    fontSize: typography.sizes.md,
    color: draculaTheme.activity.cardio,
    fontWeight: typography.weights.semibold,
  },
});
