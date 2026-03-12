import { useDate } from '@/app/contexts/DateContext';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useSnackbar } from '@/components/SnackbarProvider';
import { formatDateToYYYYMMDD } from '@/utils/dateHelpers';
import { getSavedMeal, logSavedMeal } from '@/services/database';
import { MealType } from '@/services/db/schema';
import { SavedMealWithItems } from '@/types/types';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LogSavedMealScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showSnackbar } = useSnackbar();
  const { selectedDate } = useDate();
  const params = useLocalSearchParams<{ savedMealId?: string; mealType?: MealType }>();
  const savedMeal = useMemo<SavedMealWithItems | null>(() => {
    if (!params.savedMealId) return null;
    return getSavedMeal(params.savedMealId);
  }, [params.savedMealId]);
  const [mealType, setMealType] = useState<MealType>(params.mealType ?? savedMeal?.defaultMealType ?? 'breakfast');
  const [quantities, setQuantities] = useState<Record<string, string>>(() => Object.fromEntries((savedMeal?.items ?? []).map((item) => [item.id, String(item.quantity)])));

  const preview = useMemo(() => {
    return (savedMeal?.items ?? []).reduce((acc, item) => {
      const food = item.food;
      if (!food || !food.servingSize) return acc;
      const quantity = Number(quantities[item.id]) || 0;
      const ratio = quantity / food.servingSize;
      acc.calories += food.calories * ratio;
      acc.protein += food.protein * ratio;
      acc.carbs += food.carbs * ratio;
      acc.fat += food.fat * ratio;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [quantities, savedMeal]);

  if (!savedMeal) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.emptyText, { color: theme.foreground }]}>Saved meal not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: theme.foreground }]}>{savedMeal.name}</Text>
        <Text style={[styles.pageSubtitle, { color: theme.comment }]}>Adjust each item before logging</Text>
      </View>

      <View style={[styles.previewCard, { backgroundColor: theme.surface.card }, shadows.md]}>
        <Text style={[styles.previewMain, { color: theme.foreground }]}>{Math.round(preview.calories)} kcal</Text>
        <Text style={[styles.previewSub, { color: theme.comment }]}>P {preview.protein.toFixed(1)}g - C {preview.carbs.toFixed(1)}g - F {preview.fat.toFixed(1)}g</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface.card }, shadows.md]}>
        <Text style={[styles.cardLabel, { color: theme.text.secondary }]}>Meal Type</Text>
        <View style={[styles.pickerWrapper, { backgroundColor: theme.surface.input }, shadows.sm]}>
          <Picker selectedValue={mealType} onValueChange={(value) => setMealType(value as MealType)}>
            {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
              <Picker.Item key={type} label={type.charAt(0).toUpperCase() + type.slice(1)} value={type} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface.card }, shadows.md]}>
        {savedMeal.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: theme.foreground }]}>{item.food?.name ?? 'Missing product'}</Text>
              <Text style={[styles.itemSub, { color: theme.comment }]}>{item.food?.servingSize}{item.food?.servingUnit} reference</Text>
            </View>
            <View style={[styles.quantityBox, { backgroundColor: theme.surface.input }, shadows.sm]}>
              <TextInput
                style={[styles.quantityInput, { color: theme.foreground }]}
                value={quantities[item.id] ?? ''}
                onChangeText={(value) => setQuantities((current) => ({ ...current, [item.id]: value }))}
                keyboardType="decimal-pad"
              />
              <Text style={[styles.unit, { color: theme.comment }]}>{item.unit}</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable
        style={[styles.saveButton, { backgroundColor: theme.success }, shadows.md]}
        onPress={() => {
          logSavedMeal({
            savedMealId: savedMeal.id,
            mealType,
            date: formatDateToYYYYMMDD(selectedDate),
            itemQuantities: Object.fromEntries(Object.entries(quantities).map(([key, value]) => [key, Number(value) || 0])),
          });
          showSnackbar('Saved meal logged.', 2500);
          router.replace('/(tabs)/(food)');
        }}
      >
        <Ionicons name="checkmark-circle-outline" size={22} color={theme.text.inverse} />
        <Text style={[styles.saveButtonText, { color: theme.text.inverse }]}>Log Saved Meal</Text>
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
  previewCard: { borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  previewMain: { fontSize: 30, fontWeight: typography.weights.bold, marginBottom: spacing.xs },
  previewSub: { fontSize: typography.sizes.md },
  card: { borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  cardLabel: { fontSize: typography.sizes.md, fontWeight: typography.weights.medium, marginBottom: spacing.sm },
  pickerWrapper: { borderRadius: borderRadius.md, overflow: 'hidden' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  itemInfo: { flex: 1 },
  itemName: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, marginBottom: 2 },
  itemSub: { fontSize: typography.sizes.sm },
  quantityBox: { width: 110, minHeight: 52, borderRadius: borderRadius.md, paddingHorizontal: spacing.sm, flexDirection: 'row', alignItems: 'center' },
  quantityInput: { flex: 1, fontSize: typography.sizes.md, textAlign: 'center' },
  unit: { fontSize: typography.sizes.xs },
  saveButton: { minHeight: 56, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm },
  saveButtonText: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
});
