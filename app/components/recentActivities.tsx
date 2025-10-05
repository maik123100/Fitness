
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { FoodEntry, WorkoutEntry, getFoodItem, getWorkoutTemplate } from '../../services/database';
import { draculaTheme, spacing, typography, borderRadius } from '../../styles/theme';


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
          <Text style={styles.activityText}>{foodItem?.name || 'Food Entry'}</Text>
          <Text style={styles.eatenCalories}>{item.totalCalories} kcal</Text>
        </View>
      );
    } else {
      const workoutTemplate = getWorkoutTemplate(item.workout_template_id);
      return (
        <View style={styles.activityItem}>
          <Text style={styles.activityText}>{workoutTemplate?.name || 'Workout'}</Text>
          <Text style={styles.burnedCalories}>Workout</Text>
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
    maxHeight: 400, // Increased height
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: draculaTheme.surface.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
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
    color: draculaTheme.activity.cardio, // Or a general 'burned' color
    fontWeight: typography.weights.semibold,
  },
});
