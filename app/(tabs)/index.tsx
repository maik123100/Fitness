import { View, StyleSheet } from 'react-native';
import { useCallback, useState } from 'react';

import CalorieOverview, { CalorieOverviewProps } from '../components/calorieOverview';
import RecentActivities, { RecentActivity } from '../components/recentActivities';
import MakroOverview, { Makro, MakroOverviewProps } from '../components/makroOverview';
import { getRecentActivities, Activity } from '@/services/database';
import { useFocusEffect } from 'expo-router';

/**
 * Index screen is the Dashboard of the Fitness App.
 * It should display the user's current status and progress. 
 * There should be a Calorie Counter (eaten,burned,remaining) and a list of the user's recent activities.
 */
export default function Index() {
  const [calorieData, setCalorieData] = useState<CalorieOverviewProps>({
    eaten: 0,
    burned: 0,
    remaining: 2000, // Default daily calorie goal
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  useFocusEffect(
    useCallback(() => {
      console.log('Loading data...');
      loadData();
    },[])
  );

  const loadData = () => {
    const activities = getRecentActivities(14); // Get last 14 activities
    setRecentActivities(activities);

    // Calculate calories
    const eaten = activities
      .filter(a => a.type === 'eaten')
      .reduce((sum, activity) => sum + activity.calories, 0);
    
    const burned = activities
      .filter(a => a.type === 'burned')
      .reduce((sum, activity) => sum + activity.calories, 0);

    setCalorieData({
      eaten,
      burned,
      remaining: 2000 - eaten + burned, // 2000 is default daily goal
    });
  };

  const makroTarget: Makro = {
    protein: 100,
    carbs: 200,
    fat: 50,
  };
  const makroCurrent: Makro = {
    protein: 80,
    carbs: 150,
    fat: 40,
  };

  return (
    <View style={styles.container}>
      <CalorieOverview {...calorieData} />
      <RecentActivities recentActivities={recentActivities} />
      <MakroOverview currentMakro={makroCurrent} targetMakro={makroTarget} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
});
