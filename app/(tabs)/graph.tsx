
import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getWeightEntries, getNutritionSummary, NutritionSummary, addWeightEntry } from '../../services/database';
import { draculaTheme, spacing, borderRadius, typography } from '../../styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function DietReportScreen() {
  const [weightData, setWeightData] = useState<{ labels: string[]; datasets: { data: number[] }[] }>({ labels: [], datasets: [{ data: [] }] });
  const [nutritionData, setNutritionData] = useState<NutritionSummary[]>([]);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [newWeightInput, setNewWeightInput] = useState('');

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

  const handleAddWeight = () => {
    const weight = parseFloat(newWeightInput);
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
    setWeightModalVisible(false);
    setNewWeightInput('');
    loadReportData();
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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weight History (Last 30 entries)</Text>
          <TouchableOpacity onPress={() => setWeightModalVisible(true)} style={styles.addButton}>
            <Ionicons name="add" size={24} color={draculaTheme.text.inverse} />
          </TouchableOpacity>
        </View>
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

      <Modal visible={weightModalVisible} animationType="slide" onRequestClose={() => setWeightModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.sectionTitle}>Add New Weight</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Weight in kg"
            placeholderTextColor={draculaTheme.comment}
            keyboardType="numeric"
            value={newWeightInput}
            onChangeText={setNewWeightInput}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddWeight}>
            <Text style={styles.addButtonText}>Add Weight</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: draculaTheme.red, marginTop: spacing.sm }]}
            onPress={() => setWeightModalVisible(false)}
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
  chartSection: {
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
});
