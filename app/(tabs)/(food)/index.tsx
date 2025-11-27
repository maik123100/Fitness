import { useSnackbar } from '@/app/components/SnackbarProvider';
import { useDate } from '@/app/contexts/DateContext';
import { useTheme } from '@/app/contexts/ThemeContext';
import { formatDateToYYYYMMDD } from '@/app/utils/dateHelpers';
import {
  deleteFoodEntry,
  getAllFoodItems,
  getFoodEntriesForDate,
  getFoodItem,
} from '@/services/database';
import { FoodEntry, FoodItem, MealType } from '@/services/db/schema';
import { borderRadius, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

type FoodDiaryState = {
  foodEntries: Record<MealType, FoodEntry[]>;
  cameraModal: {
    visible: boolean;
    scanned: boolean;
  };
  expandedMeals: Record<MealType, boolean>;
};

export default function FoodDiaryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showSnackbar } = useSnackbar();
  const [permission, requestPermission] = useCameraPermissions();
  const { selectedDate } = useDate();

  const [state, setState] = useState<FoodDiaryState>({
    foodEntries: { breakfast: [], lunch: [], dinner: [], snack: [] },
    cameraModal: {
      visible: false,
      scanned: false,
    },
    expandedMeals: { breakfast: true, lunch: true, dinner: true, snack: true },
  });

  const { foodEntries, cameraModal, expandedMeals } = state;

  // Meal icons mapping
  const mealIcons: Record<MealType, string> = {
    breakfast: 'sunny',
    lunch: 'partly-sunny',
    dinner: 'moon',
    snack: 'cafe',
  };

  const toggleMealExpanded = (mealType: MealType) => {
    setState(prev => ({
      ...prev,
      expandedMeals: {
        ...prev.expandedMeals,
        [mealType]: !prev.expandedMeals[mealType],
      },
    }));
  };

  const calculateMealTotals = (mealType: MealType) => {
    const entries = foodEntries[mealType];
    return entries.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.totalCalories,
        protein: acc.protein + entry.totalProtein,
        carbs: acc.carbs + entry.totalCarbs,
        fat: acc.fat + entry.totalFat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  useEffect(() => {
    loadFoodEntries();
  }, [selectedDate]);

  const loadFoodEntries = () => {
    const entries = getFoodEntriesForDate(formatDateToYYYYMMDD(selectedDate));
    const groupedEntries: Record<MealType, FoodEntry[]> = { breakfast: [], lunch: [], dinner: [], snack: [] };
    entries.forEach(entry => {
      groupedEntries[entry.mealType as MealType].push(entry);
    });
    setState(prev => ({ ...prev, foodEntries: groupedEntries }));
  };

  const handleAddFood = (foodItem: FoodItem, mealType?: MealType) => {
    router.navigate({
      pathname: '/(tabs)/(food)/food-quantity',
      params: { foodId: foodItem.id, mealType: mealType || 'breakfast', date: formatDateToYYYYMMDD(selectedDate) },
    });
  };

  const handleDeleteFood = (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this food entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          deleteFoodEntry(id);
          loadFoodEntries();
          showSnackbar('Food entry deleted.', 3000);
        }
      },
    ]);
  };

  // Render swipe actions for delete
  const renderRightActions = (progress: any, dragX: any, item: FoodEntry) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={[styles.deleteAction, { backgroundColor: theme.red }]}
        onPress={() => handleDeleteFood(item.id)}
      >
        <Animated.View style={{ transform: [{ translateX: trans }] }}>
          <Ionicons name="trash" size={24} color={theme.text.inverse} />
          <Text style={[styles.deleteActionText, { color: theme.text.inverse }]}>Delete</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const openSearchScreen = (mealType: MealType) => {
    router.navigate({ pathname: '/(tabs)/(food)/food-search', params: { mealType, date: formatDateToYYYYMMDD(selectedDate) } });
  };

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    setState(prev => ({
      ...prev,
      cameraModal: { ...prev.cameraModal, scanned: true, visible: false },
    }));
    const allFoods = getAllFoodItems();
    const foundFood = allFoods.find(food => food.barcode === result.data);

    if (foundFood) {
      handleAddFood(foundFood);
      showSnackbar('Food item found and ready to add!', 2000);
    } else {
      showSnackbar('No food item found with that barcode.', 3000);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {Object.keys(foodEntries).map((mealType) => {
        const meal = mealType as MealType;
        const mealTotals = calculateMealTotals(meal);
        const isExpanded = expandedMeals[meal];

        return (
          <View key={meal} style={styles.mealSection}>
            {/* Meal Header - Collapsible */}
            <TouchableOpacity
              style={[styles.mealHeader, { backgroundColor: theme.surface.card }]}
              onPress={() => toggleMealExpanded(meal)}
            >
              <View style={styles.mealHeaderLeft}>
                <Ionicons
                  name={mealIcons[meal] as any}
                  size={24}
                  color={theme.cyan}
                  style={styles.mealIcon}
                />
                <Text style={[styles.mealTitle, { color: theme.foreground }]}>
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </Text>
              </View>
              <View style={styles.mealHeaderRight}>
                <Text style={[styles.mealCalories, { color: theme.nutrition.calories }]}>{Math.round(mealTotals.calories)} kcal</Text>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.foreground}
                />
              </View>
            </TouchableOpacity>

            {/* Meal Content - Collapsible */}
            {isExpanded && (
              <>
                {foodEntries[meal].map((item) => {
                  const foodItem = getFoodItem(item.foodId);
                  return (
                    <Swipeable
                      key={item.id}
                      renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
                      overshootRight={false}
                    >
                      <View style={[styles.foodItem, { backgroundColor: theme.surface.card }]}>
                        <View style={styles.foodItemLeft}>
                          <Text style={[styles.foodName, { color: theme.foreground }]}>{foodItem?.name}</Text>
                          <View style={styles.foodDetails}>
                            <Text style={[styles.foodServing, { color: theme.comment }]}>{item.quantity} {item.unit}</Text>
                            <Text style={[styles.foodMacro, { color: theme.nutrition.protein }]}>P: {item.totalProtein.toFixed(1)}g</Text>
                            <Text style={[styles.foodMacro, { color: theme.nutrition.carbs }]}>C: {item.totalCarbs.toFixed(1)}g</Text>
                            <Text style={[styles.foodMacro, { color: theme.nutrition.fat }]}>F: {item.totalFat.toFixed(1)}g</Text>
                          </View>
                        </View>
                        <Text style={[styles.foodCalories, { color: theme.nutrition.calories }]}>{item.totalCalories.toFixed(0)} kcal</Text>
                      </View>
                    </Swipeable>
                  );
                })}

                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: theme.primary }]}
                  onPress={() => openSearchScreen(meal)}
                >
                  <Ionicons name="add" size={20} color={theme.text.inverse} />
                  <Text style={[styles.addButtonText, { color: theme.text.inverse }]}>Add Food to {meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        );
      })}

      <Modal visible={cameraModal.visible} animationType="slide" onRequestClose={() => setState(prev => ({ ...prev, cameraModal: { ...prev.cameraModal, visible: false } }))}>
        <View style={[styles.scannerContainer, { backgroundColor: theme.background }]}>
          {!permission?.granted && (
            <View style={styles.permissionContainer}>
              <Text style={[styles.permissionText, { color: theme.foreground }]}>We need your permission to show the camera</Text>
              <TouchableOpacity style={[styles.permissionButton, { backgroundColor: theme.primary }]} onPress={requestPermission}>
                <Text style={[styles.permissionButtonText, { color: theme.text.inverse }]}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          )}
          {permission?.granted && (
            <CameraView
              onBarcodeScanned={cameraModal.scanned ? undefined : handleBarCodeScanned}
              style={StyleSheet.absoluteFillObject}
            />
          )}
          {cameraModal.scanned && (
            <TouchableOpacity style={[styles.scanAgainButton, { backgroundColor: theme.primary }]} onPress={() => setState(prev => ({ ...prev, cameraModal: { ...prev.cameraModal, scanned: false } }))}>
              <Text style={[styles.scanAgainButtonText, { color: theme.text.inverse }]}>Tap to Scan Again</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.danger }]} onPress={() => setState(prev => ({ ...prev, cameraModal: { ...prev.cameraModal, visible: false } }))}>
            <Text style={[styles.closeButtonText, { color: theme.text.inverse }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  mealSection: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  mealHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mealIcon: {
    marginRight: spacing.sm,
  },
  mealTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  mealCalories: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  foodItemLeft: {
    flex: 1,
    gap: spacing.xs,
  },
  foodName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  foodDetails: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  foodServing: {
    fontSize: typography.sizes.sm,
  },
  foodCalories: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  foodNutrients: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodMacro: {
    fontSize: typography.sizes.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    margin: spacing.md,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginLeft: spacing.sm,
  },
  scannerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  permissionText: {
    fontSize: typography.sizes.lg,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  permissionButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  permissionButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    padding: 10,
    borderRadius: 5,
  },
  scanAgainButtonText: {
    fontSize: 16,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.xs,
  },
});
