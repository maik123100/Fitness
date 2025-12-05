
import { useTheme } from '@/app/contexts/ThemeContext';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import { useRouter } from 'expo-router';
import { Dimensions, Pressable, StyleSheet, Text } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';

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
  const { theme } = useTheme();
  
  const data = {
    labels: ['Protein', 'Carbs', 'Fat'],
    data: [
      targetMakro.protein > 0 ? Math.min(currentMakro.protein / targetMakro.protein, 1) : 0,
      targetMakro.carbs > 0 ? Math.min(currentMakro.carbs / targetMakro.carbs, 1) : 0,
      targetMakro.fat > 0 ? Math.min(currentMakro.fat / targetMakro.fat, 1) : 0,
    ],
    colors: [
      theme.nutrition.protein,
      theme.nutrition.carbs,
      theme.nutrition.fat,
    ]
  };

  const chartConfig = {
    backgroundGradientFrom: theme.surface.card,
    backgroundGradientTo: theme.surface.card,
    color: (opacity: number, index?: number) => {
      const colors = [
        theme.nutrition.protein, 
        theme.nutrition.carbs,
        theme.nutrition.fat,
      ];
      const color = colors[index || 0];
      // Convert hex to rgba
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    labelColor: (opacity = 1) => {
      const color = theme.foreground;
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    propsForLabels: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
    },
  };

  return (
    <Pressable 
      onPress={() => router.navigate('/macroGraphs')} 
      style={[styles.container, { backgroundColor: theme.surface.card }, shadows.md]}
      android_ripple={{ color: theme.selection }}
    >
      <Text style={[styles.title, { color: theme.foreground }]}>Macro Overview</Text>
      <ProgressChart
        data={data}
        width={Dimensions.get('window').width - (spacing.lg * 4)}
        height={220}
        strokeWidth={16}
        radius={32}
        chartConfig={chartConfig}
        hideLegend={false}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
});
