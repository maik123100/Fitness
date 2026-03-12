import { useTheme } from '@/app/contexts/ThemeContext';
import { useSnackbar } from '@/components/SnackbarProvider';
import { createSavedMeal, getAllFoodItems } from '@/services/database';
import { FoodItem, MealType } from '@/services/db/schema';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type DraftItem = {
  foodId: string;
  quantity: string;
};

export default function SavedMealBuilderScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showSnackbar } = useSnackbar();
  const params = useLocalSearchParams<{ mealType?: MealType }>();
  const foods = useMemo(() => getAllFoodItems(), []);

  const [name, setName] = useState('');
  const [mealType, setMealType] = useState<MealType>(params.mealType ?? 'breakfast');
  const [items, setItems] = useState<DraftItem[]>([{ foodId: foods[0]?.id ?? '', quantity: '100' }]);

  const addItem = () => {
    if (foods.length === 0) return;
    setItems((current) => [...current, { foodId: foods[0].id, quantity: '100' }]);
  };

  const updateItem = (index: number, next: Partial<DraftItem>) => {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...next } : item));
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSave = () => {
    if (foods.length === 0) {
      showSnackbar('Create a product first before building saved meals.', 2500);
      return;
    }

    if (!name.trim()) {
      showSnackbar('Please name the saved meal.', 2500);
      return;
    }

    const validItems = items
      .map((item) => ({ ...item, quantity: Number(item.quantity) }))
      .filter((item) => item.foodId && item.quantity > 0);

    if (validItems.length === 0) {
      showSnackbar('Add at least one product with quantity.', 2500);
      return;
    }

    createSavedMeal({
      name: name.trim(),
      defaultMealType: mealType,
      items: validItems.map((item) => ({ foodId: item.foodId, quantity: item.quantity })),
    });

    showSnackbar('Saved meal created.', 2500);
    router.replace('/(tabs)/(food)/saved-meals' as any);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: theme.foreground }]}>Build Saved Meal</Text>
        <Text style={[styles.pageSubtitle, { color: theme.comment }]}>Compose reusable meals from products</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface.card }, shadows.md]}>
        <Text style={[styles.cardTitle, { color: theme.foreground }]}>Meal Setup</Text>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text.secondary }]}>Name</Text>
          <View style={[styles.input, { backgroundColor: theme.surface.input }, shadows.sm]}>
            <TextInput
              style={[styles.textInput, { color: theme.foreground }]}
              value={name}
              onChangeText={setName}
              placeholder="Skyr bowl"
              placeholderTextColor={theme.comment}
            />
          </View>
        </View>

        <Text style={[styles.label, { color: theme.text.secondary }]}>Default Meal Type</Text>
        <View style={[styles.pickerWrapper, { backgroundColor: theme.surface.input }, shadows.sm]}>
          <Picker selectedValue={mealType} onValueChange={(value) => setMealType(value as MealType)}>
            {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
              <Picker.Item key={type} label={type.charAt(0).toUpperCase() + type.slice(1)} value={type} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface.card }, shadows.md]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.cardTitle, { color: theme.foreground }]}>Items</Text>
          <Pressable style={[styles.miniButton, { backgroundColor: theme.primary }]} onPress={addItem}>
            <Ionicons name="add" size={18} color={theme.text.inverse} />
          </Pressable>
        </View>

        {foods.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.comment }]}>No products available yet. Add products first, then build saved meals from them.</Text>
        ) : items.map((item, index) => {
          const food = foods.find((entry) => entry.id === item.foodId);
          return (
            <View key={`${item.foodId}-${index}`} style={styles.itemRow}>
              <View style={[styles.itemPicker, { backgroundColor: theme.surface.input }, shadows.sm]}>
                <Picker selectedValue={item.foodId} onValueChange={(value) => updateItem(index, { foodId: value as string })}>
                  {foods.map((entry: FoodItem) => (
                    <Picker.Item key={entry.id} label={entry.name} value={entry.id} />
                  ))}
                </Picker>
              </View>
              <View style={[styles.quantityBox, { backgroundColor: theme.surface.input }, shadows.sm]}>
                <TextInput
                  style={[styles.quantityInput, { color: theme.foreground }]}
                  value={item.quantity}
                  onChangeText={(value) => updateItem(index, { quantity: value })}
                  keyboardType="decimal-pad"
                />
                <Text style={[styles.unit, { color: theme.comment }]}>{food?.servingUnit ?? 'g'}</Text>
              </View>
              <Pressable style={[styles.removeButton, { backgroundColor: theme.surface.elevated }]} onPress={() => removeItem(index)}>
                <Ionicons name="trash-outline" size={18} color={theme.danger} />
              </Pressable>
            </View>
          );
        })}
      </View>

      <Pressable style={[styles.saveButton, { backgroundColor: theme.success }, shadows.md]} onPress={handleSave}>
        <Ionicons name="checkmark-circle-outline" size={22} color={theme.text.inverse} />
        <Text style={[styles.saveButtonText, { color: theme.text.inverse }]}>Save Meal Template</Text>
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
  cardTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  inputGroup: { marginBottom: spacing.lg },
  label: { fontSize: typography.sizes.md, fontWeight: typography.weights.medium, marginBottom: spacing.sm },
  input: { minHeight: 52, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, justifyContent: 'center' },
  textInput: { fontSize: typography.sizes.md },
  pickerWrapper: { borderRadius: borderRadius.md, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  miniButton: { width: 34, height: 34, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  itemPicker: { flex: 1, borderRadius: borderRadius.md, overflow: 'hidden' },
  quantityBox: { width: 96, minHeight: 52, borderRadius: borderRadius.md, paddingHorizontal: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quantityInput: { flex: 1, fontSize: typography.sizes.md, textAlign: 'center' },
  unit: { fontSize: typography.sizes.xs, marginLeft: spacing.xs },
  removeButton: { width: 42, height: 42, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  saveButton: { minHeight: 56, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm },
  saveButtonText: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  emptyText: { fontSize: typography.sizes.md, lineHeight: 22 },
});
