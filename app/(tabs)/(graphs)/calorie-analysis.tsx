import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getCalorieIntakeForPeriod } from '@/services/database';
import { draculaTheme, spacing, borderRadius, typography } from '@/styles/theme';

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
  legend?: string[];
}

export default function CalorieAnalysisScreen() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [summary, setSummary] = useState<{ over: number, under: number, target: number } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const p = 7;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - p + 1);

    const data = getCalorieIntakeForPeriod(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    if (data.length > 0) {
      const labels = data.map((d) => new Date(d.date).toLocaleDateString([], { month: 'short', day: 'numeric' }));
      const datasets: ChartData['datasets'] = [
        {
          data: data.map(d => d.totalCalories),
          color: (opacity = 1) => `rgba(80, 250, 123, ${opacity})`, // Green for calories
          strokeWidth: 2,
        },
        {
          data: data.map(() => data[0].targetCalories),
          color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Red for target
          strokeWidth: 2,
        }
      ];

      setChartData({
        labels,
        datasets,
        legend: ['Calories', 'Target'],
      });

      const over = data.filter(d => d.totalCalories > d.targetCalories).length;
      const under = data.length - over;
      setSummary({ over, under, target: data[0].targetCalories });
    }
  };

  const chartConfig = {
    backgroundGradientFrom: draculaTheme.surface.card,
    backgroundGradientTo: draculaTheme.surface.card,
    color: (opacity = 1) => `rgba(248, 248, 242, ${opacity})`,
    labelColor: (opacity = 1) => draculaTheme.green,
    fillShadowGradientOpacity: 0.1,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: draculaTheme.surface.secondary,
    },
  };

  return (
    <View style={styles.container}>
      {chartData ? (
        <>
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Calorie Intake (Last 7 Days)</Text>
              <Text style={styles.chartUnit}>kcal</Text>
            </View>
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - spacing.md * 4}
              height={220}
              chartConfig={chartConfig}
              fromZero
              withDots
              bezier
            />
          </View>
          {summary && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>Target Calories: {summary.target.toFixed(0)} kcal</Text>
              <Text style={styles.summaryText}>Days Over Target: {summary.over}</Text>
              <Text style={styles.summaryText}>Days Under Target: {summary.under}</Text>
            </View>
          )}
        </>
      ) : (
        <Text style={styles.noDataText}>No data available for the selected period.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: draculaTheme.background,
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  noDataText: {
    color: draculaTheme.comment,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  summaryContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
  },
  summaryText: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.md,
    marginBottom: spacing.sm,
  },
  chartContainer: {
    marginBottom: spacing.lg,
    backgroundColor: draculaTheme.surface.card,
    borderRadius: 16,
    padding: spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartTitle: {
    color: draculaTheme.foreground,
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartUnit: {
    color: draculaTheme.comment,
    fontSize: 12,
  },
});