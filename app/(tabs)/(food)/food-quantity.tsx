import { useSnackbar } from '@/components/SnackbarProvider';
import { useDate } from '@/app/contexts/DateContext';
import { useTheme } from '@/app/contexts/ThemeContext';
import { formatDateToYYYYMMDD } from '@/utils/dateHelpers';
import {
  addFoodEntry,
  getFoodItem,
} from '@/services/database';
import { FoodEntry, FoodItem, MealType } from '@/services/db/schema';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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

  const calculatedNutrients = {
    calories: (foodItem.calories / foodItem.servingSize) * parseFloat(quantity || '0'),
    protein: (foodItem.protein / foodItem.servingSize) * parseFloat(quantity || '0'),
    carbs: (foodItem.carbs / foodItem.servingSize) * parseFloat(quantity || '0'),
    fat: (foodItem.fat / foodItem.servingSize) * parseFloat(quantity || '0'),
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: theme.foreground }]}>Add Portion</Text>
        <Text style={[styles.pageSubtitle, { color: theme.comment }]}>
          {foodItem.name}
        </Text>
      </View>

      {/* Nutritional Preview Card */}
      <View style={[styles.nutrientsCard, { backgroundColor: theme.surface.card }, shadows.md]}>
        <Text style={[styles.cardTitle, { color: theme.foreground }]}>Nutritional Information</Text>
        
        <View style={styles.nutrientRow}>
          <View style={styles.nutrientLeft}>
            <Ionicons name="flame" size={20} color={theme.orange} style={styles.nutrientIcon} />
            <Text style={[styles.nutrientLabel, { color: theme.comment }]}>Calories</Text>
          </View>
          <Text style={[styles.nutrientValue, { color: theme.foreground }]}>
            {calculatedNutrients.calories.toFixed(0)} kcal
          </Text>
        </View>

        <View style={styles.macrosGrid}>
          <View style={styles.macroItem}>
            <Ionicons name="fitness" size={16} color={theme.orange} />
            <Text style={[styles.macroLabel, { color: theme.comment }]}>Protein</Text>
            <Text style={[styles.macroValue, { color: theme.foreground }]}>
              {calculatedNutrients.protein.toFixed(1)}g
            </Text>
          </View>
          <View style={styles.macroItem}>
            <Ionicons name="leaf" size={16} color={theme.green} />
            <Text style={[styles.macroLabel, { color: theme.comment }]}>Carbs</Text>
            <Text style={[styles.macroValue, { color: theme.foreground }]}>
              {calculatedNutrients.carbs.toFixed(1)}g
            </Text>
          </View>
          <View style={styles.macroItem}>
            <Ionicons name="water" size={16} color={theme.cyan} />
            <Text style={[styles.macroLabel, { color: theme.comment }]}>Fat</Text>
            <Text style={[styles.macroValue, { color: theme.foreground }]}>
              {calculatedNutrients.fat.toFixed(1)}g
            </Text>
          </View>
        </View>
      </View>

      {/* Meal Type Selector */}
      <View style={[styles.card, { backgroundColor: theme.surface.card }, shadows.md]}>
        <Text style={[styles.cardTitle, { color: theme.foreground }]}>Meal Type</Text>
        <View style={[styles.pickerWrapper, { backgroundColor: theme.surface.input }, shadows.sm]}>
          <Picker
            selectedValue={selectedMealType}
            onValueChange={(itemValue) => setSelectedMealType(itemValue as MealType)}
            style={styles.picker}
            dropdownIconColor={theme.foreground}
            mode="dialog"
          >
            {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => (
              <Picker.Item 
                label={meal.charAt(0).toUpperCase() + meal.slice(1)} 
                value={meal} 
                key={meal}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Quantity Input */}
      <View style={[styles.card, { backgroundColor: theme.surface.card }, shadows.md]}>
        <Text style={[styles.cardTitle, { color: theme.foreground }]}>Quantity ({foodItem.servingUnit || 'g'})</Text>
        
        {/* Quick Quantity Buttons */}
        <View style={styles.quickButtons}>
          {[50, 100, 150, 200, 250].map((amount) => {
            const currentQuantity = parseFloat(quantity || '0');
            const isSelected = currentQuantity === amount;
            
            console.log(`[Quick Button ${amount}] quantity="${quantity}", parsed=${currentQuantity}, isSelected=${isSelected}`);
            
            return (
              <Pressable
                key={amount}
                style={[
                  styles.quickButton,
                  shadows.sm,
                  { backgroundColor: isSelected ? theme.primary : theme.surface.input }
                ]}
                onPress={() => {
                  console.log(`[Button ${amount} clicked] Setting quantity to: ${amount}`);
                  setQuantity(String(amount));
                }}
              >
                <Text 
                  style={[
                    styles.quickButtonText,
                    { 
                      color: isSelected ? theme.text.inverse : theme.foreground,
                      fontWeight: isSelected ? typography.weights.bold : typography.weights.semibold,
                    }
                  ]}
                >
                  {amount}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Quantity Stepper */}
        <View style={styles.stepperContainer}>
          <Pressable
            style={[styles.stepperButton, { backgroundColor: theme.surface.input }, shadows.sm]}
            onPress={() => handleQuantityChange(-10)}
            android_ripple={{ color: theme.selection }}
          >
            <Ionicons name="remove" size={24} color={theme.foreground} />
          </Pressable>
          
          <View style={[styles.quantityDisplay, { backgroundColor: theme.surface.input }, shadows.sm]}>
            <TextInput
              style={[styles.quantityInput, { color: theme.foreground }]}
              placeholder="100"
              placeholderTextColor={theme.comment}
              keyboardType="numeric"
              value={quantity}
              onChangeText={(text: string) => setQuantity(text)}
              textAlign="center"
            />
          </View>

          <Pressable
            style={[styles.stepperButton, { backgroundColor: theme.surface.input }, shadows.sm]}
            onPress={() => handleQuantityChange(10)}
            android_ripple={{ color: theme.selection }}
          >
            <Ionicons name="add" size={24} color={theme.foreground} />
          </Pressable>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable 
          style={[styles.addButton, { backgroundColor: theme.success }, shadows.md]} 
          onPress={addFoodEntryToDatabase}
          android_ripple={{ color: theme.surface.elevated }}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color={theme.text.inverse} style={styles.buttonIcon} />
          <Text style={[styles.addButtonText, { color: theme.text.inverse }]}>Add to Diary</Text>
        </Pressable>

        <Pressable 
          style={[styles.cancelButton, { backgroundColor: theme.surface.card, borderColor: theme.danger, borderWidth: 2 }]} 
          onPress={() => router.back()}
          android_ripple={{ color: theme.selection }}
        >
          <Ionicons name="close-circle-outline" size={24} color={theme.danger} style={styles.buttonIcon} />
          <Text style={[styles.cancelButtonText, { color: theme.danger }]}>Cancel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.lg,
  },
  mealTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  header: {
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
  },

  // Card Styles
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  nutrientsCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },

  // Nutrient Row
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  nutrientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutrientIcon: {
    marginRight: spacing.sm,
  },
  nutrientLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  nutrientValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },

  // Macros Grid
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  macroLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
  },
  macroValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },

  // Picker
  pickerWrapper: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    minHeight: 52,
    justifyContent: 'center',
  },
  picker: {
    height: 52,
  },

  // Quick Buttons
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickButton: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  quickButtonSelected: {
    // Will be set dynamically via inline style
  },
  quickButtonUnselected: {
    // Will be set dynamically via inline style
  },
  quickButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },

  // Stepper
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepperButton: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplay: {
    flex: 1,
    borderRadius: borderRadius.md,
    minHeight: 56,
    justifyContent: 'center',
  },
  quantityInput: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },

  // Action Buttons
  actionButtons: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    minHeight: 56,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  addButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    minHeight: 56,
  },
  cancelButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
});
