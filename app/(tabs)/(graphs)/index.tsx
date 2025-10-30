import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getWeightEntries, getNutritionSummary, addWeightEntry } from '@/services/database';
import { NutritionSummary } from '@/types/types'
import { draculaTheme, spacing, borderRadius, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

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
    backgroundGradientFrom: draculaTheme.surface.card,
    backgroundGradientTo: draculaTheme.surface.card,
    color: (opacity = 1) => `rgba(139, 233, 253, ${opacity})`,
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
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Diet Report</Text>

      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Weight History (Last 30 entries)</Text>
          <View style={styles.headerRight}>
            <Text style={styles.chartUnit}>kg</Text>
            <TouchableOpacity onPress={() => setState(prev => ({ ...prev, weightModal: { ...prev.weightModal, visible: true } }))} style={styles.addButton}>
              <Ionicons name="add" size={24} color={draculaTheme.text.inverse} />
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
          <Text style={styles.noDataText}>No weight entries yet.</Text>
        )}
      </View>

      <TouchableOpacity style={styles.navButton} onPress={() => router.push('/(tabs)/(graphs)/calorie-analysis')}>
        <Text style={styles.navButtonText}>Calorie Analysis</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => router.push('/(tabs)/(graphs)/workout-progression')}>
        <Text style={styles.navButtonText}>Workout Progression</Text>
      </TouchableOpacity>

      <Modal visible={weightModal.visible} animationType="slide" onRequestClose={() => setState(prev => ({ ...prev, weightModal: { ...prev.weightModal, visible: false } }))}>
        <View style={styles.modalContainer}>
          <Text style={styles.sectionTitle}>Add New Weight</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Weight in kg"
            placeholderTextColor={draculaTheme.comment}
            keyboardType="numeric"
            value={weightModal.newWeight}
            onChangeText={(text) => setState(prev => ({ ...prev, weightModal: { ...prev.weightModal, newWeight: text } }))}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddWeight}>
            <Text style={styles.addButtonText}>Add Weight</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: draculaTheme.red, marginTop: spacing.sm }]}
            onPress={() => setState(prev => ({ ...prev, weightModal: { ...prev.weightModal, visible: false } }))}
          >
            <Text style={styles.addButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    marginRight: spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: draculaTheme.green,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
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
  modalContainer: {
    flex: 1,
    backgroundColor: draculaTheme.background,
    padding: spacing.md,
  },
  searchInput: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
  },
  addButtonText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginLeft: spacing.sm,
  },
  navButton: {
    backgroundColor: draculaTheme.purple,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  navButtonText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});