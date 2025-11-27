
import { useTheme } from '@/app/contexts/ThemeContext';
import { borderRadius, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

export type CalorieOverviewProps = {
  eaten: number;
  burned: number;
  remaining: number;
  target: number;
};

export default function CalorieOverview({ eaten, burned, remaining, target }: CalorieOverviewProps) {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.calorieCounter, { backgroundColor: theme.surface.card }]}>
      <Text style={[styles.calorieTitle, { color: theme.foreground }]}>Calorie Counter</Text>
      <View style={styles.calorieStats}>
        <View style={styles.calorieBox}>
          <Ionicons name="flag" size={28} color={theme.cyan} />
          <Text style={[styles.calorieLabel, { color: theme.comment }]}>Target</Text>
          <Text style={[styles.calorieValue, { color: theme.cyan }]}>{target}</Text>
          <Text style={[styles.calorieUnit, { color: theme.comment }]}>kcal</Text>
        </View>
        <View style={styles.calorieBox}>
          <Ionicons name="fast-food" size={28} color={theme.nutrition.calories} />
          <Text style={[styles.calorieLabel, { color: theme.comment }]}>Eaten</Text>
          <Text style={[styles.calorieValue, { color: theme.nutrition.calories }]}>{eaten}</Text>
          <Text style={[styles.calorieUnit, { color: theme.comment }]}>kcal</Text>
        </View>
        <View style={styles.calorieBox}>
          <Ionicons name="flame" size={28} color={theme.activity.cardio} />
          <Text style={[styles.calorieLabel, { color: theme.comment }]}>Burned</Text>
          <Text style={[styles.calorieValue, { color: theme.activity.cardio }]}>{burned}</Text>
          <Text style={[styles.calorieUnit, { color: theme.comment }]}>kcal</Text>
        </View>
        <View style={styles.calorieBox}>
          <Ionicons name="trending-up" size={28} color={theme.green} />
          <Text style={[styles.calorieLabel, { color: theme.comment }]}>Remaining</Text>
          <Text style={[styles.calorieValue, { color: theme.green }]}>{remaining}</Text>
          <Text style={[styles.calorieUnit, { color: theme.comment }]}>kcal</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calorieCounter: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  calorieTitle: {
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
    fontSize: typography.sizes.sm,
  },
  calorieValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  calorieUnit: {
    fontSize: typography.sizes.xs,
  },
  eaten: {
    // Removed - color applied inline
  },
  burned: {
    // Removed - color applied inline
  },
  target: {
    // Removed - color applied inline
  },
  remaining: {
    // Removed - color applied inline
  },
});
