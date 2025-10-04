
import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getWeightEntries, getNutritionSummary, NutritionSummary } from '../../services/database';
import { draculaTheme, spacing, borderRadius, typography } from '../../styles/theme';

export default function DietReportScreen() {
  const [weightData, setWeightData] = useState<{ labels: string[]; datasets: { data: number[] }[] }>({ labels: [], datasets: [{ data: [] }] });
  const [nutritionData, setNutritionData] = useState<NutritionSummary[]>([]);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = () => {
    // Load weight data
    const weightEntries = getWeightEntries(30).reverse(); // Get last 30 and reverse for chart
    if (weightEntries.length > 0) {
      setWeightData({
        labels: weightEntries.map(e => new Date(e.date).toLocaleDateString()),
        datasets: [{
          data: weightEntries.map(e => e.weight),
        }],
      });
    }

    // Load nutrition data for the last 7 days
    const summaries: NutritionSummary[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      summaries.push(getNutritionSummary(dateString));
    }
    setNutritionData(summaries);
  };

  const chartConfig = {
    backgroundGradientFrom: draculaTheme.surface.card,
    backgroundGradientTo: draculaTheme.surface.card,
    color: (opacity = 1) => `rgba(139, 233, 253, ${opacity})`, // Cyan
    labelColor: (opacity = 1) => `rgba(248, 248, 242, ${opacity})`, // Foreground
    strokeWidth: 2,
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: draculaTheme.pink,
    },
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Diet Report</Text>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Weight History (Last 30 entries)</Text>
        {weightData.labels.length > 0 ? (
          <LineChart
            data={weightData}
            width={Dimensions.get('window').width - spacing.md * 2}
            height={220}
            chartConfig={chartConfig}
            bezier
          />
        ) : (
          <Text style={styles.noDataText}>No weight entries yet.</Text>
        )}
      </View>

      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>7-Day Nutrition Summary</Text>
        {nutritionData.map((summary, index) => (
          <View key={index} style={styles.summaryDay}>
            <Text style={styles.summaryDate}>{new Date(summary.date).toLocaleDateString()}</Text>
            <View style={styles.summaryMetrics}>
              <Text style={styles.summaryText}>Calories: {summary.totalCalories.toFixed(0)}</Text>
              <Text style={styles.summaryText}>Protein: {summary.totalProtein.toFixed(0)}g</Text>
              <Text style={styles.summaryText}>Carbs: {summary.totalCarbs.toFixed(0)}g</Text>
              <Text style={styles.summaryText}>Fat: {summary.totalFat.toFixed(0)}g</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: draculaTheme.background,
    padding: spacing.md,
  },
  header: {
    fontSize: typography.sizes.heading,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  chartSection: {
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summarySection: {
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
    marginBottom: spacing.md,
  },
  noDataText: {
    color: draculaTheme.comment,
    textAlign: 'center',
    padding: spacing.lg,
  },
  summaryDay: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: draculaTheme.surface.secondary,
  },
  summaryDate: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: draculaTheme.purple,
    marginBottom: spacing.sm,
  },
  summaryMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontSize: typography.sizes.sm,
    color: draculaTheme.foreground,
    width: '48%',
    marginBottom: spacing.xs,
  },
});
