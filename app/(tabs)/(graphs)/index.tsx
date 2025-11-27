import { useTheme } from '@/app/contexts/ThemeContext';
import { addWeightEntry, getNutritionSummary, getWeightEntries } from '@/services/database';
import { borderRadius, spacing, typography } from '@/styles/theme';
import { NutritionSummary } from '@/types/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface DietReportState {
  weightData: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  weightModal: {
    visible: boolean;
    newWeight: string;
  };
}

export default function DietReportScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [state, setState] = useState<DietReportState>({
    weightData: { labels: [], datasets: [{ data: [] }] },
    weightModal: { visible: false, newWeight: '' },
  });

  const { weightData, weightModal } = state;

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = () => {
    const weightEntries = getWeightEntries(30).reverse();
    if (weightEntries.length > 0) {
      setState(prev => ({
        ...prev,
        weightData: {
          labels: weightEntries.map(e => new Date(e.date).toLocaleDateString()),
          datasets: [{ data: weightEntries.map(e => e.weight) }],
        },
      }));
    }

    const summaries: NutritionSummary[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      summaries.push(getNutritionSummary(dateString));
    }
  };

  const handleAddWeight = () => {
    const weight = parseFloat(weightModal.newWeight);
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid positive number for weight.');
      return;
    }
    addWeightEntry({
      id: Date.now().toString(),
      weight: weight,
      date: new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
    });
    setState(prev => ({ ...prev, weightModal: { visible: false, newWeight: '' } }));
    loadReportData();
  };

  const chartConfig = {
    backgroundGradientFrom: theme.surface.card,
    backgroundGradientTo: theme.surface.card,
    color: (opacity = 1) => {
      const r = parseInt(theme.cyan.slice(1, 3), 16);
      const g = parseInt(theme.cyan.slice(3, 5), 16);
      const b = parseInt(theme.cyan.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    labelColor: (opacity = 1) => {
      const r = parseInt(theme.green.slice(1, 3), 16);
      const g = parseInt(theme.green.slice(3, 5), 16);
      const b = parseInt(theme.green.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    fillShadowGradientOpacity: 0.1,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme.surface.secondary,
    },
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.foreground }]}>Diet Report</Text>

      <View style={[styles.chartContainer, { backgroundColor: theme.surface.card }]}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: theme.foreground }]}>Weight History (Last 30 entries)</Text>
          <View style={styles.headerRight}>
            <Text style={[styles.chartUnit, { color: theme.comment }]}>kg</Text>
            <TouchableOpacity onPress={() => setState(prev => ({ ...prev, weightModal: { ...prev.weightModal, visible: true } }))} style={[styles.addButton, { backgroundColor: theme.green }]}>
              <Ionicons name="add" size={24} color={theme.text.inverse} />
            </TouchableOpacity>
          </View>
        </View>
        {weightData.labels.length > 0 ? (
          <LineChart
            data={weightData}
            width={Dimensions.get('window').width - spacing.md * 4}
            height={220}
            chartConfig={chartConfig}
            fromZero
            withDots
            bezier
          />
        ) : (
          <Text style={[styles.noDataText, { color: theme.comment }]}>No weight entries yet.</Text>
        )}
      </View>

      <TouchableOpacity style={[styles.navButton, { backgroundColor: theme.primary }]} onPress={() => router.push('/(tabs)/(graphs)/calorie-analysis')}>
        <Text style={[styles.navButtonText, { color: theme.text.inverse }]}>Calorie Analysis</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.navButton, { backgroundColor: theme.primary }]} onPress={() => router.push('/(tabs)/(graphs)/workout-progression')}>
        <Text style={[styles.navButtonText, { color: theme.text.inverse }]}>Workout Progression</Text>
      </TouchableOpacity>

      <Modal visible={weightModal.visible} animationType="slide" onRequestClose={() => setState(prev => ({ ...prev, weightModal: { ...prev.weightModal, visible: false } }))}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Add New Weight</Text>
          <TextInput
            style={[styles.searchInput, { backgroundColor: theme.surface.input, color: theme.foreground }]}
            placeholder="Weight in kg"
            placeholderTextColor={theme.comment}
            keyboardType="numeric"
            value={weightModal.newWeight}
            onChangeText={(text) => setState(prev => ({ ...prev, weightModal: { ...prev.weightModal, newWeight: text } }))}
          />
          <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.green }]} onPress={handleAddWeight}>
            <Text style={[styles.addButtonText, { color: theme.text.inverse }]}>Add Weight</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.red, marginTop: spacing.sm }]}
            onPress={() => setState(prev => ({ ...prev, weightModal: { ...prev.weightModal, visible: false } }))}
          >
            <Text style={[styles.addButtonText, { color: theme.text.inverse }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    fontSize: typography.sizes.heading,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.lg,
    textAlign: 'center',
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
    marginRight: spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  summarySection: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  noDataText: {
    textAlign: 'center',
    padding: spacing.lg,
  },
  summaryDay: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  summaryDate: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  summaryMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontSize: typography.sizes.sm,
    width: '48%',
    marginBottom: spacing.xs,
  },
  modalContainer: {
    flex: 1,
    padding: spacing.md,
  },
  searchInput: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
  },
  addButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginLeft: spacing.sm,
  },
  navButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  navButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
