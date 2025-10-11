import { View, StyleSheet, Text } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import CalorieOverview from '../components/calorieOverview';
import MakroOverview from '../components/makroOverview';
import RecentActivities from '../components/recentActivities';
import { 
  getUserProfile, 
  getNutritionSummary, 
  getFoodEntriesForDate, 
  getWorkoutEntries
} from '@/services/database';
import {
  FoodEntry,
  WorkoutEntry
} from '@/types/types'
import { draculaTheme, spacing, typography } from '../../styles/theme';

interface DashboardState {
  date: string;
  calorieData: {
    eaten: number;
    burned: number;
    remaining: number;
  };
  makroData: {
    current: { protein: number; carbs: number; fat: number };
    target: { protein: number; carbs: number; fat: number };
  };
  recentActivities: (FoodEntry | WorkoutEntry)[];
}

export default function DashboardScreen() {
  const [state, setState] = useState<DashboardState>({
    date: new Date().toISOString().split('T')[0],
    calorieData: { eaten: 0, burned: 0, remaining: 2000 },
    makroData: {
      current: { protein: 0, carbs: 0, fat: 0 },
      target: { protein: 100, carbs: 200, fat: 50 },
    },
    recentActivities: [],
  });

  const { date, calorieData, makroData, recentActivities } = state;

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [date])
  );

  const loadDashboardData = () => {
    const userProfile = getUserProfile();
    const nutritionSummary = getNutritionSummary(date);
    const foodEntries = getFoodEntriesForDate(date);
    const workoutEntries = getWorkoutEntries();

    const targetCalories = userProfile?.targetCalories || 2000;
    const eaten = nutritionSummary.totalCalories;
    const burned = nutritionSummary.caloriesBurned;

    const newCalorieData = {
      eaten: Math.round(eaten),
      burned: Math.round(burned),
      remaining: Math.round(targetCalories - eaten + burned),
    };

    const newMakroData = {
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
    };

    const activities = [...foodEntries, ...workoutEntries].sort((a, b) => b.createdAt - a.createdAt);

    setState(prev => ({
      ...prev,
      calorieData: newCalorieData,
      makroData: newMakroData,
      recentActivities: activities,
    }));
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
    fontSize: typography.sizes.heading,
    color: draculaTheme.foreground,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
});