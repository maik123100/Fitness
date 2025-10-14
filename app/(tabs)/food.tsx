import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, Alert, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { draculaTheme, spacing, borderRadius, typography } from '@/styles/theme';
import { CameraView, Camera } from 'expo-camera';
import { useSnackbar } from '@/app/components/SnackbarProvider';
import {
  addFoodEntry,
  getFoodEntriesForDate,
  deleteFoodEntry,
  getFoodItem,
  getAllFoodItems,
  addFoodItem,
  deleteFoodItem
} from '@/services/database'
import {
  FoodItem,
  FoodEntry,
  MealType,
  FoodCategory
} from '@/types/types';

type FoodDiaryState = {
  date: string;
  foodEntries: Record<MealType, FoodEntry[]>;
  searchModal: {
    visible: boolean;
    query: string;
    results: FoodItem[];
    selectedMealType: MealType;
    debounceTimeout: number | null;
  };
  quantityModal: {
    visible: boolean;
    selectedFoodItem: FoodItem | null;
    quantity: string;
  };
};


const initialNewFoodState: FoodItem = {
  id: '',
  name: '',
  brand: '',
  category: 'other',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
  cholesterol: 0,
  saturatedFat: 0,
  transFat: 0,
  vitaminA: 0,
  vitaminC: 0,
  vitaminD: 0,
  calcium: 0,
  iron: 0,
  potassium: 0,
  servingSize: 100,
  servingUnit: 'g',
  isVerified: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export default function FoodDiaryScreen() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar(); // Get showSnackbar from context
  const [state, setState] = useState<FoodDiaryState>({
    date: new Date().toISOString().split('T')[0],
    foodEntries: { breakfast: [], lunch: [], dinner: [], snack: [] },
    searchModal: {
      visible: false,
      query: '',
      results: [],
      selectedMealType: 'breakfast',
      debounceTimeout: null,
    },
    quantityModal: {
      visible: false,
      selectedFoodItem: null,
      quantity: '100',
    },
    // ...existing code...
  });

  const { date, foodEntries, searchModal, quantityModal } = state;

  const foodCategories: FoodCategory[] = [
    'vegetables',
    'fruits',
    'grains',
    'proteins',
    'dairy',
    'fats',
    'beverages',
    'snacks',
    'prepared',
    'supplements',
    'condiments',
    'other',
  ];

  useEffect(() => {
    loadFoodEntries();
  }, [date]);

  const loadFoodEntries = () => {
    const entries = getFoodEntriesForDate(date);
    const groupedEntries: Record<MealType, FoodEntry[]> = { breakfast: [], lunch: [], dinner: [], snack: [] };
    entries.forEach(entry => {
      groupedEntries[entry.mealType].push(entry);
    });
    setState(prev => ({ ...prev, foodEntries: groupedEntries }));
  };

  const addFoodEntryToDatabase = (foodItem: FoodItem, quantity: number) => {
    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      foodId: foodItem.id,
      date,
      mealType: searchModal.selectedMealType,
      quantity: quantity,
      unit: 'g',
      totalCalories: (foodItem.calories / foodItem.servingSize) * quantity,
      totalProtein: (foodItem.protein / foodItem.servingSize) * quantity,
      totalCarbs: (foodItem.carbs / foodItem.servingSize) * quantity,
      totalFat: (foodItem.fat / foodItem.servingSize) * quantity,
      totalFiber: (foodItem.fiber / foodItem.servingSize) * quantity,
      totalSugar: (foodItem.sugar / foodItem.servingSize) * quantity,
      totalSodium: (foodItem.sodium / foodItem.servingSize) * quantity,
      createdAt: Date.now(),
    };
    addFoodEntry(newEntry);
    setState(prev => ({
      ...prev,
      searchModal: { ...prev.searchModal, visible: false },
      quantityModal: { ...prev.quantityModal, visible: false },
    }));
    loadFoodEntries();
    showSnackbar('Food logged successfully!', 3000); // Success snackbar
  };

  const handleAddFood = (foodItem: FoodItem) => {
    setState(prev => ({
      ...prev,
      quantityModal: {
        ...prev.quantityModal,
        visible: true,
        selectedFoodItem: foodItem,
        quantity: '100',
      },
    }));
  };

  // ...existing code...

  const handleDeleteFood = (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this food entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        deleteFoodEntry(id);
        loadFoodEntries();
        showSnackbar('Food entry deleted.', 3000); // Success snackbar
      }},
    ]);
  };

  const openSearchModal = (mealType: MealType) => {
    const allFoods = getAllFoodItems().sort((a, b) => a.name.localeCompare(b.name));
    setState(prev => ({
      ...prev,
      searchModal: {
        ...prev.searchModal,
        visible: true,
        selectedMealType: mealType,
        query: '',
        results: allFoods,
      },
    }));
  };

  const handleSearchQueryChange = (text: string) => {
    if (searchModal.debounceTimeout) {
      clearTimeout(searchModal.debounceTimeout);
    }
    const newTimeout = setTimeout(() => {
      const allFoods = getAllFoodItems();
      if (text.length > 0) {
        const filteredResults = allFoods.filter(food =>
          food.name.toLowerCase().includes(text.toLowerCase())
        ).sort((a, b) => a.name.localeCompare(b.name));
        setState(prev => ({ ...prev, searchModal: { ...prev.searchModal, results: filteredResults } }));
      } else {
        setState(prev => ({ ...prev, searchModal: { ...prev.searchModal, results: allFoods.sort((a, b) => a.name.localeCompare(b.name)) } }));
      }
    }, 500);

    setState(prev => ({
      ...prev,
      searchModal: { ...prev.searchModal, query: text, debounceTimeout: newTimeout },
    }));
  };

  // Removed handleNewFoodChange, now handled in /add-food page

  return (
    <View style={styles.container}>
      {Object.keys(foodEntries).map((mealType) => (
        <View key={mealType} style={styles.mealSection}>
          <Text style={styles.mealTitle}>{(mealType as string).charAt(0).toUpperCase() + (mealType as string).slice(1)}</Text>
          {foodEntries[mealType as MealType].map((item) => (
            <TouchableOpacity key={item.id} onLongPress={() => handleDeleteFood(item.id)}>
              <View style={styles.foodItem}>
                <Text style={styles.foodName}>{getFoodItem(item.foodId)?.name}</Text>
                <View style={styles.foodNutrients}>
                  <Text style={styles.foodCalories}>{item.totalCalories.toFixed(0)} kcal</Text>
                  <Text style={styles.foodMacro}>P: {item.totalProtein.toFixed(1)}g</Text>
                  <Text style={styles.foodMacro}>C: {item.totalCarbs.toFixed(1)}g</Text>
                  <Text style={styles.foodMacro}>F: {item.totalFat.toFixed(1)}g</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={() => openSearchModal(mealType as MealType)}>
            <Ionicons name="add" size={24} color={draculaTheme.text.inverse} />
            <Text style={styles.addButtonText}>Add Food</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Modal visible={searchModal.visible} animationType="slide" onRequestClose={() => setState(prev => ({ ...prev, searchModal: { ...prev.searchModal, visible: false } }))}>
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food..."
            placeholderTextColor={draculaTheme.comment}
            value={searchModal.query}
            onChangeText={handleSearchQueryChange}
          />
          <TouchableOpacity style={styles.addNewFoodButton} onPress={() => {
            setState(prev => ({ ...prev, searchModal: { ...prev.searchModal, visible: false } }));
            router.push('/add-food');
          }}>
            <Text style={styles.addNewFoodButtonText}>Add New Food</Text>
          </TouchableOpacity>
          <FlatList
            data={searchModal.results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.searchResultItemRow}>
                <TouchableOpacity style={styles.searchResultItem} onPress={() => handleAddFood(item)}>
                  <Text style={styles.searchResultName}>{item.name}</Text>
                  <Text style={styles.searchResultDetails}>
                    {item.calories} kcal | P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                    per {item.servingSize}{item.servingUnit}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.trashIconBtn}
                  onPress={() => {
                    Alert.alert(
                      'Delete Food Item',
                      `Are you sure you want to delete "${item.name}" from your food list? This cannot be undone.`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => {
                            deleteFoodEntry(item.id); // Remove from entries
                            deleteFoodItem(item); // Call mock function with FoodItem
                            const allFoods = getAllFoodItems().sort((a, b) => a.name.localeCompare(b.name));
                            setState(prev => ({
                              ...prev,
                              searchModal: { ...prev.searchModal, results: allFoods },
                            }));
                            showSnackbar('Food item deleted.', 3000);
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash" size={24} color={draculaTheme.red} />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </Modal>

      <Modal visible={quantityModal.visible} animationType="slide" onRequestClose={() => setState(prev => ({ ...prev, quantityModal: { ...prev.quantityModal, visible: false } }))}>
        <View style={styles.modalContainer}>
          <Text style={styles.mealTitle}>Enter Quantity for {quantityModal.selectedFoodItem?.name}</Text>

          <View style={styles.quickQuantityButtonsContainer}>
            {[50, 100, 150, 200, 250].map((q) => (
              <TouchableOpacity
                key={q}
                style={styles.quickQuantityButton}
                onPress={() => setState(prev => ({ ...prev, quantityModal: { ...prev.quantityModal, quantity: String(q) } }))}
              >
                <Text style={styles.quickQuantityButtonText}>{q} {quantityModal.selectedFoodItem?.servingUnit || 'g'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder={`Quantity in ${quantityModal.selectedFoodItem?.servingUnit || 'g'}`}
            placeholderTextColor={draculaTheme.comment}
            keyboardType="numeric"
            value={quantityModal.quantity}
            onChangeText={(text) => setState(prev => ({ ...prev, quantityModal: { ...prev.quantityModal, quantity: text } }))}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              if (quantityModal.selectedFoodItem && quantityModal.quantity) {
                addFoodEntryToDatabase(quantityModal.selectedFoodItem, parseFloat(quantityModal.quantity));
              } else {
                showSnackbar('Please enter a valid quantity.', 3000); // Error snackbar
              }
            }}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: draculaTheme.red, marginTop: spacing.sm }]}
            onPress={() => setState(prev => ({ ...prev, quantityModal: { ...prev.quantityModal, visible: false } }))}
          >
            <Text style={styles.addButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: draculaTheme.background,
    padding: spacing.md,
  },
  mealSection: {
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  mealTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
    marginBottom: spacing.md,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: draculaTheme.surface.secondary,
  },
  foodName: {
    fontSize: typography.sizes.md,
    color: draculaTheme.foreground,
  },
  foodCalories: {
    fontSize: typography.sizes.md,
    color: draculaTheme.nutrition.calories,
    fontWeight: typography.weights.semibold,
  },
  foodNutrients: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodMacro: {
    fontSize: typography.sizes.sm,
    color: draculaTheme.comment,
    marginLeft: spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: draculaTheme.green,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  addButtonText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginLeft: spacing.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: draculaTheme.background,
    padding: spacing.md,
  },
  searchInput: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
  },
  searchResultItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  searchResultItem: {
    flex: 1,
    backgroundColor: draculaTheme.surface.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  trashIconBtn: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: draculaTheme.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
  },
  searchResultDetails: {
    fontSize: typography.sizes.sm,
    color: draculaTheme.comment,
    marginTop: spacing.xs,
  },
  addNewFoodButton: {
    backgroundColor: draculaTheme.purple,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addNewFoodButtonText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  label: {
    fontSize: typography.sizes.md,
    color: draculaTheme.foreground,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  picker: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  scrollViewContent: {
    paddingBottom: spacing.lg * 2,
  },
  quickQuantityButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  quickQuantityButton: {
    backgroundColor: draculaTheme.surface.secondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    margin: spacing.xs,
  },
  quickQuantityButtonText: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.md,
  },
});
