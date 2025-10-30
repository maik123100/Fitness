import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text, View, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { draculaTheme, spacing, borderRadius, typography } from '@/styles/theme';
import { useSnackbar } from '@/app/components/SnackbarProvider';
import {
  addFoodEntry,
  getFoodItem,
} from '@/services/database';
import { FoodItem, FoodEntry, MealType } from '@/types/types';
import { useDate } from '@/app/contexts/DateContext';
import { formatDateToYYYYMMDD } from '@/app/utils/dateHelpers';

export default function FoodQuantityScreen() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const params = useLocalSearchParams<{ foodId: string, mealType: MealType }>();
  const foodId = params.foodId;
  const initialMealType = params.mealType;
  const { selectedDate } = useDate();
  const entryDate = formatDateToYYYYMMDD(selectedDate);

  const [foodItem, setFoodItem] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');

  useEffect(() => {
    if (foodId) {
      const item = getFoodItem(foodId);
      if (item) {
        setFoodItem(item);
      } else {
        showSnackbar('Food item not found.', 3000);
        router.back();
      }
    }
    if (initialMealType) {
      setSelectedMealType(initialMealType);
    }
  }, [foodId, initialMealType]);

  const handleQuantityChange = (changeAmount: number) => {
    const currentQuantity = parseFloat(quantity || '0');
    const newQuantity = Math.max(0, currentQuantity + changeAmount);
    setQuantity(String(newQuantity));
  };

  const addFoodEntryToDatabase = () => {
    if (!foodItem) {
      showSnackbar('Food item not loaded.', 3000);
      return;
    }
    if (!entryDate) {
      showSnackbar('Date not provided.', 3000);
      return;
    }

    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      showSnackbar('Please enter a valid quantity greater than 0.', 3000);
      return;
    }

    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      foodId: foodItem.id,
      date: entryDate,
      mealType: selectedMealType,
      quantity: parsedQuantity,
      unit: 'g',
      totalCalories: (foodItem.calories / foodItem.servingSize) * parsedQuantity,
      totalProtein: (foodItem.protein / foodItem.servingSize) * parsedQuantity,
      totalCarbs: (foodItem.carbs / foodItem.servingSize) * parsedQuantity,
      totalFat: (foodItem.fat / foodItem.servingSize) * parsedQuantity,
      totalFiber: (foodItem.fiber / foodItem.servingSize) * parsedQuantity,
      createdAt: Date.now(),
    };
    addFoodEntry(newEntry);
    showSnackbar('Food logged successfully!', 3000);
    router.navigate('/(tabs)/(food)');
  };

  if (!foodItem) {
    return (
      <View style={styles.container}>
        <Text style={styles.mealTitle}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.mealTitle}>Add {foodItem.name}</Text>

      <View style={styles.calculatedNutrientsContainer}>
        <View style={styles.calculatedNutrientRow}>
          <Text style={styles.calculatedNutrientLabel}>Calories:</Text>
          <Text style={styles.calculatedNutrientValue}>{((foodItem.calories / foodItem.servingSize) * parseFloat(quantity || '0')).toFixed(0)} kcal</Text>
        </View>
        <View style={styles.calculatedNutrientRow}>
          <Text style={styles.calculatedNutrientLabel}>Protein:</Text>
          <Text style={styles.calculatedNutrientValue}>{((foodItem.protein / foodItem.servingSize) * parseFloat(quantity || '0')).toFixed(1)}g</Text>
        </View>
        <View style={styles.calculatedNutrientRow}>
          <Text style={styles.calculatedNutrientLabel}>Carbs:</Text>
          <Text style={styles.calculatedNutrientValue}>{((foodItem.carbs / foodItem.servingSize) * parseFloat(quantity || '0')).toFixed(1)}g</Text>
        </View>
        <View style={styles.calculatedNutrientRow}>
          <Text style={styles.calculatedNutrientLabel}>Fat:</Text>
          <Text style={styles.calculatedNutrientValue}>{((foodItem.fat / foodItem.servingSize) * parseFloat(quantity || '0')).toFixed(1)}g</Text>
        </View>
      </View>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedMealType}
          onValueChange={(itemValue) => setSelectedMealType(itemValue as MealType)}
          style={styles.picker}
          dropdownIconColor={draculaTheme.text.primary}
          itemStyle={styles.pickerItem}
        >
          {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => (
            <Picker.Item label={meal.charAt(0).toUpperCase() + meal.slice(1)} value={meal} key={meal} color={draculaTheme.text.primary} style={{ color: draculaTheme.text.primary, backgroundColor: draculaTheme.surface.input }} />
          ))}
        </Picker>
      </View>

      <View style={styles.quickQuantityButtonsContainer}>
        {[50, 100, 150, 200, 250].map((q) => (
          <TouchableOpacity
            key={q}
            style={styles.quickQuantityButton}
            onPress={() => setQuantity(String(q))}
          >
            <Text style={styles.quickQuantityButtonText}>{q} {foodItem.servingUnit || 'g'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.quantityInputContainer}>
        <TouchableOpacity style={styles.quantityStepperButton} onPress={() => handleQuantityChange(-10)}>
          <Text style={styles.quantityStepperButtonText}>-</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.quantityInput}
          placeholder={`Quantity in ${foodItem.servingUnit || 'g'}`}
          placeholderTextColor={draculaTheme.comment}
          keyboardType="numeric"
          value={quantity}
          onChangeText={(text: string) => setQuantity(text)}
        />
        <TouchableOpacity style={styles.quantityStepperButton} onPress={() => handleQuantityChange(10)}>
          <Text style={styles.quantityStepperButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={addFoodEntryToDatabase}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: draculaTheme.red, marginTop: spacing.sm }]}
        onPress={() => router.back()}
      >
        <Text style={styles.addButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: draculaTheme.background,
    padding: spacing.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: draculaTheme.background,
    padding: spacing.md,
  },
  mealTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
    marginBottom: spacing.md,
  },
  quantityInput: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.md,
    flex: 1,
    textAlign: 'center',
    height: 50,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    width: '100%',
  },
  quantityStepperButton: {
    backgroundColor: draculaTheme.surface.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  quantityStepperButtonText: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
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
  pickerWrapper: {
    backgroundColor: draculaTheme.surface.input,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: draculaTheme.surface.secondary,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.foreground,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  pickerItem: {
    color: draculaTheme.foreground,
    backgroundColor: draculaTheme.surface.input,
    fontSize: typography.sizes.md,
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
  calculatedNutrientsContainer: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  calculatedNutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.sm,
    backgroundColor: draculaTheme.surface.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  calculatedNutrientLabel: {
    fontSize: typography.sizes.md,
    color: draculaTheme.comment,
    fontWeight: typography.weights.semibold,
  },
  calculatedNutrientValue: {
    fontSize: typography.sizes.md,
    color: draculaTheme.foreground,
  },
});
