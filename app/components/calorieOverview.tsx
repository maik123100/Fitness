
import { View, Text, StyleSheet } from 'react-native';
import { draculaTheme, spacing, typography, borderRadius } from '@/styles/theme';

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
          <Text style={[styles.calorieValue, styles.eaten]}>{eaten} kcal</Text>
        </View>
        <View style={styles.calorieBox}>
          <Text style={styles.calorieLabel}>Burned</Text>
          <Text style={[styles.calorieValue, styles.burned]}>{burned} kcal</Text>
        </View>
        <View style={styles.calorieBox}>
          <Text style={styles.calorieLabel}>Remaining</Text>
          <Text style={[styles.calorieValue, styles.remaining]}>{remaining} kcal</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calorieCounter: {
    marginBottom: spacing.lg,
    backgroundColor: draculaTheme.surface.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  calorieTitle: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  calorieStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calorieBox: {
    alignItems: 'center',
  },
  calorieLabel: {
    color: draculaTheme.comment,
    fontSize: typography.sizes.md,
    marginBottom: spacing.sm,
  },
  calorieValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  eaten: {
    color: draculaTheme.nutrition.calories,
  },
  burned: {
    color: draculaTheme.activity.cardio,
  },
  remaining: {
    color: draculaTheme.green,
  },
});
