import { useTheme } from '@/app/contexts/ThemeContext';
import { formatDateToYYYYMMDD } from '@/app/utils/dateHelpers';
import { getCalorieIntakeForPeriod } from '@/services/database';
import { borderRadius, spacing, typography } from '@/styles/theme';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
    withDots?: boolean;
  }[];
  legend?: string[];
}

interface DayStatus {
  date: string;
  isOver: boolean;
  difference: number;
}

export default function CalorieAnalysisScreen() {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [summary, setSummary] = useState<{ over: number, under: number, baseTarget: number, avgTarget: number } | null>(null);
  const [dayStatus, setDayStatus] = useState<DayStatus[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6); // 6 days before today + today = last 7 days

    const data = getCalorieIntakeForPeriod(
      formatDateToYYYYMMDD(startDate),
      formatDateToYYYYMMDD(endDate)
    );

    if (data.length > 0) {
      const labels = data.map((d) => new Date(d.date).toLocaleDateString([], { month: 'short', day: 'numeric' }));

      // Calculate if over or under for each day to determine colors
      const overUnderData = data.map(d => d.totalCalories - d.targetCalories);
      const statusData: DayStatus[] = data.map(d => ({
        date: new Date(d.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        isOver: d.totalCalories > d.targetCalories,
        difference: d.totalCalories - d.targetCalories,
      }));

      setDayStatus(statusData);

      const datasets: ChartData['datasets'] = [
        {
          data: data.map(d => d.totalCalories),
          color: (opacity = 1) => {
            // Use different colors based on average over/under
            const avgDiff = overUnderData.reduce((sum, val) => sum + val, 0) / overUnderData.length;
            if (avgDiff > 0) {
              return `rgba(255, 85, 85, ${opacity})`; // Red/warning when over
            } else {
              return `rgba(80, 250, 123, ${opacity})`; // Green when under
            }
          },
          strokeWidth: 3,
        },
        {
          data: data.map(d => d.targetCalories),
          color: (opacity = 1) => `rgba(255, 184, 108, ${opacity})`, // Orange for target
          strokeWidth: 2,
          withDots: false,
        }
      ];

      setChartData({
        labels,
        datasets,
        legend: ['Calories', 'Target'],
      });

      const over = data.filter(d => d.totalCalories > d.targetCalories).length;
      const under = data.length - over;
      const avgTarget = data.reduce((sum, d) => sum + d.targetCalories, 0) / data.length;

      // Calculate base target from user profile (should be consistent)
      const minTarget = Math.min(...data.map(d => d.targetCalories));

      setSummary({ over, under, baseTarget: minTarget, avgTarget });
    }
  };

  const chartConfig = {
    backgroundGradientFrom: theme.surface.card,
    backgroundGradientTo: theme.surface.card,
    color: (opacity = 1) => {
      const r = parseInt(theme.foreground.slice(1, 3), 16);
      const g = parseInt(theme.foreground.slice(3, 5), 16);
      const b = parseInt(theme.foreground.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    labelColor: (opacity = 1) => {
      const r = parseInt(theme.green.slice(1, 3), 16);
      const g = parseInt(theme.green.slice(3, 5), 16);
      const b = parseInt(theme.green.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    fillShadowGradientOpacity: 0.3,
    useShadowColorFromDataset: true,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme.surface.secondary,
    },
    formatYLabel: (value: string) => {
      const num = parseFloat(value);
      return Math.round(num).toString();
    },
    decimalPlaces: 0,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {chartData ? (
        <>
          <View style={[styles.chartContainer, { backgroundColor: theme.surface.card }]}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: theme.foreground }]}>Calorie Intake (Last 7 Days)</Text>
              <Text style={[styles.chartUnit, { color: theme.comment }]}>kcal</Text>
            </View>
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - spacing.md * 4}
              height={220}
              chartConfig={chartConfig}
              withDots
              withShadow
              withInnerLines
              bezier
              segments={4}
            />
            {dayStatus.length > 0 && (
              <View style={styles.statusBar}>
                {dayStatus.map((day, index) => (
                  <View
                    key={index}
                    style={[
                      styles.statusIndicator,
                      {
                        backgroundColor: day.isOver
                          ? theme.red
                          : theme.green,
                      },
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
          {summary && (
            <View style={[styles.summaryContainer, { backgroundColor: theme.surface.card }]}>
              <Text style={[styles.summaryText, { color: theme.foreground }]}>Base Target: {summary.baseTarget.toFixed(0)} kcal/day</Text>
              <Text style={[styles.summaryText, { color: theme.foreground }]}>Avg Target (incl. exercise): {summary.avgTarget.toFixed(0)} kcal/day</Text>
              <Text style={[styles.summaryText, { color: theme.foreground }]}>Days Over Target: {summary.over}</Text>
              <Text style={[styles.summaryText, { color: theme.foreground }]}>Days Under Target: {summary.under}</Text>
            </View>
          )}
        </>
      ) : (
        <Text style={[styles.noDataText, { color: theme.comment }]}>No data available for the selected period.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  summaryContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  summaryText: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.sm,
  },
  chartContainer: {
    marginBottom: spacing.lg,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartUnit: {
    fontSize: 12,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  statusIndicator: {
    flex: 1,
    height: 8,
    marginHorizontal: 2,
    borderRadius: 4,
  },
});
