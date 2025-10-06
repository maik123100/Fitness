
import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, Alert, ScrollView } from 'react-native';
import { addFoodEntry, getFoodEntriesForDate, deleteFoodEntry, searchFoodItems, FoodItem, FoodEntry, MealType, getFoodItem, getAllFoodItems, addFoodItem, FoodCategory } from '../../services/database';
import { draculaTheme, spacing, borderRadius, typography } from '../../styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';

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

export default function FoodDiaryScreen() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [foodEntries, setFoodEntries] = useState<Record<MealType, FoodEntry[]>>({ breakfast: [], lunch: [], dinner: [], snack: [] });
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [debounceTimeout, setDebounceTimeout] = useState<number | null>(null);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [selectedFoodItemForQuantity, setSelectedFoodItemForQuantity] = useState<FoodItem | null>(null);
  const [quantityInput, setQuantityInput] = useState('100'); // Default to 100g

  // State for Add New Food Modal
  const [addFoodModalVisible, setAddFoodModalVisible] = useState(false);
  const [newFood, setNewFood] = useState<NewFoodItem>({
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
  });

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
    setFoodEntries(groupedEntries);
  };

  const addFoodEntryToDatabase = (foodItem: FoodItem, quantity: number) => {
    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      foodId: foodItem.id,
      date,
      mealType: selectedMealType,
      quantity: quantity, // Use the provided quantity
      unit: 'g', // Assuming grams as unit for now
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
    setModalVisible(false); // Close search modal
    setQuantityModalVisible(false); // Close quantity modal
    loadFoodEntries();
  };

  const handleAddFood = (foodItem: FoodItem) => {
    setSelectedFoodItemForQuantity(foodItem);
    setQuantityInput('100'); // Default to 100g
    setQuantityModalVisible(true);
  };

  const handleAddNewFood = () => {
    if (!newFood.name || !newFood.calories || !newFood.protein || !newFood.carbs || !newFood.fat || !newFood.servingSize) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Calories, Protein, Carbs, Fat, Serving Size).');
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
      cholesterol: 0, // Assuming default 0 for now
      saturatedFat: 0, // Assuming default 0 for now
      transFat: 0, // Assuming default 0 for now
      vitaminA: 0, // Assuming default 0 for now
      vitaminC: 0, // Assuming default 0 for now
      vitaminD: 0, // Assuming default 0 for now
      calcium: 0, // Assuming default 0 for now
      iron: 0, // Assuming default 0 for now
      potassium: 0, // Assuming default 0 for now
      servingSize: parseFloat(newFood.servingSize),
      servingUnit: newFood.servingUnit,
      isVerified: false, // Newly added food is not verified by default
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    addFoodItem(foodToAdd);
    setAddFoodModalVisible(false);
    // Clear the form
    setNewFood({
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
    });
    // Refresh search results to include the new food item
    const allFoods = getAllFoodItems().sort((a: FoodItem, b: FoodItem) => a.name.localeCompare(b.name));
    setSearchResults(allFoods);
  };

  const handleDeleteFood = (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this food entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        deleteFoodEntry(id);
        loadFoodEntries();
      }},
    ]);
  };

  const openSearchModal = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setSearchQuery('');
    // Load all food items in lexicographical order initially
    const allFoods = getAllFoodItems().sort((a: FoodItem, b: FoodItem) => a.name.localeCompare(b.name));
    setSearchResults(allFoods); // Show all initially
    setModalVisible(true);
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

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food..."
            placeholderTextColor={draculaTheme.comment}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (debounceTimeout) {
                clearTimeout(debounceTimeout);
              }
              setDebounceTimeout(
                setTimeout(() => {
                  const allFoods = getAllFoodItems();
                  if (text.length > 0) {
                    const filteredResults = allFoods.filter(food =>
                      food.name.toLowerCase().includes(text.toLowerCase())
                    ).sort((a: FoodItem, b: FoodItem) => a.name.localeCompare(b.name));
                    setSearchResults(filteredResults);
                  } else {
                    // If search query is empty, show all food items in lexicographical order
                    setSearchResults(allFoods.sort((a: FoodItem, b: FoodItem) => a.name.localeCompare(b.name)));
                  }
                }, 500) // 500ms debounce delay
              );
            }}
          />
          <TouchableOpacity style={styles.addNewFoodButton} onPress={() => setAddFoodModalVisible(true)}>
            <Text style={styles.addNewFoodButtonText}>Add New Food</Text>
          </TouchableOpacity>
          <FlatList
            data={searchResults}
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

      <Modal visible={quantityModalVisible} animationType="slide" onRequestClose={() => setQuantityModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.mealTitle}>Enter Quantity for {selectedFoodItemForQuantity?.name}</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Quantity in grams"
            placeholderTextColor={draculaTheme.comment}
            keyboardType="numeric"
            value={quantityInput}
            onChangeText={setQuantityInput}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              if (selectedFoodItemForQuantity && quantityInput) {
                addFoodEntryToDatabase(selectedFoodItemForQuantity, parseFloat(quantityInput));
              } else {
                Alert.alert('Error', 'Please enter a valid quantity.');
              }
            }}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: draculaTheme.red, marginTop: spacing.sm }]}
            onPress={() => setQuantityModalVisible(false)}
          >
            <Text style={styles.addButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={addFoodModalVisible} animationType="slide" onRequestClose={() => setAddFoodModalVisible(false)}>
        <ScrollView style={styles.modalContainer} contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.mealTitle}>Add New Food Item</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Food Name"
            placeholderTextColor={draculaTheme.comment}
            value={newFood.name}
            onChangeText={(text) => setNewFood(prev => ({ ...prev, name: text }))}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Brand (Optional)"
            placeholderTextColor={draculaTheme.comment}
            value={newFood.brand}
            onChangeText={(text) => setNewFood(prev => ({ ...prev, brand: text }))}
          />
          <Text style={styles.label}>Category:</Text>
          <Picker
            selectedValue={newFood.category}
            style={styles.picker}
            onValueChange={(itemValue) => setNewFood(prev => ({ ...prev, category: itemValue as FoodCategory }))}
          >
            {foodCategories.map((category) => (
              <Picker.Item key={category} label={category} value={category} />
            ))}
          </Picker>

          <TextInput
            style={styles.searchInput}
            placeholder="Calories (per 100g)"
            placeholderTextColor={draculaTheme.comment}
            keyboardType="numeric"
            value={newFood.calories}
            onChangeText={(text) => setNewFood(prev => ({ ...prev, calories: text }))}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Protein (per 100g)"
            placeholderTextColor={draculaTheme.comment}
            keyboardType="numeric"
            value={newFood.protein}
            onChangeText={(text) => setNewFood(prev => ({ ...prev, protein: text }))}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Carbs (per 100g)"
            placeholderTextColor={draculaTheme.comment}
            keyboardType="numeric"
            value={newFood.carbs}
            onChangeText={(text) => setNewFood(prev => ({ ...prev, carbs: text }))}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Fat (per 100g)"
            placeholderTextColor={draculaTheme.comment}
            keyboardType="numeric"
            value={newFood.fat}
            onChangeText={(text) => setNewFood(prev => ({ ...prev, fat: text }))}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Fiber (per 100g, Optional)"
            placeholderTextColor={draculaTheme.comment}
            keyboardType="numeric"
            value={newFood.fiber}
            onChangeText={(text) => setNewFood(prev => ({ ...prev, fiber: text }))}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Sugar (per 100g, Optional)"
            placeholderTextColor={draculaTheme.comment}
            keyboardType="numeric"
            value={newFood.sugar}
            onChangeText={(text) => setNewFood(prev => ({ ...prev, sugar: text }))}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Sodium (per 100g, Optional)"
            placeholderTextColor={draculaTheme.comment}
            keyboardType="numeric"
            value={newFood.sodium}
            onChangeText={(text) => setNewFood(prev => ({ ...prev, sodium: text }))}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Serving Size (e.g., 100)"
            placeholderTextColor={draculaTheme.comment}
            keyboardType="numeric"
            value={newFood.servingSize}
            onChangeText={(text) => setNewFood(prev => ({ ...prev, servingSize: text }))}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Serving Unit (e.g., g, ml, piece)"
            placeholderTextColor={draculaTheme.comment}
            value={newFood.servingUnit}
            onChangeText={(text) => setNewFood(prev => ({ ...prev, servingUnit: text }))}
          />

          <TouchableOpacity style={styles.addButton} onPress={handleAddNewFood}>
            <Text style={styles.addButtonText}>Save Food</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: draculaTheme.red, marginTop: spacing.sm }]}
            onPress={() => setAddFoodModalVisible(false)}
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
    paddingBottom: spacing.lg * 2, // Extra space for buttons
  },
});
