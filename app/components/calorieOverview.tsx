
import { borderRadius, draculaTheme, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

export type CalorieOverviewProps = {
  eaten: number;
  burned: number;
  remaining: number;
  target: number;
};

export default function CalorieOverview({ eaten, burned, remaining, target }: CalorieOverviewProps) {
  return (
    <View style={styles.calorieCounter}>
      <Text style={styles.calorieTitle}>Calorie Counter</Text>
      <View style={styles.calorieStats}>
        <View style={styles.calorieBox}>
          <Ionicons name="flag" size={28} color={draculaTheme.cyan} />
          <Text style={styles.calorieLabel}>Target</Text>
          <Text style={[styles.calorieValue, styles.target]}>{target}</Text>
          <Text style={styles.calorieUnit}>kcal</Text>
        </View>
        <View style={styles.calorieBox}>
          <Ionicons name="fast-food" size={28} color={draculaTheme.nutrition.calories} />
          <Text style={styles.calorieLabel}>Eaten</Text>
          <Text style={[styles.calorieValue, styles.eaten]}>{eaten}</Text>
          <Text style={styles.calorieUnit}>kcal</Text>
        </View>
        <View style={styles.calorieBox}>
          <Ionicons name="flame" size={28} color={draculaTheme.activity.cardio} />
          <Text style={styles.calorieLabel}>Burned</Text>
          <Text style={[styles.calorieValue, styles.burned]}>{burned}</Text>
          <Text style={styles.calorieUnit}>kcal</Text>
        </View>
        <View style={styles.calorieBox}>
          <Ionicons name="trending-up" size={28} color={draculaTheme.green} />
          <Text style={styles.calorieLabel}>Remaining</Text>
          <Text style={[styles.calorieValue, styles.remaining]}>{remaining}</Text>
          <Text style={styles.calorieUnit}>kcal</Text>
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
    gap: spacing.xs,
  },
  calorieLabel: {
    color: draculaTheme.comment,
    fontSize: typography.sizes.sm,
  },
  calorieValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  calorieUnit: {
    color: draculaTheme.comment,
    fontSize: typography.sizes.xs,
  },
  eaten: {
    color: draculaTheme.nutrition.calories,
  },
  burned: {
    color: draculaTheme.activity.cardio,
  },
  target: {
    color: draculaTheme.cyan,
  },
  remaining: {
    color: draculaTheme.green,
  },
});
