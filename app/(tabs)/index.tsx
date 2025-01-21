import { Text, View, StyleSheet, FlatList } from 'react-native';
import { Link } from 'expo-router';

/**
 * Index screen is the Dashboard of the Fitness App.
 * It should display the user's current status and progress. 
 * There should be a Calorie Counter (eaten,burned,remaining) and a list of the user's recent activities.
 */
export default function Index() {
  // Sample data
  const calorieData = {
    eaten: 1500,
    burned: 500,
    remaining: 1000,
  };

  const recentActivities = [
    { id: '1', activity: 'Morning Run', calories: 300 },
    { id: '2', activity: 'Lunch: Salad', calories: 400 },
    { id: '3', activity: 'Workout: HIIT', calories: 600 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.calorieCounter}>
        <Text style={styles.calorieTitle}>Calorie Counter</Text>
        <View style={styles.calorieStats}>
          <View style={styles.calorieBox}>
            <Text style={styles.calorieLabel}>Eaten</Text>
            <Text style={styles.calorieValue}>{calorieData.eaten} kcal</Text>
          </View>
          <View style={styles.calorieBox}>
            <Text style={styles.calorieLabel}>Burned</Text>
            <Text style={styles.calorieValue}>{calorieData.burned} kcal</Text>
          </View>
          <View style={styles.calorieBox}>
            <Text style={styles.calorieLabel}>Remaining</Text>
            <Text style={styles.calorieValue}>{calorieData.remaining} kcal</Text>
          </View>
        </View>
      </View>

      {/* Recent Activities Section */}
      <View style={styles.activitiesSection}>
        <Text style={styles.activitiesTitle}>Recent Activities</Text>
        <FlatList
          data={recentActivities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.activityItem}>
              <Text style={styles.activityText}>{item.activity}</Text>
              <Text style={styles.activityCalories}>{item.calories} kcal</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 20,
  },
  calorieCounter: {
    marginBottom: 30,
    backgroundColor: '#1e1e25',
    padding: 20,
    borderRadius: 10,
  },
  calorieTitle: {
    color: '#ffd33d',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  calorieStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calorieBox: {
    alignItems: 'center',
  },
  calorieLabel: {
    color: '#fff',
    fontSize: 16,
  },
  calorieValue: {
    color: '#ffd33d',
    fontSize: 20,
    fontWeight: 'bold',
  },
  activitiesSection: {
    flex: 1,
  },
  activitiesTitle: {
    color: '#ffd33d',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1e1e25',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  activityText: {
    color: '#fff',
    fontSize: 16,
  },
  activityCalories: {
    color: '#ffd33d',
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ffd33d',
    borderRadius: 5,
  },
  buttonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
