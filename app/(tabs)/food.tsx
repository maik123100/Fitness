
import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, Alert, ScrollView } from 'react-native';
import { addFoodEntry, getFoodEntriesForDate, deleteFoodEntry, searchFoodItems, FoodItem, FoodEntry, MealType, getFoodItem } from '../../services/database';
import { draculaTheme, spacing, borderRadius, typography } from '../../styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function FoodDiaryScreen() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [foodEntries, setFoodEntries] = useState<Record<MealType, FoodEntry[]>>({ breakfast: [], lunch: [], dinner: [], snack: [] });
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');

  useEffect(() => {
    loadFoodEntries();
  }, [date]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const results = searchFoodItems(searchQuery);
      setSearchResults(results);
    }
  }, [searchQuery]);

  const loadFoodEntries = () => {
    const entries = getFoodEntriesForDate(date);
    const groupedEntries: Record<MealType, FoodEntry[]> = { breakfast: [], lunch: [], dinner: [], snack: [] };
    entries.forEach(entry => {
      groupedEntries[entry.mealType].push(entry);
    });
    setFoodEntries(groupedEntries);
  };

  const handleAddFood = (foodItem: FoodItem) => {
    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      foodId: foodItem.id,
      date,
      mealType: selectedMealType,
      quantity: 1, // Default quantity
      unit: foodItem.servingUnit,
      totalCalories: foodItem.calories,
      totalProtein: foodItem.protein,
      totalCarbs: foodItem.carbs,
      totalFat: foodItem.fat,
      totalFiber: foodItem.fiber,
      totalSugar: foodItem.sugar,
      totalSodium: foodItem.sodium,
      createdAt: Date.now(),
    };
    addFoodEntry(newEntry);
    setModalVisible(false);
    loadFoodEntries();
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
    setSearchResults([]);
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
            onChangeText={setSearchQuery}
          />
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
});
