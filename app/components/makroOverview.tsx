
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';
import { draculaTheme, spacing, typography, borderRadius } from '../../styles/theme';

export type Makro = {
  protein: number;
  carbs: number;
  fat: number;
};

export type MakroOverviewProps = {
  targetMakro: Makro;
  currentMakro: Makro;
};

export default function MakroOverview({ targetMakro, currentMakro }: MakroOverviewProps) {
  const data = {
    labels: ['Protein', 'Carbs', 'Fat'],
    data: [
      targetMakro.protein > 0 ? currentMakro.protein / targetMakro.protein : 0,
      targetMakro.carbs > 0 ? currentMakro.carbs / targetMakro.carbs : 0,
      targetMakro.fat > 0 ? currentMakro.fat / targetMakro.fat : 0,
    ],
    colors: [
      draculaTheme.nutrition.protein,
      draculaTheme.nutrition.carbs,
      draculaTheme.nutrition.fat,
    ]
  };

  const chartConfig = {
    backgroundGradientFrom: draculaTheme.surface.card,
    backgroundGradientTo: draculaTheme.surface.card,
    color: (opacity = 1, index) => {
      // The library has a bug, so we pass colors via data property
      return `rgba(255, 255, 255, ${opacity})`;
    },
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    propsForLabels: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Makro Overview</Text>
      <ProgressChart
        data={data}
        width={Dimensions.get('window').width - (spacing.md * 2) - (spacing.md * 2)}
        height={220}
        strokeWidth={16}
        radius={32}
        chartConfig={chartConfig}
        hideLegend={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: draculaTheme.surface.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  title: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
});