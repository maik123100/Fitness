
import { useTheme } from '@/app/contexts/ThemeContext';
import { getFoodItem, getWorkoutTemplate } from '@/services/database';
import { FoodEntry } from '@/services/db/schema';
import { borderRadius, spacing, typography } from '@/styles/theme';
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
        <View style={[styles.activityItem, { backgroundColor: theme.surface.card }]}>
          <View style={styles.activityLeft}>
            <Ionicons name="fast-food" size={20} color={theme.nutrition.calories} />
            <Text style={[styles.activityText, { color: theme.foreground }]}>{foodItem?.name || 'Food Entry'}</Text>
          </View>
          <Text style={[styles.eatenCalories, { color: theme.nutrition.calories }]}>{Math.round(item.totalCalories)} kcal</Text>
        </View>
      );
    } else {
      const workoutTemplate = getWorkoutTemplate(item.workoutTemplateId);
      return (
        <View style={[styles.activityItem, { backgroundColor: theme.surface.card }]}>
          <View style={styles.activityLeft}>
            <Ionicons name="barbell" size={20} color={theme.activity.cardio} />
            <Text style={[styles.activityText, { color: theme.foreground }]}>{workoutTemplate?.name || 'Workout'}</Text>
          </View>
          <Text style={[styles.burnedCalories, { color: theme.activity.cardio }]}>{item.duration} min</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.activitiesSection}>
      <Text style={[styles.activitiesTitle, { color: theme.foreground }]}>Recent Activities</Text>
      {recentActivities.length === 0 ? (
        <Text style={[styles.noActivitiesText, { color: theme.comment }]}>No recent activities to display.</Text>
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
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  noActivitiesText: {
    fontSize: typography.sizes.md,
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
  },
  eatenCalories: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  burnedCalories: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
