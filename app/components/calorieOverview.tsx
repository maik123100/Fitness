import { View, Text, StyleSheet } from 'react-native';

export type CalorieOverviewProps = {
  eaten: number;
  burned: number;
  remaining: number;
};

export default function CalorieOverview({ eaten, burned, remaining }: CalorieOverviewProps) {
  return (
    <View style={styles.calorieCounter}>
      <Text style={styles.calorieTitle}>Calorie Counter</Text>
      <View style={styles.calorieStats}>
        <View style={styles.calorieBox}>
          <Text style={styles.calorieLabel}>Eaten</Text>
          <Text style={styles.calorieValue}>{eaten} kcal</Text>
        </View>
        <View style={styles.calorieBox}>
          <Text style={styles.calorieLabel}>Burned</Text>
          <Text style={styles.calorieValue}>{burned} kcal</Text>
        </View>
        <View style={styles.calorieBox}>
          <Text style={styles.calorieLabel}>Remaining</Text>
          <Text style={styles.calorieValue}>{remaining} kcal</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calorieCounter: {
    marginBottom: 30,
    backgroundColor: '#1f1f1f',
    padding: 20,
    borderRadius: 10,
  },
  calorieTitle: {
    color: '#ffffff',
    fontSize: 20,
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
    color: '#b0b0b0',
    fontSize: 16,
  },
  calorieValue: {
    color: '#76c7c0',
    fontSize: 22,
    fontWeight: 'bold',
  },
});