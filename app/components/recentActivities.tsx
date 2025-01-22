import { View, Text, FlatList, StyleSheet } from 'react-native';

export type RecentActivity = {
  id: string;
  activity: string;
  calories: number;
  type: 'eaten' | 'burned';
};

export default function RecentActivities({ recentActivities }: { recentActivities: RecentActivity[] }) {
  return (
    <View style={styles.activitiesSection}>
      <Text style={styles.activitiesTitle}>Recent Activities</Text>
      {recentActivities.length === 0 ? (
        <Text style={styles.noActivitiesText}>No recent activities to display.</Text>
      ) : (
        <FlatList
          data={recentActivities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.activityItem}>
              <Text style={styles.activityText}>{item.activity}</Text>
              <Text style={item.type === 'eaten' ? styles.eatenCalories : styles.burnedCalories}>
                {item.calories} kcal
              </Text>
            </View>
          )}
          contentContainerStyle={styles.activitiesList}
          style={styles.activitiesListContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  activitiesSection: {
    flex: 1,
  },
  activitiesTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noActivitiesText: {
    color: '#b0b0b0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  activitiesList: {
    paddingBottom: 10,
  },
  activitiesListContainer: {
    maxHeight: 300,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1f1f1f',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  activityText: {
    color: '#ffffff',
    fontSize: 16,
  },
  eatenCalories: {
    color: '#f44336',
    fontSize: 16,
  },
  burnedCalories: {
    color: '#4caf50',
    fontSize: 16,
  },
});