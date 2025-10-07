import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, Alert, ScrollView } from 'react-native';
import { addFoodEntry, getFoodEntriesForDate, deleteFoodEntry, FoodItem, FoodEntry, MealType, getFoodItem, getAllFoodItems, addFoodItem, FoodCategory } from '../../services/database';
import { draculaTheme, spacing, borderRadius, typography } from '../../styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { useSnackbar } from '../../app/components/SnackbarProvider'; // Import useSnackbar

interface NewFoodItem {
  name: string;
  brand: string;
  category: FoodCategory;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar: string;
  sodium: string;
  servingSize: string;
  servingUnit: string;
}

interface FoodDiaryState {
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
  addFoodModal: {
    visible: boolean;
    newFood: NewFoodItem;
  };
}

const initialNewFoodState: NewFoodItem = {
  name: '',
  brand: '',
  category: 'other',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  fiber: '',
  sugar: '',
  sodium: '',
  servingSize: '100',
  servingUnit: 'g',
};

export default function FoodDiaryScreen() {
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
    addFoodModal: {
      visible: false,
      newFood: { ...initialNewFoodState },
    },
  });

  const { date, foodEntries, searchModal, quantityModal, addFoodModal } = state;

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

  const handleAddNewFood = () => {
    const { newFood } = addFoodModal;
    if (!newFood.name || !newFood.calories || !newFood.protein || !newFood.carbs || !newFood.fat || !newFood.servingSize) {
      showSnackbar('Please fill in all required fields (Name, Calories, Protein, Carbs, Fat, Serving Size).', 3000); // Error snackbar
      return;
    }

    const foodToAdd: FoodItem = {
      id: Date.now().toString(),
      name: newFood.name,
      brand: newFood.brand || undefined,
      category: newFood.category,
      calories: parseFloat(newFood.calories),
      protein: parseFloat(newFood.protein),
      carbs: parseFloat(newFood.carbs),
      fat: parseFloat(newFood.fat),
      fiber: parseFloat(newFood.fiber || '0'),
      sugar: parseFloat(newFood.sugar || '0'),
      sodium: parseFloat(newFood.sodium || '0'),
      cholesterol: 0,
      saturatedFat: 0,
      transFat: 0,
      vitaminA: 0,
      vitaminC: 0,
      vitaminD: 0,
      calcium: 0,
      iron: 0,
      potassium: 0,
      servingSize: parseFloat(newFood.servingSize),
      servingUnit: newFood.servingUnit,
      isVerified: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    addFoodItem(foodToAdd);
    const allFoods = getAllFoodItems().sort((a, b) => a.name.localeCompare(b.name));
    setState(prev => ({
      ...prev,
      addFoodModal: { ...prev.addFoodModal, visible: false, newFood: { ...initialNewFoodState } },
      searchModal: { ...prev.searchModal, results: allFoods },
    }));
    showSnackbar('New food item added successfully!', 3000); // Success snackbar
  };

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

  const handleNewFoodChange = (field: keyof NewFoodItem, value: string | FoodCategory) => {
    setState(prev => ({
      ...prev,
      addFoodModal: {
        ...prev.addFoodModal,
        newFood: { ...prev.addFoodModal.newFood, [field]: value },
      },
    }));
  };

  return (
    <View style={styles.container}>
      {Object.keys(foodEntries).map((mealType) => (
        <View key={mealType} style={styles.mealSection}>
          <Text style={styles.mealTitle}>{(mealType as string).charAt(0).toUpperCase() + (mealType as string).slice(1)}</Text>
          {foodEntries[mealType as MealType].map((item) => (
            <TouchableOpacity key={item.id} onLongPress={() => handleDeleteFood(item.id)}>
              <View style={styles.foodItem}>
                <Text style={styles.foodName}>{getFoodItem(item.foodId)?.name}</Text>
                <Text style={styles.foodCalories}>{item.totalCalories} kcal</Text>
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
          <TouchableOpacity style={styles.addNewFoodButton} onPress={() => setState(prev => ({ ...prev, addFoodModal: { ...prev.addFoodModal, visible: true } }))}>
            <Text style={styles.addNewFoodButtonText}>Add New Food</Text>
          </TouchableOpacity>
          <FlatList
            data={searchModal.results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.searchResultItem} onPress={() => handleAddFood(item)}>
                <Text style={styles.searchResultName}>{item.name}</Text>
                <Text style={styles.searchResultDetails}>{item.calories} kcal per {item.servingSize}{item.servingUnit}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      <Modal visible={quantityModal.visible} animationType="slide" onRequestClose={() => setState(prev => ({ ...prev, quantityModal: { ...prev.quantityModal, visible: false } }))}>
        <View style={styles.modalContainer}>
          <Text style={styles.mealTitle}>Enter Quantity for {quantityModal.selectedFoodItem?.name}</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Quantity in grams"
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

      <Modal visible={addFoodModal.visible} animationType="slide" onRequestClose={() => setState(prev => ({ ...prev, addFoodModal: { ...prev.addFoodModal, visible: false } }))}>
        <ScrollView style={styles.modalContainer} contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.mealTitle}>Add New Food Item</Text>

          <TextInput style={styles.searchInput} placeholder="Food Name" placeholderTextColor={draculaTheme.comment} value={addFoodModal.newFood.name} onChangeText={(text) => handleNewFoodChange('name', text)} />
          <TextInput style={styles.searchInput} placeholder="Brand (Optional)" placeholderTextColor={draculaTheme.comment} value={addFoodModal.newFood.brand} onChangeText={(text) => handleNewFoodChange('brand', text)} />
          <Text style={styles.label}>Category:</Text>
          <Picker selectedValue={addFoodModal.newFood.category} style={styles.picker} onValueChange={(itemValue) => handleNewFoodChange('category', itemValue as FoodCategory)}>
            {foodCategories.map((category) => (
              <Picker.Item key={category} label={category} value={category} />
            ))}
          </Picker>
          <TextInput style={styles.searchInput} placeholder="Calories (per 100g)" placeholderTextColor={draculaTheme.comment} keyboardType="numeric" value={addFoodModal.newFood.calories} onChangeText={(text) => handleNewFoodChange('calories', text)} />
          <TextInput style={styles.searchInput} placeholder="Protein (per 100g)" placeholderTextColor={draculaTheme.comment} keyboardType="numeric" value={addFoodModal.newFood.protein} onChangeText={(text) => handleNewFoodChange('protein', text)} />
          <TextInput style={styles.searchInput} placeholder="Carbs (per 100g)" placeholderTextColor={draculaTheme.comment} keyboardType="numeric" value={addFoodModal.newFood.carbs} onChangeText={(text) => handleNewFoodChange('carbs', text)} />
          <TextInput style={styles.searchInput} placeholder="Fat (per 100g)" placeholderTextColor={draculaTheme.comment} keyboardType="numeric" value={addFoodModal.newFood.fat} onChangeText={(text) => handleNewFoodChange('fat', text)} />
          <TextInput style={styles.searchInput} placeholder="Fiber (per 100g, Optional)" placeholderTextColor={draculaTheme.comment} keyboardType="numeric" value={addFoodModal.newFood.fiber} onChangeText={(text) => handleNewFoodChange('fiber', text)} />
          <TextInput style={styles.searchInput} placeholder="Sugar (per 100g, Optional)" placeholderTextColor={draculaTheme.comment} keyboardType="numeric" value={addFoodModal.newFood.sugar} onChangeText={(text) => handleNewFoodChange('sugar', text)} />
          <TextInput style={styles.searchInput} placeholder="Sodium (per 100g, Optional)" placeholderTextColor={draculaTheme.comment} keyboardType="numeric" value={addFoodModal.newFood.sodium} onChangeText={(text) => handleNewFoodChange('sodium', text)} />
          <TextInput style={styles.searchInput} placeholder="Serving Size (e.g., 100)" placeholderTextColor={draculaTheme.comment} keyboardType="numeric" value={addFoodModal.newFood.servingSize} onChangeText={(text) => handleNewFoodChange('servingSize', text)} />
          <TextInput style={styles.searchInput} placeholder="Serving Unit (e.g., g, ml, piece)" placeholderTextColor={draculaTheme.comment} value={addFoodModal.newFood.servingUnit} onChangeText={(text) => handleNewFoodChange('servingUnit', text)} />

          <TouchableOpacity style={styles.addButton} onPress={handleAddNewFood}>
            <Text style={styles.addButtonText}>Save Food</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: draculaTheme.red, marginTop: spacing.sm }]}
            onPress={() => setState(prev => ({ ...prev, addFoodModal: { ...prev.addFoodModal, visible: false } }))}
          >
            <Text style={styles.addButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
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
  searchResultItem: {
    backgroundColor: draculaTheme.surface.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
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
});
