import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { getNutritionSummary, NutritionSummary, getUserProfile } from '../services/database';
import { draculaTheme, spacing, borderRadius, typography } from '../styles/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface MacroDisplayProps {
  actual: number;
  target: number;
}

const MacroDisplay: React.FC<MacroDisplayProps> = ({ actual, target }) => {
  const percentage = target > 0 ? Math.min(actual / target, 1) : 0;
  const displayActual = actual.toFixed(0);
  const displayTarget = target.toFixed(0);

  return (
    <View style={styles.macroDisplayContainer}>
      <View style={styles.macroTextContainer}>
        <Text style={styles.macroLabel}>Actual:</Text>
        <Text style={styles.macroValue}>{displayActual}g</Text>
      </View>
      <View style={styles.macroTextContainer}>
        <Text style={styles.macroLabel}>Target:</Text>
        <Text style={styles.macroValue}>{displayTarget}g</Text>
      </View>
      <ProgressBar progress={percentage} color={draculaTheme.cyan} style={styles.progressBar} />
      <Text style={styles.macroSummary}>{(percentage * 100).toFixed(0)}% of target</Text>
    </View>
  );
};

interface MacroGraphsState {
  nutritionSummary: NutritionSummary | null;
  targetMacros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export default function MacroGraphsScreen() {
  const [state, setState] = useState<MacroGraphsState>({
    nutritionSummary: null,
    targetMacros: { protein: 0, carbs: 0, fat: 0 },
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
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={draculaTheme.foreground} />
      </TouchableOpacity>
      <Text style={styles.header}>Macro Graphs</Text>

      {['protein', 'carbs', 'fat'].map((macro) => (
        <View key={macro} style={styles.chartSection}>
          <Text style={styles.sectionTitle}>{macro.charAt(0).toUpperCase() + macro.slice(1)} Intake</Text>
          {nutritionSummary ? (
            <MacroDisplay
              actual={nutritionSummary[`total${macro.charAt(0).toUpperCase() + macro.slice(1)}` as keyof NutritionSummary] as number}
              target={targetMacros[macro as 'protein' | 'carbs' | 'fat']}
            />
          ) : (
            <Text style={styles.noDataText}>No data for {macro} intake yet.</Text>
          )}
        </View>
      ))}

      <Text style={styles.header}>Other Nutrients</Text>

      {['fiber', 'sugar', 'sodium'].map((nutrient) => (
        <View key={nutrient} style={styles.chartSection}>
          <Text style={styles.sectionTitle}>{nutrient.charAt(0).toUpperCase() + nutrient.slice(1)} Intake</Text>
          {nutritionSummary ? (
            <MacroDisplay
              actual={nutritionSummary[`total${nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}` as keyof NutritionSummary] as number}
              target={0} // No explicit target for these nutrients
            />
          ) : (
            <Text style={styles.noDataText}>No data for {nutrient} intake yet.</Text>
          )}
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