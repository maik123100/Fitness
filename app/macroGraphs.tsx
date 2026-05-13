import { getNutritionSummary, getUserProfile } from '@/services/database';
import { borderRadius, spacing, typography } from '@/styles/theme';
import { useTheme } from '@/app/contexts/ThemeContext';
import { MineralFields, NutritionSummary, VitaminFields } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MacroDisplayProps {
  actual: number;
  target: number;
  unit: string;
  theme: any;
  label: string;
}

const MacroDisplay: React.FC<MacroDisplayProps> = ({ actual, target, unit, theme, label }) => {
  const ratio = target > 0 ? actual / target : 0;
  const percentage = target > 0 ? Math.min(ratio, 1) : 0;
  const isOver = target > 0 && actual > target;
  const difference = Math.abs(actual - target);
  const displayActual = actual.toFixed(0);
  const displayTarget = target.toFixed(0);
  const statusText = target <= 0
    ? 'No target set'
    : isOver
      ? `${difference.toFixed(0)}${unit} over`
      : `${difference.toFixed(0)}${unit} under`;
  const statusColor = target <= 0 ? theme.comment : isOver ? theme.danger : actual === target ? theme.success : theme.warning;

  const markerLeft = target > 0 ? `${100}%` : '0%';

  return (
    <View style={styles.macroDisplayContainer}>
      <View style={styles.macroTextContainer}>
        <Text style={[styles.macroLabel, { color: theme.comment }]}>{label}</Text>
        <Text style={[styles.macroValue, { color: statusColor }]}>{displayActual}{unit}</Text>
      </View>
      <View style={styles.macroTextContainer}>
        <Text style={[styles.macroLabel, { color: theme.comment }]}>Target</Text>
        <Text style={[styles.macroValue, { color: theme.foreground }]}>{displayTarget}{unit}</Text>
      </View>
      <View style={[styles.targetTrack, { backgroundColor: theme.surface.elevated }]}> 
        <View
          style={[
            styles.targetFill,
            {
              width: `${percentage * 100}%`,
              backgroundColor: statusColor,
            },
          ]}
        />
        <View style={[styles.targetMarker, { left: markerLeft, backgroundColor: theme.foreground }]} />
      </View>
      <View style={styles.macroMetaRow}>
        <Text style={[styles.macroSummary, { color: statusColor }]}>
          {target > 0 ? `${(ratio * 100).toFixed(0)}% of target` : 'No target'}
        </Text>
        <Text style={[styles.macroSummary, { color: theme.comment }]}>{statusText}</Text>
      </View>
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
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
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
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingTop: insets.top + spacing.md,
          paddingBottom: 0,
        }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.foreground} />
          </TouchableOpacity>
          <Text style={[styles.header, { color: theme.foreground }]}>Macro Graphs</Text>
          <View style={styles.backButtonSpacer} />
        </View>
        <Text style={[styles.subheader, { color: theme.comment }]}>Compare today&apos;s intake with your targets. Green means on target, yellow means under, red means over.</Text>

        {['protein', 'carbs', 'fat', 'fiber'].map((macro) => (
          <View key={macro} style={[styles.chartSection, { backgroundColor: theme.surface.card }]}> 
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{macro.charAt(0).toUpperCase() + macro.slice(1)} Intake</Text>
            {nutritionSummary ? (
              <MacroDisplay
                actual={nutritionSummary[`total${macro.charAt(0).toUpperCase() + macro.slice(1)}` as keyof NutritionSummary] as number}
                target={targetMacros[macro as 'protein' | 'carbs' | 'fat' | 'fiber']}
                unit="g"
                label="Today"
                theme={theme}
              />
            ) : (
              <Text style={[styles.noDataText, { color: theme.comment }]}>No data for {macro} intake yet.</Text>
            )}
          </View>
        ))}

        <Text style={[styles.header, { color: theme.foreground }]}>Vitamins</Text>
        {nutritionSummary && nutritionSummary.totalVitamins && Object.keys(vitaminTargets).map((vitamin) => (
          <View key={vitamin} style={[styles.chartSection, { backgroundColor: theme.surface.card }]}> 
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{vitamin.charAt(0).toUpperCase() + vitamin.slice(1)} Intake</Text>
            <MacroDisplay
              actual={nutritionSummary.totalVitamins[vitamin as keyof VitaminFields] || 0}
              target={vitaminTargets[vitamin as keyof typeof vitaminTargets].target}
              unit={vitaminTargets[vitamin as keyof typeof vitaminTargets].unit}
              label="Today"
              theme={theme}
            />
          </View>
        ))}

        <Text style={[styles.header, { color: theme.foreground }]}>Minerals</Text>
        {nutritionSummary && nutritionSummary.totalMinerals && Object.keys(mineralTargets).map((mineral) => (
          <View key={mineral} style={[styles.chartSection, { backgroundColor: theme.surface.card }]}> 
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{mineral.charAt(0).toUpperCase() + mineral.slice(1)} Intake</Text>
            <MacroDisplay
              actual={nutritionSummary.totalMinerals[mineral as keyof MineralFields] || 0}
              target={mineralTargets[mineral as keyof typeof mineralTargets].target}
              unit={mineralTargets[mineral as keyof typeof mineralTargets].unit}
              label="Today"
              theme={theme}
            />
          </View>
        ))}
      </ScrollView>

      <View pointerEvents="none" style={[styles.topCover, { height: insets.top, backgroundColor: theme.background }]} />
      <View pointerEvents="none" style={[styles.bottomCover, { height: insets.bottom, backgroundColor: theme.background }]} />
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
  header: {
    fontSize: typography.sizes.heading,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    flex: 1,
  },
  subheader: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  chartSection: {
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
  macroDisplayContainer: {
    marginTop: spacing.sm,
  },
  macroTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  macroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  macroLabel: {
    fontSize: typography.sizes.md,
  },
  macroValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  progressBar: {
    height: 10,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.sm,
  },
  macroSummary: {
    fontSize: typography.sizes.sm,
  },
  targetTrack: {
    position: 'relative',
    height: 12,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  targetFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  targetMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
    opacity: 0.9,
  },
  backButton: {
    padding: spacing.xs,
  },
  backButtonSpacer: {
    width: 32,
    height: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  topCover: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  bottomCover: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
