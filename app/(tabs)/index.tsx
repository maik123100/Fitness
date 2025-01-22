import {View, StyleSheet} from 'react-native';
import CalorieOverview, {CalorieOverviewProps} from '../components/calorieOverview';
import RecentActivities, {RecentActivity} from '../components/recentActivities';
import MakroOverview, {Makro,MakroOverviewProps} from '../components/makroOverview';

/**
 * Index screen is the Dashboard of the Fitness App.
 * It should display the user's current status and progress. 
 * There should be a Calorie Counter (eaten,burned,remaining) and a list of the user's recent activities.
 */
export default function Index() {
  // Sample data
  const calorieData: CalorieOverviewProps = {
    eaten: 1500,
    burned: 500,
    remaining: 1000,
  };

  const recentActivities:RecentActivity[] = [
    { id: '1', activity: 'Morning Run', calories: 300, type: 'burned' },
    { id: '2', activity: 'Lunch: Salad', calories: 400, type: 'eaten' },
    { id: '3', activity: 'Workout: HIIT', calories: 600, type: 'burned' },
    { id: '4', activity: 'Dinner: Chicken', calories: 400, type: 'eaten' },
    { id: '5', activity: 'Evening Walk', calories: 200, type: 'burned' },
    { id: '6', activity: 'Snack: Apple', calories: 100, type: 'eaten' },
    { id: '7', activity: 'Sleep', calories: 50, type: 'burned' },
    { id: '8', activity: 'Morning Run', calories: 300, type: 'burned' },
    { id: '9', activity: 'Lunch: Salad', calories: 400, type: 'eaten' },
    { id: '10', activity: 'Workout: HIIT', calories: 600, type: 'burned' },
    { id: '11', activity: 'Dinner: Chicken', calories: 400, type: 'eaten' },
    { id: '12', activity: 'Evening Walk', calories: 200, type: 'burned' },
    { id: '13', activity: 'Snack: Apple', calories: 100, type: 'eaten' },
    { id: '14', activity: 'Sleep', calories: 50, type: 'burned' },
  ];
  
  const emptyRecentActivities:RecentActivity[] = [];
  const makroTarget:Makro = {
    protein: 100,
    carbs: 200,
    fat: 50,
  };
  const makroCurrent:Makro = {
    protein: 80,
    carbs: 150,
    fat: 40,
  };



  return (
    <View style={styles.container}>
      <CalorieOverview
        eaten={calorieData.eaten}
        burned={calorieData.burned}
        remaining={calorieData.remaining}
      />
      <RecentActivities recentActivities={recentActivities} />
      <MakroOverview currentMakro={makroCurrent} targetMakro={makroTarget}  />
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
