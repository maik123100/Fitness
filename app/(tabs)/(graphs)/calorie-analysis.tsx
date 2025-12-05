import { useTheme } from '@/app/contexts/ThemeContext';
import { formatDateToYYYYMMDD } from '@/utils/dateHelpers';
import { getCalorieIntakeForPeriod } from '@/services/database';
import { borderRadius, spacing, typography } from '@/styles/theme';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

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

interface DayData {
  date: string;
  totalCalories: number;
  targetCalories: number;
  difference: number;
  percentageOfTarget: number;
}

interface Statistics {
  avgCalories: number;
  avgTarget: number;
  avgDifference: number;
  daysOver: number;
  daysUnder: number;
  daysOnTarget: number;
  totalDays: number;
  consistency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export default function CalorieAnalysisScreen() {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [dayData, setDayData] = useState<DayData[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);

    const data = getCalorieIntakeForPeriod(
      formatDateToYYYYMMDD(startDate),
      formatDateToYYYYMMDD(endDate)
    );

    if (data.length > 0) {
      // Process day data
      const processedDayData: DayData[] = data.map(d => {
        const difference = d.totalCalories - d.targetCalories;
        const percentage = (d.totalCalories / d.targetCalories) * 100;
        return {
          date: new Date(d.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
          totalCalories: d.totalCalories,
          targetCalories: d.targetCalories,
          difference,
          percentageOfTarget: percentage,
        };
      });
      setDayData(processedDayData);

      // Calculate statistics
      const avgCalories = data.reduce((sum, d) => sum + d.totalCalories, 0) / data.length;
      const avgTarget = data.reduce((sum, d) => sum + d.targetCalories, 0) / data.length;
      const avgDifference = avgCalories - avgTarget;
      
      const daysOver = data.filter(d => d.totalCalories > d.targetCalories + 100).length;
      const daysUnder = data.filter(d => d.totalCalories < d.targetCalories - 100).length;
      const daysOnTarget = data.length - daysOver - daysUnder;

      // Calculate consistency (how close to target on average)
      const avgDeviation = data.reduce((sum, d) => 
        sum + Math.abs(d.totalCalories - d.targetCalories), 0) / data.length;
      const consistency = Math.max(0, 100 - (avgDeviation / avgTarget * 100));

      // Calculate trend
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (data.length >= 3) {
        const firstHalf = data.slice(0, Math.floor(data.length / 2));
        const secondHalf = data.slice(Math.floor(data.length / 2));
        const firstAvg = firstHalf.reduce((sum, d) => sum + d.totalCalories, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, d) => sum + d.totalCalories, 0) / secondHalf.length;
        const difference = secondAvg - firstAvg;
        if (difference > 100) trend = 'increasing';
        else if (difference < -100) trend = 'decreasing';
      }

      setStatistics({
        avgCalories,
        avgTarget,
        avgDifference,
        daysOver,
        daysUnder,
        daysOnTarget,
        totalDays: data.length,
        consistency,
        trend,
      });

      // Create chart data
      const labels = data.map((d) => {
        const date = new Date(d.date);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      });

      const datasets: ChartData['datasets'] = [
        {
          data: data.map(d => d.totalCalories),
          color: (opacity = 1) => `rgba(189, 147, 249, ${opacity})`,
          strokeWidth: 3,
        },
        {
          data: data.map(d => d.targetCalories),
          color: (opacity = 1) => `rgba(255, 184, 108, ${opacity})`,
          strokeWidth: 2,
          withDots: false,
        }
      ];

      setChartData({
        labels,
        datasets,
        legend: ['Actual', 'Target'],
      });
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
      const r = parseInt(theme.comment.slice(1, 3), 16);
      const g = parseInt(theme.comment.slice(3, 5), 16);
      const b = parseInt(theme.comment.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    fillShadowGradientOpacity: 0,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: '5',
      strokeWidth: '2',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme.surface.secondary,
      strokeWidth: 1,
    },
    formatYLabel: (value: string) => {
      const num = parseFloat(value);
      return Math.round(num).toString();
    },
    decimalPlaces: 0,
  };

  const getTrendIcon = () => {
    if (!statistics) return null;
    switch (statistics.trend) {
      case 'increasing':
        return <Ionicons name="trending-up" size={20} color={theme.orange} />;
      case 'decreasing':
        return <Ionicons name="trending-down" size={20} color={theme.cyan} />;
      default:
        return <Ionicons name="remove" size={20} color={theme.comment} />;
    }
  };

  const getTrendText = () => {
    if (!statistics) return '';
    switch (statistics.trend) {
      case 'increasing':
        return 'Intake increasing';
      case 'decreasing':
        return 'Intake decreasing';
      default:
        return 'Intake stable';
    }
  };

  const getConsistencyColor = () => {
    if (!statistics) return theme.comment;
    if (statistics.consistency >= 80) return theme.green;
    if (statistics.consistency >= 60) return theme.yellow;
    return theme.red;
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {chartData && statistics ? (
        <>
          {/* Main Chart */}
          <View style={[styles.chartContainer, { backgroundColor: theme.surface.card }]}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: theme.foreground }]}>
                Calorie Tracking
              </Text>
              <Text style={[styles.chartSubtitle, { color: theme.comment }]}>
                Last 7 Days
              </Text>
            </View>
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - spacing.md * 4}
              height={220}
              chartConfig={chartConfig}
              withDots
              withInnerLines
              bezier
              segments={4}
              style={styles.chart}
            />
            
            {/* Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: 'rgba(189, 147, 249, 1)' }]} />
                <Text style={[styles.legendText, { color: theme.comment }]}>Actual</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: 'rgba(255, 184, 108, 1)' }]} />
                <Text style={[styles.legendText, { color: theme.comment }]}>Target</Text>
              </View>
            </View>
          </View>

          {/* Key Metrics */}
          <View style={[styles.metricsContainer, { backgroundColor: theme.surface.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
              Key Metrics
            </Text>
            
            <View style={styles.metricsGrid}>
              {/* Average Intake */}
              <View style={[styles.metricCard, { backgroundColor: theme.surface.secondary }]}>
                <View style={styles.metricHeader}>
                  <Ionicons name="restaurant" size={20} color={theme.purple} />
                  <Text style={[styles.metricLabel, { color: theme.comment }]}>
                    Avg Intake
                  </Text>
                </View>
                <Text style={[styles.metricValue, { color: theme.foreground }]}>
                  {Math.round(statistics.avgCalories)}
                </Text>
                <Text style={[styles.metricUnit, { color: theme.comment }]}>
                  kcal/day
                </Text>
              </View>

              {/* Average Target */}
              <View style={[styles.metricCard, { backgroundColor: theme.surface.secondary }]}>
                <View style={styles.metricHeader}>
                  <Ionicons name="flag" size={20} color={theme.orange} />
                  <Text style={[styles.metricLabel, { color: theme.comment }]}>
                    Avg Target
                  </Text>
                </View>
                <Text style={[styles.metricValue, { color: theme.foreground }]}>
                  {Math.round(statistics.avgTarget)}
                </Text>
                <Text style={[styles.metricUnit, { color: theme.comment }]}>
                  kcal/day
                </Text>
              </View>

              {/* Average Difference */}
              <View style={[styles.metricCard, { backgroundColor: theme.surface.secondary }]}>
                <View style={styles.metricHeader}>
                  <Ionicons 
                    name={statistics.avgDifference > 0 ? "arrow-up" : "arrow-down"} 
                    size={20} 
                    color={statistics.avgDifference > 0 ? theme.red : theme.green} 
                  />
                  <Text style={[styles.metricLabel, { color: theme.comment }]}>
                    Avg Diff
                  </Text>
                </View>
                <Text style={[
                  styles.metricValue, 
                  { color: Math.abs(statistics.avgDifference) < 100 ? theme.green : 
                           statistics.avgDifference > 0 ? theme.red : theme.green }
                ]}>
                  {statistics.avgDifference > 0 ? '+' : ''}{Math.round(statistics.avgDifference)}
                </Text>
                <Text style={[styles.metricUnit, { color: theme.comment }]}>
                  kcal/day
                </Text>
              </View>

              {/* Consistency */}
              <View style={[styles.metricCard, { backgroundColor: theme.surface.secondary }]}>
                <View style={styles.metricHeader}>
                  <Ionicons name="pulse" size={20} color={getConsistencyColor()} />
                  <Text style={[styles.metricLabel, { color: theme.comment }]}>
                    Consistency
                  </Text>
                </View>
                <Text style={[styles.metricValue, { color: getConsistencyColor() }]}>
                  {Math.round(statistics.consistency)}%
                </Text>
                <Text style={[styles.metricUnit, { color: theme.comment }]}>
                  accuracy
                </Text>
              </View>
            </View>
          </View>

          {/* Daily Performance */}
          <View style={[styles.performanceContainer, { backgroundColor: theme.surface.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
              Daily Performance
            </Text>
            
            <View style={styles.performanceGrid}>
              <View style={styles.performanceItem}>
                <View style={[styles.performanceIcon, { backgroundColor: `${theme.green}20` }]}>
                  <Ionicons name="checkmark-circle" size={24} color={theme.green} />
                </View>
                <Text style={[styles.performanceValue, { color: theme.foreground }]}>
                  {statistics.daysOnTarget}
                </Text>
                <Text style={[styles.performanceLabel, { color: theme.comment }]}>
                  On Target
                </Text>
              </View>

              <View style={styles.performanceItem}>
                <View style={[styles.performanceIcon, { backgroundColor: `${theme.red}20` }]}>
                  <Ionicons name="arrow-up-circle" size={24} color={theme.red} />
                </View>
                <Text style={[styles.performanceValue, { color: theme.foreground }]}>
                  {statistics.daysOver}
                </Text>
                <Text style={[styles.performanceLabel, { color: theme.comment }]}>
                  Over Target
                </Text>
              </View>

              <View style={styles.performanceItem}>
                <View style={[styles.performanceIcon, { backgroundColor: `${theme.cyan}20` }]}>
                  <Ionicons name="arrow-down-circle" size={24} color={theme.cyan} />
                </View>
                <Text style={[styles.performanceValue, { color: theme.foreground }]}>
                  {statistics.daysUnder}
                </Text>
                <Text style={[styles.performanceLabel, { color: theme.comment }]}>
                  Under Target
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressBar, { backgroundColor: theme.surface.secondary }]}>
              <View 
                style={[
                  styles.progressSegment, 
                  { 
                    width: `${(statistics.daysOnTarget / statistics.totalDays) * 100}%`,
                    backgroundColor: theme.green 
                  }
                ]} 
              />
              <View 
                style={[
                  styles.progressSegment, 
                  { 
                    width: `${(statistics.daysOver / statistics.totalDays) * 100}%`,
                    backgroundColor: theme.red 
                  }
                ]} 
              />
              <View 
                style={[
                  styles.progressSegment, 
                  { 
                    width: `${(statistics.daysUnder / statistics.totalDays) * 100}%`,
                    backgroundColor: theme.cyan 
                  }
                ]} 
              />
            </View>
          </View>

          {/* Trend Analysis */}
          <View style={[styles.trendContainer, { backgroundColor: theme.surface.card }]}>
            <View style={styles.trendHeader}>
              {getTrendIcon()}
              <Text style={[styles.trendTitle, { color: theme.foreground }]}>
                {getTrendText()}
              </Text>
            </View>
            <Text style={[styles.trendDescription, { color: theme.comment }]}>
              {statistics.trend === 'increasing' && 
                'Your calorie intake has been increasing over the past week. Consider reviewing your portion sizes and meal choices.'}
              {statistics.trend === 'decreasing' && 
                'Your calorie intake has been decreasing. Ensure you\'re meeting your nutritional needs.'}
              {statistics.trend === 'stable' && 
                'Your calorie intake has been stable. Great job maintaining consistency!'}
            </Text>
          </View>

          {/* Day-by-Day Breakdown */}
          <View style={[styles.breakdownContainer, { backgroundColor: theme.surface.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
              Day-by-Day Breakdown
            </Text>
            
            {dayData.map((day, index) => (
              <View key={index} style={styles.dayRow}>
                <View style={styles.dayInfo}>
                  <Text style={[styles.dayDate, { color: theme.foreground }]}>
                    {day.date}
                  </Text>
                  <Text style={[styles.dayCalories, { color: theme.comment }]}>
                    {Math.round(day.totalCalories)} / {Math.round(day.targetCalories)} kcal
                  </Text>
                </View>
                
                <View style={styles.dayStatus}>
                  <Text style={[
                    styles.dayDifference, 
                    { 
                      color: Math.abs(day.difference) < 100 ? theme.green :
                             day.difference > 0 ? theme.red : theme.cyan
                    }
                  ]}>
                    {day.difference > 0 ? '+' : ''}{Math.round(day.difference)}
                  </Text>
                  <View style={[
                    styles.dayBadge,
                    {
                      backgroundColor: Math.abs(day.difference) < 100 ? `${theme.green}20` :
                                       day.difference > 0 ? `${theme.red}20` : `${theme.cyan}20`
                    }
                  ]}>
                    <Text style={[
                      styles.dayBadgeText,
                      {
                        color: Math.abs(day.difference) < 100 ? theme.green :
                               day.difference > 0 ? theme.red : theme.cyan
                      }
                    ]}>
                      {Math.abs(day.difference) < 100 ? 'On Target' :
                       day.difference > 0 ? 'Over' : 'Under'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.noDataContainer}>
          <Ionicons name="analytics-outline" size={64} color={theme.comment} />
          <Text style={[styles.noDataText, { color: theme.foreground }]}>
            No Data Available
          </Text>
          <Text style={[styles.noDataSubtext, { color: theme.comment }]}>
            Start tracking your meals to see calorie analysis
          </Text>
        </View>
      )}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 3,
  },
  noDataText: {
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: typography.sizes.md,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  chartContainer: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  chartHeader: {
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  chartSubtitle: {
    fontSize: typography.sizes.sm,
  },
  chart: {
    borderRadius: borderRadius.md,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: typography.sizes.sm,
  },
  metricsContainer: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  metricLabel: {
    fontSize: typography.sizes.sm,
  },
  metricValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  metricUnit: {
    fontSize: typography.sizes.xs,
  },
  performanceContainer: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  performanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  performanceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  performanceValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  performanceLabel: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressSegment: {
    height: '100%',
  },
  trendContainer: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  trendTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  trendDescription: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  breakdownContainer: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dayInfo: {
    flex: 1,
  },
  dayDate: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  dayCalories: {
    fontSize: typography.sizes.sm,
  },
  dayStatus: {
    alignItems: 'flex-end',
  },
  dayDifference: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  dayBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  dayBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
});
