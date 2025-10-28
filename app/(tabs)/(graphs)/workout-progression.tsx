import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getExerciseProgression, getExerciseTemplates } from '@/services/database';
import { ExerciseTemplate } from '@/types/types';
import { draculaTheme, spacing } from '@/styles/theme';
import { Picker } from '@react-native-picker/picker';

type DataType = 'reps' | 'weight' | 'intensity';

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color: (opacity: number) => string;
    strokeWidth: number;
  }[];
}

const setColors = [
  (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
  (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
  (opacity = 1) => `rgba(255, 206, 86, ${opacity})`,
  (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
  (opacity = 1) => `rgba(153, 102, 255, ${opacity})`,
  (opacity = 1) => `rgba(255, 159, 64, ${opacity})`,
];

export default function WorkoutProgressionScreen() {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exerciseTemplates, setExerciseTemplates] = useState<ExerciseTemplate[]>([]);
  const [chartData, setChartData] = useState<ChartData[] | null>(null);
  const [selectedData, setSelectedData] = useState<DataType>('intensity');

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
        if (progressionData.length > 7) {
          return i % 5 === 0 ? new Date(d.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
        }
        return new Date(d.date).toLocaleDateString([], { month: 'short', day: 'numeric' });
      });

      const maxSets = Math.max(...progressionData.map(d => d.sets.length));
      const charts: ChartData[] = [];

      for (let i = 0; i < maxSets; i++) {
        let setData: number[] = [];
        if (dataType === 'reps') {
          setData = progressionData.map(d => d.sets[i] ? d.sets[i].reps : 0);
        } else if (dataType === 'weight') {
          setData = progressionData.map(d => d.sets[i] ? d.sets[i].weight : 0);
        } else {
          setData = progressionData.map(d => d.sets[i] ? d.sets[i].weight * d.sets[i].reps : 0);
        }

        charts.push({
          labels,
          datasets: [{
            data: setData,
            color: setColors[i % setColors.length],
            strokeWidth: 2,
          }],
        });
      }
      setChartData(charts);
    } else {
      setChartData(null);
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

  const getUnit = (dataType: DataType) => {
    if (dataType === 'reps') return 'reps';
    if (dataType === 'weight') return 'kg';
    return 'kg∙reps';
  }

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedExercise}
        style={styles.picker}
        itemStyle={styles.pickerItem}
        dropdownIconColor={draculaTheme.text.primary}
        onValueChange={(itemValue) => setSelectedExercise(itemValue)}
      >
        {exerciseTemplates.map(template => (
          <Picker.Item key={template.id} label={template.name} value={template.id} color={draculaTheme.text.primary} style={{ color: draculaTheme.text.primary, backgroundColor: draculaTheme.surface.card }} />
        ))}
      </Picker>

      <View style={styles.selectorWrapper}>
        <View style={styles.selectorContainer}>
          <TouchableOpacity onPress={() => setSelectedData('reps')} style={[styles.selector, selectedData === 'reps' && styles.selected]}>
            <Text style={styles.selectorText}>Repetitions</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedData('weight')} style={[styles.selector, selectedData === 'weight' && styles.selected]}>
            <Text style={styles.selectorText}>Weight</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedData('intensity')} style={[styles.selector, selectedData === 'intensity' && styles.selected]}>
            <Text style={styles.selectorText}>Intensity</Text>
          </TouchableOpacity>
        </View>
      </View>

      {chartData ? (
        <ScrollView>
          {chartData.map((data, index) => (
            <View key={index} style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Set {index + 1}</Text>
                <Text style={styles.chartUnit}>{getUnit(selectedData)}</Text>
              </View>
              <LineChart
                data={data}
                width={Dimensions.get('window').width - spacing.md * 2}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  fillShadowGradient: setColors[index % setColors.length](1),
                  propsForDots: {
                    ...chartConfig.propsForDots,
                    stroke: setColors[index % setColors.length](1),
                  }
                }}
                fromZero
                withDots
                bezier
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noDataText}>No data available for the selected exercise.</Text>
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
  picker: {
    height: 50,
    width: '100%',
    color: draculaTheme.foreground,
    backgroundColor: draculaTheme.surface.card,
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
  },
  pickerItem: {
    color: draculaTheme.foreground,
    backgroundColor: draculaTheme.surface.card,
  },
  selectorWrapper: {
    backgroundColor: draculaTheme.surface.card,
    borderRadius: 5,
    marginBottom: spacing.lg,
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  selector: {
    padding: spacing.sm,
    borderRadius: 5,
  },
  selected: {
    backgroundColor: draculaTheme.purple,
  },
  selectorText: {
    color: draculaTheme.foreground,
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
  noDataText: {
    color: draculaTheme.comment,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
