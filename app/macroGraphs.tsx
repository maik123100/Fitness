import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { getNutritionSummary, NutritionSummary, getUserProfile } from '../services/database';
import { draculaTheme, spacing, borderRadius, typography } from '../styles/theme';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface MacroDisplayProps {
  macroType: 'protein' | 'carbs' | 'fat' | 'fiber' | 'sugar' | 'sodium';
  actual: number;
  target: number;
}

const MacroDisplay: React.FC<MacroDisplayProps> = ({ macroType, actual, target }) => {
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

export default function MacroGraphsScreen() {
  const [nutritionData, setNutritionData] = useState<NutritionSummary[]>([]);
  const [targetMacros, setTargetMacros] = useState({ protein: 0, carbs: 0, fat: 0 });
  const router = useRouter();

  useEffect(() => {
    loadMacroData();
  }, []);

  const loadMacroData = () => {
    const userProfile = getUserProfile();
    if (userProfile) {
      setTargetMacros({
        protein: userProfile.targetProtein,
        carbs: userProfile.targetCarbs,
        fat: userProfile.targetFat,
      });
    }

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const todaySummary = getNutritionSummary(todayString);
    setNutritionData(todaySummary ? [todaySummary] : []);
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
          {nutritionData.length > 0 ? (
            <MacroDisplay
              macroType={macro as 'protein' | 'carbs' | 'fat'}
              actual={nutritionData[0][`total${macro.charAt(0).toUpperCase() + macro.slice(1)}` as keyof NutritionSummary] as number}
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
          {nutritionData.length > 0 ? (
            <MacroDisplay
              macroType={nutrient as 'fiber' | 'sugar' | 'sodium'}
              actual={nutritionData[0][`total${nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}` as keyof NutritionSummary] as number}
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
