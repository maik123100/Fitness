import { useSnackbar } from '@/components/SnackbarProvider';
import { useTheme } from '@/contexts/ThemeContext';
import { BarcodeScannerModal } from '@/components/food/BarcodeScannerModal';
import { DeleteFoodModal } from '@/components/food/DeleteFoodModal';
import { FoodSearchBar } from '@/components/food/FoodSearchBar';
import { FoodSearchResults } from '@/components/food/FoodSearchResults';
import { getAllFoodItems } from '@/services/db/repositories/foodRepository';
import { useFoodSearch } from '@/hooks/food/useFoodSearch';
import { useFoodBarcodeScanner } from '@/hooks/food/useFoodBarcodeScanner';
import { MealType } from '@/services/db/schema';
import type { FoodSearchResult } from '@/types/food';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

export default function FoodSearchScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showSnackbar } = useSnackbar();
  const params = useLocalSearchParams<{ mealType: MealType }>();
  const mealType = params.mealType;

  const {
    query, setQuery, state: searchState, results, isSearching,
    openFoodFactsSearchEnabled, setOpenFoodFactsSearch,
    importResult, deleteResult,
  } = useFoodSearch();
  const [deleteFoodModal, setDeleteFoodModal] = useState<{ visible: boolean; item: FoodSearchResult | null }>({
    visible: false,
    item: null,
  });
  useEffect(() => {
    if (searchState.status === 'error') {
      console.error('Food search failed:', searchState.error.cause ?? searchState.error.message);
      showSnackbar(
        searchState.error.category === 'local-database'
          ? 'Could not load your saved foods. Please try again.'
          : 'Could not search OpenFoodFacts. Check your connection and try again.',
        3500,
      );
    }
  }, [searchState, showSnackbar]);

  const handleAddFood = (result: FoodSearchResult) => {
    const foodItem = result.isPersisted ? result.food : importResult(result).food;
    if (!result.isPersisted) {
      showSnackbar('Food item added to your local database.', 2500);
    }
    router.navigate({
      pathname: '/(tabs)/(food)/food-quantity',
      params: { foodId: foodItem.id, mealType: mealType },
    });
  };

  const handleBarCodeScanned = (barcode: string) => {
    const allFoods = getAllFoodItems();
    const foundFood = allFoods.find(food => food.barcode === barcode);

    if (foundFood) {
      handleAddFood({ food: foundFood, source: 'local', isPersisted: true });
      showSnackbar('Food item found and ready to add!', 2000);
    } else {
      showSnackbar('No food item found with that barcode.', 3000);
    }
  };

  const scanner = useFoodBarcodeScanner(handleBarCodeScanned);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: theme.foreground }]}>Search Food</Text>
        <Text style={[styles.pageSubtitle, { color: theme.comment }]}>
          Find food items to add to your meal
        </Text>
      </View>

      {/* Search Bar */}
      <FoodSearchBar value={query} onChange={setQuery} onScan={scanner.open} />

      <View style={[styles.onlineSearchToggle, { backgroundColor: theme.surface.card }]}>
        <View style={styles.onlineSearchToggleText}>
          <Text style={[styles.onlineSearchTitle, { color: theme.foreground }]}>
            Search online
          </Text>
          <Text style={[styles.onlineSearchDescription, { color: theme.comment }]}>
            Include OpenFoodFacts results
          </Text>
        </View>
        <Switch
          value={openFoodFactsSearchEnabled}
          onValueChange={(enabled) => {
            setOpenFoodFactsSearch(enabled).catch((error) => {
              console.error('Failed to save food search setting:', error);
            });
          }}
          trackColor={{ false: theme.surface.secondary, true: theme.cyan }}
          thumbColor={openFoodFactsSearchEnabled ? theme.text.inverse : theme.comment}
        />
      </View>

      {/* Add New Food Button */}
      <Pressable
        style={[styles.addNewButton, { backgroundColor: theme.success }, shadows.md]}
        onPress={() => router.navigate('/(tabs)/(food)/add-food')}
        android_ripple={{ color: theme.surface.elevated }}
      >
        <Ionicons name="add-circle-outline" size={20} color={theme.text.inverse} style={styles.buttonIcon} />
        <Text style={[styles.addNewButtonText, { color: theme.text.inverse }]}>Add New Food Item</Text>
      </Pressable>

      <FoodSearchResults
        results={results}
        query={query}
        loading={isSearching}
        onSelect={handleAddFood}
        onDelete={(item) => setDeleteFoodModal({ visible: true, item })}
      />

      <BarcodeScannerModal visible={scanner.visible} onClose={scanner.close} onScan={scanner.scan} />

      <DeleteFoodModal
        visible={deleteFoodModal.visible}
        item={deleteFoodModal.item}
        onClose={() => setDeleteFoodModal({ visible: false, item: null })}
        onDelete={(item) => {
          deleteResult(item);
          setDeleteFoodModal({ visible: false, item: null });
          showSnackbar('Food item deleted.', 3000);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.lg },
  pageTitle: { fontSize: 36, fontWeight: typography.weights.bold, marginBottom: spacing.sm, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.regular },
  onlineSearchToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: spacing.lg, marginBottom: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  onlineSearchToggleText: { flex: 1, paddingRight: spacing.md },
  onlineSearchTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold },
  onlineSearchDescription: { fontSize: typography.sizes.sm, marginTop: spacing.xs },
  addNewButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: spacing.lg, marginBottom: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: borderRadius.lg, minHeight: 56 },
  buttonIcon: { marginRight: spacing.sm },
  addNewButtonText: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
});
