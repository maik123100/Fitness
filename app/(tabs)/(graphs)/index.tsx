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
      const weights = weightEntries.map(e => e.weight);
      
      // Create labels array with only first and last dates visible
      const labels = weightEntries.map((e, index) => {
        if (index === 0 || index === weightEntries.length - 1) {
          return new Date(e.date).toLocaleDateString();
        }
        return '';
      });
      
      setState(prev => ({
        ...prev,
        weightData: {
          labels,
          datasets: [{ 
            data: weights,
          }],
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: theme.foreground }]}>Progress Tracking</Text>
              <Text style={[styles.headerSubtitle, { color: theme.comment }]}>
                Monitor your fitness journey
              </Text>
            </View>
            <View style={[styles.headerIcon, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="stats-chart" size={32} color={theme.primary} />
            </View>
          </View>

          {/* Weight Chart Card */}
          <View style={[styles.chartCard, { backgroundColor: theme.surface.card }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.iconBadge, { backgroundColor: theme.green + '20' }]}>
                  <Ionicons name="scale-outline" size={20} color={theme.green} />
                </View>
                <View>
                  <Text style={[styles.cardTitle, { color: theme.foreground }]}>Weight Progress</Text>
                  <Text style={[styles.cardSubtitle, { color: theme.comment }]}>Last 30 entries</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => setState(prev => ({ ...prev, weightModal: { ...prev.weightModal, visible: true } }))} 
                style={[styles.addWeightButton, { backgroundColor: theme.green }]}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color={theme.text.inverse} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.chartWrapper}>
              {weightData.labels.length > 0 ? (
                <LineChart
                  data={weightData}
                  width={Dimensions.get('window').width - spacing.md * 4}
                  height={220}
                  chartConfig={chartConfig}
                  fromZero={false}
                  withDots
                  bezier
                  style={styles.chart}
                  yAxisSuffix=" kg"
                  segments={4}
                  yAxisInterval={1}
                  formatYLabel={(value) => {
                    const num = parseFloat(value);
                    return num.toFixed(1);
                  }}
                  yLabelsOffset={10}
                  yAxisLabel=""
                  withVerticalLabels
                  withHorizontalLabels
                  getDotColor={(dataPoint, dataPointIndex) => theme.cyan}
                />
              ) : (
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIcon, { backgroundColor: theme.surface.secondary }]}>
                    <Ionicons name="scale-outline" size={40} color={theme.comment} />
                  </View>
                  <Text style={[styles.emptyText, { color: theme.comment }]}>No weight entries yet</Text>
                  <Text style={[styles.emptySubtext, { color: theme.comment }]}>
                    Track your weight to see progress over time
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Analysis Navigation Cards */}
          <View style={styles.navSection}>
            <Text style={[styles.sectionLabel, { color: theme.comment }]}>DETAILED ANALYSIS</Text>
            
            <TouchableOpacity 
              style={[styles.navCard, { backgroundColor: theme.surface.card }]} 
              onPress={() => router.push('/(tabs)/(graphs)/calorie-analysis')}
              activeOpacity={0.7}
            >
              <View style={[styles.navIconContainer, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="flame" size={24} color={theme.primary} />
              </View>
              <View style={styles.navContent}>
                <Text style={[styles.navTitle, { color: theme.foreground }]}>Calorie Analysis</Text>
                <Text style={[styles.navDescription, { color: theme.comment }]}>
                  Track your daily calorie intake and trends
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.comment} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.navCard, { backgroundColor: theme.surface.card }]} 
              onPress={() => router.push('/(tabs)/(graphs)/workout-progression')}
              activeOpacity={0.7}
            >
              <View style={[styles.navIconContainer, { backgroundColor: theme.cyan + '20' }]}>
                <Ionicons name="barbell" size={24} color={theme.cyan} />
              </View>
              <View style={styles.navContent}>
                <Text style={[styles.navTitle, { color: theme.foreground }]}>Workout Progression</Text>
                <Text style={[styles.navDescription, { color: theme.comment }]}>
                  Monitor your training volume and strength gains
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.comment} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Weight Entry Modal */}
      <Modal 
        visible={weightModal.visible} 
        animationType="slide" 
        transparent={true}
        onRequestClose={() => setState(prev => ({ ...prev, weightModal: { ...prev.weightModal, visible: false } }))}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface.card }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconBadge, { backgroundColor: theme.green + '20' }]}>
                <Ionicons name="scale-outline" size={24} color={theme.green} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.foreground }]}>Add Weight Entry</Text>
              <Text style={[styles.modalSubtitle, { color: theme.comment }]}>
                Record your current weight
              </Text>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.comment }]}>Weight (kg)</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.surface.input, 
                    color: theme.foreground,
                    borderColor: theme.surface.secondary,
                  }]}
                  placeholder="Enter weight"
                  placeholderTextColor={theme.comment}
                  keyboardType="numeric"
                  value={weightModal.newWeight}
                  onChangeText={(text) => setState(prev => ({ ...prev, weightModal: { ...prev.weightModal, newWeight: text } }))}
                  autoFocus
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.surface.secondary }]} 
                  onPress={() => setState(prev => ({ ...prev, weightModal: { ...prev.weightModal, visible: false, newWeight: '' } }))}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.foreground }]}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton, { backgroundColor: theme.green }]} 
                  onPress={handleAddWeight}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark" size={20} color={theme.text.inverse} />
                  <Text style={[styles.confirmButtonText, { color: theme.text.inverse }]}>Add Entry</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  content: {
    gap: spacing.lg,
  },
  // Header
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.md,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Chart Card
  chartCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  cardSubtitle: {
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  addWeightButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: borderRadius.md,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  // Navigation Section
  navSection: {
    gap: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  navIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navContent: {
    flex: 1,
    gap: spacing.xs,
  },
  navTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  navDescription: {
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: typography.sizes.sm,
  },
  modalBody: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  inputContainer: {
    gap: spacing.sm,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.lg,
    borderWidth: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  cancelButton: {
    flex: 0.8,
  },
  confirmButton: {
    flex: 1.2,
  },
  cancelButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  confirmButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
