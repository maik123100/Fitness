import { getNutritionSummary, getUserProfile } from '@/services/database';
import { borderRadius, draculaTheme, spacing, typography } from '@/styles/theme';
import { MineralFields, NutritionSummary, VitaminFields } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';

interface MacroDisplayProps {
  actual: number;
  target: number;
  unit: string;
}

const MacroDisplay: React.FC<MacroDisplayProps> = ({ actual, target, unit }) => {
  const percentage = target > 0 ? Math.min(actual / target, 1) : 0;
  const displayActual = actual.toFixed(0);
  const displayTarget = target.toFixed(0);

  return (
    <View style={styles.macroDisplayContainer}>
      <View style={styles.macroTextContainer}>
        <Text style={styles.macroLabel}>Actual:</Text>
        <Text style={styles.macroValue}>{displayActual}{unit}</Text>
      </View>
      <View style={styles.macroTextContainer}>
        <Text style={styles.macroLabel}>Target:</Text>
        <Text style={styles.macroValue}>{displayTarget}{unit}</Text>
      </View>
      <ProgressBar progress={percentage} color={draculaTheme.cyan} style={styles.progressBar} />
      <Text style={styles.macroSummary}>{(percentage * 100).toFixed(0)}% of target</Text>
    </View>
  );
};

const vitaminTargets = {
  vitaminA: { target: 900, unit: 'µg' },
  vitaminC: { target: 90, unit: 'mg' },
  vitaminD: { target: 15, unit: 'µg' },
  vitaminB6: { target: 1.3, unit: 'mg' },
  vitaminE: { target: 15, unit: 'mg' },
  vitaminK: { target: 120, unit: 'µg' },
  thiamin: { target: 1.2, unit: 'mg' },
  vitaminB12: { target: 2.4, unit: 'µg' },
  riboflavin: { target: 1.3, unit: 'mg' },
  folate: { target: 400, unit: 'µg' },
  niacin: { target: 16, unit: 'mg' },
  choline: { target: 0.55, unit: 'g' },
  pantothenicAcid: { target: 5, unit: 'mg' },
  biotin: { target: 30, unit: 'µg' },
  carotenoids: { target: 0, unit: '' },
};

const mineralTargets = {
  calcium: { target: 1000, unit: 'mg' },
  chloride: { target: 2.3, unit: 'g' },
  chromium: { target: 35, unit: 'µg' },
  copper: { target: 900, unit: 'µg' },
  fluoride: { target: 4, unit: 'mg' },
  iodine: { target: 150, unit: 'µg' },
  iron: { target: 8, unit: 'mg' },
  magnesium: { target: 400, unit: 'mg' },
  manganese: { target: 2.3, unit: 'mg' },
  molybdenum: { target: 45, unit: 'µg' },
  phosphorus: { target: 0.7, unit: 'g' },
  potassium: { target: 3400, unit: 'mg' },
  selenium: { target: 55, unit: 'µg' },
  sodium: { target: 1500, unit: 'mg' },
  zinc: { target: 11, unit: 'mg' },
};

interface MacroGraphsState {
  nutritionSummary: NutritionSummary | null;
  targetMacros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export default function MacroGraphsScreen() {
  const [state, setState] = useState<MacroGraphsState>({
    nutritionSummary: null,
    targetMacros: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
  });
  const router = useRouter();

  const { nutritionSummary, targetMacros } = state;

  useEffect(() => {
    loadMacroData();
  }, []);

  const loadMacroData = () => {
    const userProfile = getUserProfile();
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const todaySummary = getNutritionSummary(todayString);

    setState({
      nutritionSummary: todaySummary,
      targetMacros: {
        protein: userProfile?.targetProtein || 0,
        carbs: userProfile?.targetCarbs || 0,
        fat: userProfile?.targetFat || 0,
        fiber: 30, // General target for fiber
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.lg * 2 }}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={draculaTheme.foreground} />
      </TouchableOpacity>
      <Text style={styles.header}>Macro Graphs</Text>

      {['protein', 'carbs', 'fat', 'fiber'].map((macro) => (
        <View key={macro} style={styles.chartSection}>
          <Text style={styles.sectionTitle}>{macro.charAt(0).toUpperCase() + macro.slice(1)} Intake</Text>
          {nutritionSummary ? (
            <MacroDisplay
              actual={nutritionSummary[`total${macro.charAt(0).toUpperCase() + macro.slice(1)}` as keyof NutritionSummary] as number}
              target={targetMacros[macro as 'protein' | 'carbs' | 'fat' | 'fiber']}
              unit="g"
            />
          ) : (
            <Text style={styles.noDataText}>No data for {macro} intake yet.</Text>
          )}
        </View>
      ))}

      <Text style={styles.header}>Vitamins</Text>
      {nutritionSummary && nutritionSummary.totalVitamins && Object.keys(vitaminTargets).map((vitamin) => (
        <View key={vitamin} style={styles.chartSection}>
          <Text style={styles.sectionTitle}>{vitamin.charAt(0).toUpperCase() + vitamin.slice(1)} Intake</Text>
          <MacroDisplay
            actual={nutritionSummary.totalVitamins[vitamin as keyof VitaminFields] || 0}
            target={vitaminTargets[vitamin as keyof typeof vitaminTargets].target}
            unit={vitaminTargets[vitamin as keyof typeof vitaminTargets].unit}
          />
        </View>
      ))}

      <Text style={styles.header}>Minerals</Text>
      {nutritionSummary && nutritionSummary.totalMinerals && Object.keys(mineralTargets).map((mineral) => (
        <View key={mineral} style={styles.chartSection}>
          <Text style={styles.sectionTitle}>{mineral.charAt(0).toUpperCase() + mineral.slice(1)} Intake</Text>
          <MacroDisplay
            actual={nutritionSummary.totalMinerals[mineral as keyof MineralFields] || 0}
            target={mineralTargets[mineral as keyof typeof mineralTargets].target}
            unit={mineralTargets[mineral as keyof typeof mineralTargets].unit}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: draculaTheme.background,
    padding: spacing.md,
    paddingTop: spacing.lg * 2, // Add breathing room at the top
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
  macroDisplayContainer: {
    marginTop: spacing.sm,
  },
  macroTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  macroLabel: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.md,
  },
  macroValue: {
    color: draculaTheme.cyan,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  progressBar: {
    height: 10,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.sm,
  },
  macroSummary: {
    color: draculaTheme.comment,
    textAlign: 'right',
    fontSize: typography.sizes.sm,
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1, // Ensure the button is above other content
  },
});
