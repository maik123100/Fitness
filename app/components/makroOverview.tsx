
import { Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';
import { draculaTheme, spacing, typography, borderRadius } from '../../styles/theme';
import { useRouter } from 'expo-router';

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
  const router = useRouter();
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
    color: (opacity: number, index?: number) => {
      const rgbColors = [
        '255, 121, 198', // Protein: #ff79c6
        '255, 184, 108', // Carbs: #ffb86c
        '241, 250, 140', // Fat: #f1fa8c
      ];
      const rgb = rgbColors[index || 0];
      return `rgba(${rgb}, ${opacity})`;
    },
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    propsForLabels: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
    },
  };

  return (
    <TouchableOpacity onPress={() => router.navigate('/macroGraphs')} style={styles.container}>
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
    </TouchableOpacity>
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
