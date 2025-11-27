import { useTheme } from '@/app/contexts/ThemeContext';
import { getExerciseProgression, getExerciseTemplates } from '@/services/database';
import { spacing } from '@/styles/theme';
import { ExerciseTemplate } from '@/types/types';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

type DataType = 'reps' | 'weight' | 'intensity';

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color: (opacity: number) => string;
    strokeWidth: number;
  }[];
}

interface ProgressionStats {
  totalWorkouts: number;
  averageValue: number;
  bestValue: number;
  improvement: number;
  improvementPercent: number;
}

const setColors = [
  (opacity = 1) => `rgba(168, 85, 247, ${opacity})`, // Purple
  (opacity = 1) => `rgba(236, 72, 153, ${opacity})`, // Pink
  (opacity = 1) => `rgba(251, 191, 36, ${opacity})`, // Amber
  (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // Green
  (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue
  (opacity = 1) => `rgba(249, 115, 22, ${opacity})`, // Orange
];

export default function WorkoutProgressionScreen() {
  const { theme } = useTheme();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exerciseTemplates, setExerciseTemplates] = useState<ExerciseTemplate[]>([]);
  const [chartData, setChartData] = useState<ChartData[] | null>(null);
  const [selectedData, setSelectedData] = useState<DataType>('intensity');
  const [stats, setStats] = useState<ProgressionStats | null>(null);

  useEffect(() => {
    const templates = getExerciseTemplates();
    setExerciseTemplates(templates);
    if (templates.length > 0) {
      setSelectedExercise(templates[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedExercise) {
      loadData(selectedExercise, selectedData);
    }
  }, [selectedExercise, selectedData]);

  const loadData = (exerciseId: string, dataType: DataType) => {
    const progressionData = getExerciseProgression(exerciseId, 30);

    if (progressionData.length > 0) {
      const labels = progressionData.map((d, i) => {
        if (i === 0 || i === progressionData.length - 1) {
          return new Date(d.date).toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
        return '';
      });

      const maxSets = Math.max(...progressionData.map(d => d.sets.length));
      const charts: ChartData[] = [];

      // Calculate statistics
      let totalValue = 0;
      let totalCount = 0;
      let bestValue = 0;
      let firstValue = 0;
      let lastValue = 0;

      for (let i = 0; i < maxSets; i++) {
        let setData: number[] = [];
        if (dataType === 'reps') {
          setData = progressionData.map(d => d.sets[i] ? d.sets[i].reps : 0);
        } else if (dataType === 'weight') {
          setData = progressionData.map(d => d.sets[i] ? d.sets[i].weight : 0);
        } else {
          setData = progressionData.map(d => d.sets[i] ? d.sets[i].weight * d.sets[i].reps : 0);
        }

        // Calculate stats from set data
        setData.forEach((value, idx) => {
          if (value > 0) {
            totalValue += value;
            totalCount++;
            if (value > bestValue) bestValue = value;
            if (idx === 0 && firstValue === 0) firstValue = value;
            if (idx === setData.length - 1) lastValue = value;
          }
        });

        charts.push({
          labels,
          datasets: [{
            data: setData.length > 0 ? setData : [0],
            color: setColors[i % setColors.length],
            strokeWidth: 2,
          }],
        });
      }

      const averageValue = totalCount > 0 ? totalValue / totalCount : 0;
      const improvement = lastValue - firstValue;
      const improvementPercent = firstValue > 0 ? (improvement / firstValue) * 100 : 0;

      setStats({
        totalWorkouts: progressionData.length,
        averageValue,
        bestValue,
        improvement,
        improvementPercent,
      });

      setChartData(charts);
    } else {
      setChartData(null);
      setStats(null);
    }
  };

  const chartConfig = {
    backgroundGradientFrom: theme.surface.card,
    backgroundGradientTo: theme.surface.card,
    color: (opacity = 1) => theme.purple + Math.round(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: (opacity = 1) => theme.text.secondary + Math.round(opacity * 255).toString(16).padStart(2, '0'),
    fillShadowGradientOpacity: 0,
    propsForDots: {
      r: '5',
      strokeWidth: '2',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme.surface.secondary,
      strokeWidth: 1,
    },
    decimalPlaces: 0,
  };

  const getUnit = (dataType: DataType) => {
    if (dataType === 'reps') return 'reps';
    if (dataType === 'weight') return 'kg';
    return 'kg×reps';
  };

  const getStatLabel = (dataType: DataType) => {
    if (dataType === 'reps') return 'Repetitions';
    if (dataType === 'weight') return 'Weight';
    return 'Total Intensity';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Exercise Selector */}
      <View style={[styles.selectorCard, { backgroundColor: theme.surface.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Select Exercise</Text>
        <View style={[styles.pickerContainer, { backgroundColor: theme.surface.secondary }]}>
          <Picker
            selectedValue={selectedExercise}
            style={[styles.picker, { color: theme.text.primary, backgroundColor: theme.surface.secondary }]}
            dropdownIconColor={theme.text.primary}
            onValueChange={(itemValue) => setSelectedExercise(itemValue)}
          >
            {exerciseTemplates.map(template => (
              <Picker.Item 
                key={template.id} 
                label={template.name} 
                value={template.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Data Type Selector */}
      <View style={[styles.dataTypeCard, { backgroundColor: theme.surface.card }]}>
        <TouchableOpacity 
          onPress={() => setSelectedData('reps')} 
          style={[
            styles.dataTypeButton, 
            selectedData === 'reps' && { backgroundColor: theme.purple }
          ]}
        >
          <Ionicons 
            name="repeat" 
            size={20} 
            color={selectedData === 'reps' ? theme.background : theme.text.secondary} 
          />
          <Text style={[
            styles.dataTypeText, 
            { color: selectedData === 'reps' ? theme.background : theme.text.secondary }
          ]}>
            Reps
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setSelectedData('weight')} 
          style={[
            styles.dataTypeButton, 
            selectedData === 'weight' && { backgroundColor: theme.purple }
          ]}
        >
          <Ionicons 
            name="barbell" 
            size={20} 
            color={selectedData === 'weight' ? theme.background : theme.text.secondary} 
          />
          <Text style={[
            styles.dataTypeText, 
            { color: selectedData === 'weight' ? theme.background : theme.text.secondary }
          ]}>
            Weight
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setSelectedData('intensity')} 
          style={[
            styles.dataTypeButton, 
            selectedData === 'intensity' && { backgroundColor: theme.purple }
          ]}
        >
          <Ionicons 
            name="flame" 
            size={20} 
            color={selectedData === 'intensity' ? theme.background : theme.text.secondary} 
          />
          <Text style={[
            styles.dataTypeText, 
            { color: selectedData === 'intensity' ? theme.background : theme.text.secondary }
          ]}>
            Intensity
          </Text>
        </TouchableOpacity>
      </View>

      {/* Statistics Summary */}
      {stats && (
        <View style={[styles.statsContainer, { backgroundColor: theme.surface.card }]}>
          <Text style={[styles.statsTitle, { color: theme.text.primary }]}>
            {getStatLabel(selectedData)} Overview
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="fitness" size={24} color={theme.purple} />
              <Text style={[styles.statValue, { color: theme.text.primary }]}>
                {stats.totalWorkouts}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
                Workouts
              </Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="analytics" size={24} color={theme.green} />
              <Text style={[styles.statValue, { color: theme.text.primary }]}>
                {stats.averageValue.toFixed(1)} {getUnit(selectedData)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
                Average
              </Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="trophy" size={24} color={theme.yellow} />
              <Text style={[styles.statValue, { color: theme.text.primary }]}>
                {stats.bestValue.toFixed(1)} {getUnit(selectedData)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
                Best
              </Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons 
                name={stats.improvement >= 0 ? "trending-up" : "trending-down"} 
                size={24} 
                color={stats.improvement >= 0 ? theme.green : theme.red} 
              />
              <Text style={[
                styles.statValue, 
                { color: stats.improvement >= 0 ? theme.green : theme.red }
              ]}>
                {stats.improvementPercent >= 0 ? '+' : ''}{stats.improvementPercent.toFixed(1)}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
                Progress
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Charts */}
      {chartData && chartData.length > 0 ? (
        <View style={styles.chartsSection}>
          {chartData.map((data, index) => (
            <View key={index} style={[styles.chartCard, { backgroundColor: theme.surface.card }]}>
              <View style={styles.chartHeader}>
                <View style={styles.chartTitleRow}>
                  <View style={[styles.setIndicator, { backgroundColor: setColors[index % setColors.length](1) }]} />
                  <Text style={[styles.chartTitle, { color: theme.text.primary }]}>
                    Set {index + 1}
                  </Text>
                </View>
                <Text style={[styles.chartUnit, { color: theme.text.secondary }]}>
                  {getUnit(selectedData)}
                </Text>
              </View>
              <LineChart
                data={data}
                width={Dimensions.get('window').width - spacing.md * 4}
                height={200}
                chartConfig={{
                  ...chartConfig,
                  propsForDots: {
                    ...chartConfig.propsForDots,
                    fill: setColors[index % setColors.length](1),
                    stroke: setColors[index % setColors.length](1),
                  }
                }}
                withInnerLines={false}
                withOuterLines={true}
                withDots
                bezier
                style={styles.chart}
              />
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.noDataCard, { backgroundColor: theme.surface.card }]}>
          <Ionicons name="bar-chart-outline" size={64} color={theme.text.secondary} />
          <Text style={[styles.noDataTitle, { color: theme.text.primary }]}>
            No Workout Data
          </Text>
          <Text style={[styles.noDataText, { color: theme.text.secondary }]}>
            Start tracking your workouts to see your progression here
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  selectorCard: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  pickerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  dataTypeCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dataTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.xs,
  },
  dataTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  chartsSection: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  chartCard: {
    borderRadius: 16,
    padding: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  setIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartUnit: {
    fontSize: 12,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: 12,
  },
  noDataCard: {
    borderRadius: 16,
    padding: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  noDataText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
