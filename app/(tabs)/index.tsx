
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import CalorieOverview from '../components/calorieOverview';
import MakroOverview from '../components/makroOverview';
import RecentActivities from '../components/recentActivities';
import { 
  getUserProfile, 
  getNutritionSummary, 
  getFoodEntriesForDate, 
  getWorkoutEntriesForDate, 
  FoodEntry, 
  WorkoutEntry 
} from '../../services/database';
import { draculaTheme, spacing, typography } from '../../styles/theme';

export default function DashboardScreen() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [calorieData, setCalorieData] = useState({ eaten: 0, burned: 0, remaining: 2000 });
  const [makroData, setMakroData] = useState({ 
    current: { protein: 0, carbs: 0, fat: 0 },
    target: { protein: 100, carbs: 200, fat: 50 } 
  });
  const [recentActivities, setRecentActivities] = useState<(FoodEntry | WorkoutEntry)[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [date])
  );

  const loadDashboardData = () => {
    const userProfile = getUserProfile();
    const nutritionSummary = getNutritionSummary(date);
    const foodEntries = getFoodEntriesForDate(date);
    const workoutEntries = getWorkoutEntriesForDate(date);

    const targetCalories = userProfile?.targetCalories || 2000;
    const eaten = nutritionSummary.totalCalories;
    const burned = nutritionSummary.caloriesBurned;

    setCalorieData({
      eaten,
      burned,
      remaining: targetCalories - eaten + burned,
    });

    setMakroData({
      current: {
        protein: nutritionSummary.totalProtein,
        carbs: nutritionSummary.totalCarbs,
        fat: nutritionSummary.totalFat,
      },
      target: {
        protein: userProfile?.targetProtein || 100,
        carbs: userProfile?.targetCarbs || 200,
        fat: userProfile?.targetFat || 50,
      },
    });

    // Combine and sort recent activities
    const activities = [...foodEntries, ...workoutEntries].sort((a, b) => b.createdAt - a.createdAt);
    setRecentActivities(activities);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>
      <CalorieOverview {...calorieData} />
      <MakroOverview currentMakro={makroData.current} targetMakro={makroData.target} />
      <RecentActivities recentActivities={recentActivities} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: draculaTheme.background,
    padding: spacing.md,
  },
  header: {
    ...typography.sizes,
    color: draculaTheme.foreground,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
});
