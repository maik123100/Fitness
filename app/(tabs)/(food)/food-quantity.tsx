import { useSnackbar } from '@/app/components/SnackbarProvider';
import { useDate } from '@/app/contexts/DateContext';
import { useTheme } from '@/app/contexts/ThemeContext';
import { formatDateToYYYYMMDD } from '@/app/utils/dateHelpers';
import {
  addFoodEntry,
  getFoodItem,
} from '@/services/database';
import { FoodEntry, FoodItem, MealType } from '@/services/db/schema';
import { borderRadius, spacing, typography } from '@/styles/theme';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function FoodQuantityScreen() {
  const router = useRouter();
  const { theme } = useTheme();
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.mealTitle, { color: theme.foreground }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.mealTitle, { color: theme.foreground }]}>Add {foodItem.name}</Text>

      <View style={[styles.calculatedNutrientsContainer, { backgroundColor: theme.surface.card }]}>
        <View style={styles.calculatedNutrientRow}>
          <Text style={[styles.calculatedNutrientLabel, { color: theme.comment }]}>Calories:</Text>
          <Text style={[styles.calculatedNutrientValue, { color: theme.nutrition.calories }]}>{((foodItem.calories / foodItem.servingSize) * parseFloat(quantity || '0')).toFixed(0)} kcal</Text>
        </View>
        <View style={styles.calculatedNutrientRow}>
          <Text style={[styles.calculatedNutrientLabel, { color: theme.comment }]}>Protein:</Text>
          <Text style={[styles.calculatedNutrientValue, { color: theme.nutrition.protein }]}>{((foodItem.protein / foodItem.servingSize) * parseFloat(quantity || '0')).toFixed(1)}g</Text>
        </View>
        <View style={styles.calculatedNutrientRow}>
          <Text style={[styles.calculatedNutrientLabel, { color: theme.comment }]}>Carbs:</Text>
          <Text style={[styles.calculatedNutrientValue, { color: theme.nutrition.carbs }]}>{((foodItem.carbs / foodItem.servingSize) * parseFloat(quantity || '0')).toFixed(1)}g</Text>
        </View>
        <View style={styles.calculatedNutrientRow}>
          <Text style={[styles.calculatedNutrientLabel, { color: theme.comment }]}>Fat:</Text>
          <Text style={[styles.calculatedNutrientValue, { color: theme.nutrition.fat }]}>{((foodItem.fat / foodItem.servingSize) * parseFloat(quantity || '0')).toFixed(1)}g</Text>
        </View>
      </View>

      <View style={[styles.pickerWrapper, { backgroundColor: theme.surface.input }]}>
        <Picker
          selectedValue={selectedMealType}
          onValueChange={(itemValue) => setSelectedMealType(itemValue as MealType)}
          style={styles.picker}
          dropdownIconColor={theme.text.primary}
          itemStyle={styles.pickerItem}
        >
          {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => (
            <Picker.Item label={meal.charAt(0).toUpperCase() + meal.slice(1)} value={meal} key={meal} color={theme.text.primary} style={{ color: theme.text.primary, backgroundColor: theme.surface.input }} />
          ))}
        </Picker>
      </View>

      <View style={styles.quickQuantityButtonsContainer}>
        {[50, 100, 150, 200, 250].map((q) => (
          <TouchableOpacity
            key={q}
            style={[styles.quickQuantityButton, { backgroundColor: theme.surface.card }]}
            onPress={() => setQuantity(String(q))}
          >
            <Text style={[styles.quickQuantityButtonText, { color: theme.foreground }]}>{q} {foodItem.servingUnit || 'g'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.quantityInputContainer}>
        <TouchableOpacity style={[styles.quantityStepperButton, { backgroundColor: theme.surface.card }]} onPress={() => handleQuantityChange(-10)}>
          <Text style={[styles.quantityStepperButtonText, { color: theme.foreground }]}>-</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.quantityInput, { backgroundColor: theme.surface.input, color: theme.foreground }]}
          placeholder={`Quantity in ${foodItem.servingUnit || 'g'}`}
          placeholderTextColor={theme.comment}
          keyboardType="numeric"
          value={quantity}
          onChangeText={(text: string) => setQuantity(text)}
        />
        <TouchableOpacity style={[styles.quantityStepperButton, { backgroundColor: theme.surface.card }]} onPress={() => handleQuantityChange(10)}>
          <Text style={[styles.quantityStepperButtonText, { color: theme.foreground }]}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.green }]}
        onPress={addFoodEntryToDatabase}
      >
        <Text style={[styles.addButtonText, { color: theme.text.inverse }]}>Add</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.red, marginTop: spacing.sm }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.addButtonText, { color: theme.text.inverse }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  modalContainer: {
    flex: 1,
    padding: spacing.md,
  },
  mealTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  quantityInput: {
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
    padding: spacing.md,
    borderRadius: borderRadius.md,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  quantityStepperButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  addButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginLeft: spacing.sm,
  },
  pickerWrapper: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  pickerItem: {
    fontSize: typography.sizes.md,
  },
  quickQuantityButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  quickQuantityButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    margin: spacing.xs,
  },
  quickQuantityButtonText: {
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
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  calculatedNutrientLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  calculatedNutrientValue: {
    fontSize: typography.sizes.md,
  },
});
