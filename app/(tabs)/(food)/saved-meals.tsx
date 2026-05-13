import { useTheme } from '@/app/contexts/ThemeContext';
import { useSnackbar } from '@/components/SnackbarProvider';
import { SelectionModal } from '@/components/shared/SelectionModal';
import { deleteSavedMeal, getSavedMeals } from '@/services/database';
import { SavedMealWithItems } from '@/types/types';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SavedMealsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showSnackbar } = useSnackbar();
  const params = useLocalSearchParams<{ mealType?: string }>();
  const [savedMeals, setSavedMeals] = useState<SavedMealWithItems[]>([]);
  const [deleteMealModal, setDeleteMealModal] = useState<{ visible: boolean; meal: SavedMealWithItems | null }>({
    visible: false,
    meal: null,
  });

  const loadMeals = useCallback(() => {
    setSavedMeals(getSavedMeals());
  }, []);

  useFocusEffect(useCallback(() => {
    loadMeals();
  }, [loadMeals]));

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: theme.foreground }]}>Saved Meals</Text>
        <Text style={[styles.pageSubtitle, { color: theme.comment }]}>Reusable combinations with adjustable quantities</Text>
      </View>

      <Pressable
        style={[styles.createButton, { backgroundColor: theme.primary }, shadows.md]}
        onPress={() => router.navigate({ pathname: '/(tabs)/(food)/saved-meal-builder', params: { mealType: params.mealType ?? 'breakfast' } } as any)}
      >
        <Ionicons name="add-circle-outline" size={20} color={theme.text.inverse} />
        <Text style={[styles.createButtonText, { color: theme.text.inverse }]}>Create Saved Meal</Text>
      </Pressable>

      {savedMeals.map((meal) => (
        <View key={meal.id} style={[styles.card, { backgroundColor: theme.surface.card }, shadows.sm]}>
          <Pressable
            onPress={() => router.navigate({ pathname: '/(tabs)/(food)/log-saved-meal', params: { savedMealId: meal.id, mealType: params.mealType ?? meal.defaultMealType } } as any)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderText}>
                <Text style={[styles.mealName, { color: theme.foreground }]}>{meal.name}</Text>
                <Text style={[styles.mealMeta, { color: theme.comment }]}>{meal.items.length} items - defaults to {meal.defaultMealType}</Text>
              </View>
              {meal.isFavorite ? <Ionicons name="star" size={18} color={theme.orange} /> : null}
            </View>

            {meal.items.slice(0, 3).map((item) => (
              <Text key={item.id} style={[styles.itemLine, { color: theme.comment }]}>
                {item.food?.name ?? 'Missing product'} - {Math.round(item.quantity)}{item.unit}
              </Text>
            ))}
          </Pressable>

          <View style={styles.cardActions}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: theme.surface.elevated }]}
              onPress={() => setDeleteMealModal({ visible: true, meal })}
            >
              <Ionicons name="trash-outline" size={18} color={theme.danger} />
            </Pressable>
          </View>
        </View>
      ))}

      {savedMeals.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="restaurant-outline" size={56} color={theme.comment} />
          <Text style={[styles.emptyTitle, { color: theme.foreground }]}>No saved meals yet</Text>
          <Text style={[styles.emptyText, { color: theme.comment }]}>Create reusable combinations like skyr + oats + fruit and adjust grams later.</Text>
        </View>
      ) : null}

      <SelectionModal
        visible={deleteMealModal.visible}
        title="Delete Saved Meal"
        description={deleteMealModal.meal ? `Remove ${deleteMealModal.meal.name} from your saved meals. Close the sheet to keep it.` : 'Remove this saved meal. Close the sheet to keep it.'}
        onClose={() => setDeleteMealModal({ visible: false, meal: null })}
        options={[
          {
            key: 'delete-saved-meal',
            title: 'Delete Saved Meal',
            description: 'This deletes the saved meal template and its reusable combination.',
            icon: 'trash-outline',
            accentColor: theme.danger,
            onPress: () => {
              if (!deleteMealModal.meal) {
                return;
              }

              deleteSavedMeal(deleteMealModal.meal.id);
              loadMeals();
              showSnackbar('Saved meal deleted.', 2500);
            },
          },
        ]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { paddingTop: spacing.md, marginBottom: spacing.xl },
  pageTitle: { fontSize: 36, fontWeight: typography.weights.bold, marginBottom: spacing.sm, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: typography.sizes.lg },
  createButton: { minHeight: 56, borderRadius: borderRadius.lg, marginBottom: spacing.lg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm },
  createButtonText: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
  card: { borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardHeaderText: { flex: 1, marginRight: spacing.md },
  mealName: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, marginBottom: 2 },
  mealMeta: { fontSize: typography.sizes.sm },
  itemLine: { fontSize: typography.sizes.sm, marginBottom: 4 },
  cardActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionButton: { width: 42, height: 42, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl * 2, paddingHorizontal: spacing.lg },
  emptyTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.semibold, marginTop: spacing.lg, marginBottom: spacing.sm },
  emptyText: { fontSize: typography.sizes.md, textAlign: 'center', lineHeight: 22 },
});
