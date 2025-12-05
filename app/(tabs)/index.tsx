import CalorieOverview from '@/components/calorieOverview';
import MakroOverview from '@/components/makroOverview';
import RecentActivities from '@/components/recentActivities';
import { useDate } from '@/app/contexts/DateContext';
import { useTheme } from '@/app/contexts/ThemeContext';
import { formatDateToYYYYMMDD } from '@/utils/dateHelpers';
import {
  getFoodEntriesForDate,
  getNutritionSummary,
  getUserProfile,
  getWorkoutEntries
} from '@/services/database';
import { FoodEntry } from '@/services/db/schema';
import { spacing, typography } from '@/styles/theme';
import { WorkoutEntry } from '@/types/types';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface DashboardState {
  calorieData: {
    eaten: number;
    burned: number;
    remaining: number;
    target: number;
  };
  makroData: {
    current: { protein: number; carbs: number; fat: number };
    target: { protein: number; carbs: number; fat: number };
  };
  recentActivities: (FoodEntry | WorkoutEntry)[];
}

export default function DashboardScreen() {
  const { selectedDate } = useDate();
  const { theme } = useTheme();
  const [state, setState] = useState<DashboardState>({
    calorieData: { eaten: 0, burned: 0, remaining: 2000, target: 2000 },
    makroData: {
      current: { protein: 0, carbs: 0, fat: 0 },
      target: { protein: 100, carbs: 200, fat: 50 },
    },
    recentActivities: [],
  });

  const { calorieData, makroData, recentActivities } = state;

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [selectedDate])
  );

  const loadDashboardData = () => {
    const userProfile = getUserProfile();
    const formattedDate = formatDateToYYYYMMDD(selectedDate);
    const nutritionSummary = getNutritionSummary(formattedDate);
    const foodEntries = getFoodEntriesForDate(formattedDate);
    const workoutEntries = getWorkoutEntries(formattedDate);

    const targetCalories = userProfile?.targetCalories || 2000;
    const eaten = nutritionSummary.totalCalories;
    const burned = nutritionSummary.caloriesBurned;

    const newCalorieData = {
      eaten: Math.round(eaten),
      burned: Math.round(burned),
      remaining: Math.round(targetCalories - eaten + burned),
      target: Math.round(targetCalories),
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: theme.foreground }]}>Dashboard</Text>
        <Text style={[styles.pageSubtitle, { color: theme.comment }]}>
          Your daily overview
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CalorieOverview {...calorieData} />
        <MakroOverview currentMakro={makroData.current} targetMakro={makroData.target} />
        <RecentActivities recentActivities={recentActivities} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.regular,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
