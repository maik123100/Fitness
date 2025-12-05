
import { useTheme } from '@/app/contexts/ThemeContext';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
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
    <View style={[styles.calorieCounter, { backgroundColor: theme.surface.card }, shadows.md]}>
      <Text style={[styles.calorieTitle, { color: theme.foreground }]}>Daily Calories</Text>
      <View style={styles.calorieStats}>
        <View style={styles.calorieBox}>
          <View style={[styles.iconContainer, { backgroundColor: theme.cyan + '20' }]}>
            <Ionicons name="flag" size={24} color={theme.cyan} />
          </View>
          <Text style={[styles.calorieValue, { color: theme.foreground }]}>{target}</Text>
          <Text style={[styles.calorieLabel, { color: theme.comment }]}>Target</Text>
        </View>
        <View style={styles.calorieBox}>
          <View style={[styles.iconContainer, { backgroundColor: theme.orange + '20' }]}>
            <Ionicons name="fast-food" size={24} color={theme.orange} />
          </View>
          <Text style={[styles.calorieValue, { color: theme.foreground }]}>{eaten}</Text>
          <Text style={[styles.calorieLabel, { color: theme.comment }]}>Eaten</Text>
        </View>
        <View style={styles.calorieBox}>
          <View style={[styles.iconContainer, { backgroundColor: theme.red + '20' }]}>
            <Ionicons name="flame" size={24} color={theme.red} />
          </View>
          <Text style={[styles.calorieValue, { color: theme.foreground }]}>{burned}</Text>
          <Text style={[styles.calorieLabel, { color: theme.comment }]}>Burned</Text>
        </View>
        <View style={styles.calorieBox}>
          <View style={[styles.iconContainer, { backgroundColor: theme.green + '20' }]}>
            <Ionicons name="trending-up" size={24} color={theme.green} />
          </View>
          <Text style={[styles.calorieValue, { color: theme.foreground }]}>{remaining}</Text>
          <Text style={[styles.calorieLabel, { color: theme.comment }]}>Remaining</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calorieCounter: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  calorieTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.lg,
  },
  calorieStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calorieBox: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  calorieLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  calorieValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
});
