import { useDate } from '@/app/contexts/DateContext';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useSnackbar } from '@/components/SnackbarProvider';
import { MealTypePicker } from '@/components/food/MealTypePicker';
import { formatDateToYYYYMMDD } from '@/utils/dateHelpers';
import { logDirectMeal } from '@/services/database';
import { MealType } from '@/services/db/schema';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function AddDirectMealScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showSnackbar } = useSnackbar();
  const params = useLocalSearchParams<{ mealType?: MealType }>();
  const { selectedDate } = useDate();

  const [title, setTitle] = useState('');
  const [mealType, setMealType] = useState<MealType>(params.mealType ?? 'lunch');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('0');

  const preview = useMemo(() => ({
    calories: Number(calories) || 0,
    protein: Number(protein) || 0,
    carbs: Number(carbs) || 0,
    fat: Number(fat) || 0,
  }), [calories, protein, carbs, fat]);

  const handleSave = () => {
    if (!title.trim()) {
      showSnackbar('Please add a meal name.', 2500);
      return;
    }

    if (preview.calories <= 0) {
      showSnackbar('Calories must be greater than 0.', 2500);
      return;
    }

    logDirectMeal({
      title: title.trim(),
      mealType,
      date: formatDateToYYYYMMDD(selectedDate),
      nutrients: {
        calories: preview.calories,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        fiber: Number(fiber) || 0,
      },
    });

    showSnackbar('Direct meal logged.', 2500);
    router.replace('/(tabs)/(food)');
  };

  const renderNumberInput = (label: string, value: string, setValue: (value: string) => void, unit: string) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: theme.text.secondary }]}>{label}</Text>
      <View style={[styles.input, { backgroundColor: theme.surface.input }, shadows.sm]}>
        <TextInput
          style={[styles.textInput, { color: theme.foreground }]}
          value={value}
          onChangeText={setValue}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={theme.comment}
        />
        <Text style={[styles.unit, { color: theme.comment }]}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: theme.foreground }]}>Direct Meal</Text>
        <Text style={[styles.pageSubtitle, { color: theme.comment }]}>Log one-off canteen or AI meals by total nutrients</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface.card }, shadows.md]}>
        <Text style={[styles.cardTitle, { color: theme.foreground }]}>Meal Details</Text>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text.secondary }]}>Meal Name</Text>
          <View style={[styles.input, { backgroundColor: theme.surface.input }, shadows.sm]}>
            <TextInput
              style={[styles.textInput, { color: theme.foreground }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Canteen pasta bowl"
              placeholderTextColor={theme.comment}
            />
          </View>
        </View>
        <MealTypePicker value={mealType} onChange={setMealType} />
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface.card }, shadows.md]}>
        <Text style={[styles.cardTitle, { color: theme.foreground }]}>Total Nutrients</Text>
        {renderNumberInput('Calories', calories, setCalories, 'kcal')}
        {renderNumberInput('Protein', protein, setProtein, 'g')}
        {renderNumberInput('Carbs', carbs, setCarbs, 'g')}
        {renderNumberInput('Fat', fat, setFat, 'g')}
        {renderNumberInput('Fiber', fiber, setFiber, 'g')}
      </View>

      <View style={[styles.previewCard, { backgroundColor: theme.surface.card }, shadows.sm]}>
        <View style={styles.previewHeader}>
          <Ionicons name="sparkles-outline" size={20} color={theme.primary} />
          <Text style={[styles.previewTitle, { color: theme.foreground }]}>Preview</Text>
        </View>
        <Text style={[styles.previewMain, { color: theme.foreground }]}>{Math.round(preview.calories)} kcal</Text>
        <Text style={[styles.previewSub, { color: theme.comment }]}>P {preview.protein.toFixed(1)}g - C {preview.carbs.toFixed(1)}g - F {preview.fat.toFixed(1)}g</Text>
      </View>

      <Pressable style={[styles.saveButton, { backgroundColor: theme.success }, shadows.md]} onPress={handleSave}>
        <Ionicons name="checkmark-circle-outline" size={22} color={theme.text.inverse} />
        <Text style={[styles.saveButtonText, { color: theme.text.inverse }]}>Log Direct Meal</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { paddingTop: spacing.md, marginBottom: spacing.xl },
  pageTitle: { fontSize: 36, fontWeight: typography.weights.bold, marginBottom: spacing.sm, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: typography.sizes.lg },
  card: { borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  cardTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, marginBottom: spacing.lg },
  inputGroup: { marginBottom: spacing.lg },
  label: { fontSize: typography.sizes.md, fontWeight: typography.weights.medium, marginBottom: spacing.sm },
  input: { minHeight: 52, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center' },
  textInput: { flex: 1, fontSize: typography.sizes.md },
  unit: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  previewCard: { borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  previewTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  previewMain: { fontSize: 28, fontWeight: typography.weights.bold, marginBottom: spacing.xs },
  previewSub: { fontSize: typography.sizes.md },
  saveButton: { minHeight: 56, borderRadius: borderRadius.lg, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg },
  saveButtonText: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
});
