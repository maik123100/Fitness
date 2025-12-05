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
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import ReanimatedAnimated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

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
  const { expandMeal } = useLocalSearchParams<{ expandMeal?: string }>();

  const [state, setState] = useState<FoodDiaryState>({
    foodEntries: { breakfast: [], lunch: [], dinner: [], snack: [] },
    cameraModal: {
      visible: false,
      scanned: false,
    },
    expandedMeals: { breakfast: false, lunch: false, dinner: false, snack: false },
  });

  const { foodEntries, cameraModal, expandedMeals } = state;

  // Meal icons mapping
  const mealIcons: Record<MealType, keyof typeof Ionicons.glyphMap> = {
    breakfast: 'sunny',
    lunch: 'partly-sunny',
    dinner: 'moon',
    snack: 'cafe',
  };

  const mealLabels: Record<MealType, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snacks',
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

  // Handle expandMeal parameter from notification
  useEffect(() => {
    if (expandMeal && (expandMeal === 'breakfast' || expandMeal === 'lunch' || expandMeal === 'dinner')) {
      setState(prev => ({
        ...prev,
        expandedMeals: {
          ...prev.expandedMeals,
          [expandMeal]: true,
        },
      }));
    }
  }, [expandMeal]);

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
  const renderRightActions = (_progress: any, dragX: any, item: FoodEntry) => {
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

  // Collapsible Meal Section Component
  const MealSection = ({ mealType }: { mealType: MealType }) => {
    const rotation = useSharedValue(expandedMeals[mealType] ? 180 : 0);
    const mealTotals = calculateMealTotals(mealType);
    const isExpanded = expandedMeals[mealType];
    const entries = foodEntries[mealType];

    useEffect(() => {
      rotation.value = withTiming(isExpanded ? 180 : 0, { duration: 300 });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isExpanded]);

    const animatedIconStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
      <View style={[styles.mealSection, { backgroundColor: theme.surface.card }, shadows.md]}>
        {/* Meal Header */}
        <Pressable
          style={[styles.mealHeader, { borderBottomColor: theme.surface.secondary }]}
          onPress={() => toggleMealExpanded(mealType)}
          android_ripple={{ color: theme.selection }}
        >
          <View style={styles.mealHeaderLeft}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name={mealIcons[mealType]} size={24} color={theme.primary} />
            </View>
            <View style={styles.mealHeaderText}>
              <Text style={[styles.mealTitle, { color: theme.foreground }]}>
                {mealLabels[mealType]}
              </Text>
              <Text style={[styles.mealSubtitle, { color: theme.comment }]}>
                {entries.length} {entries.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </View>
          <View style={styles.mealHeaderRight}>
            <View style={styles.caloriesBadge}>
              <Text style={[styles.mealCalories, { color: theme.primary }]}>
                {Math.round(mealTotals.calories)}
              </Text>
              <Text style={[styles.caloriesLabel, { color: theme.comment }]}>kcal</Text>
            </View>
            <ReanimatedAnimated.View style={animatedIconStyle}>
              <Ionicons name="chevron-down" size={24} color={theme.comment} />
            </ReanimatedAnimated.View>
          </View>
        </Pressable>

        {/* Meal Content */}
        {isExpanded && (
          <View style={styles.mealContent}>
            {entries.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={48} color={theme.comment} style={styles.emptyIcon} />
                <Text style={[styles.emptyStateText, { color: theme.comment }]}>
                  No food added yet
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: theme.comment }]}>
                  Tap the button below to add food
                </Text>
              </View>
            ) : (
              <>
                {entries.map((entry) => {
                  const foodItem = getFoodItem(entry.foodId);
                  return (
                    <Swipeable
                      key={entry.id}
                      renderRightActions={(_progress, dragX) => renderRightActions(_progress, dragX, entry)}
                    >
                      <View style={[styles.foodItem, { borderBottomColor: theme.surface.secondary }]}>
                        <View style={styles.foodItemLeft}>
                          <Text style={[styles.foodName, { color: theme.foreground }]}>
                            {foodItem?.name || 'Unknown Food'}
                          </Text>
                          <View style={styles.foodDetails}>
                            <View style={styles.servingContainer}>
                              <Ionicons name="scale-outline" size={14} color={theme.comment} />
                              <Text style={[styles.foodServing, { color: theme.comment }]}>
                                {entry.quantity}{entry.unit}
                              </Text>
                            </View>
                            <View style={styles.macroContainer}>
                              <View style={styles.macroItem}>
                                <Ionicons name="fitness-outline" size={12} color={theme.orange} />
                                <Text style={[styles.foodMacro, { color: theme.comment }]}>
                                  P: {Math.round(entry.totalProtein)}g
                                </Text>
                              </View>
                              <View style={styles.macroItem}>
                                <Ionicons name="leaf-outline" size={12} color={theme.green} />
                                <Text style={[styles.foodMacro, { color: theme.comment }]}>
                                  C: {Math.round(entry.totalCarbs)}g
                                </Text>
                              </View>
                              <View style={styles.macroItem}>
                                <Ionicons name="water" size={12} color={theme.cyan} />
                                <Text style={[styles.foodMacro, { color: theme.comment }]}>
                                  F: {Math.round(entry.totalFat)}g
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                        <View style={styles.foodItemRight}>
                          <Text style={[styles.foodCalories, { color: theme.primary }]}>
                            {Math.round(entry.totalCalories)}
                          </Text>
                          <Text style={[styles.foodCaloriesLabel, { color: theme.comment }]}>kcal</Text>
                        </View>
                      </View>
                    </Swipeable>
                  );
                })}
                {/* Meal Totals */}
                <View style={[styles.mealTotals, { backgroundColor: theme.surface.elevated }]}>
                  <Text style={[styles.mealTotalsLabel, { color: theme.comment }]}>Meal Total</Text>
                  <View style={styles.mealTotalsRow}>
                    <View style={styles.totalItem}>
                      <Ionicons name="fitness" size={16} color={theme.orange} />
                      <Text style={[styles.totalValue, { color: theme.foreground }]}>
                        {Math.round(mealTotals.protein)}g
                      </Text>
                      <Text style={[styles.totalLabel, { color: theme.comment }]}>Protein</Text>
                    </View>
                    <View style={styles.totalItem}>
                      <Ionicons name="leaf" size={16} color={theme.green} />
                      <Text style={[styles.totalValue, { color: theme.foreground }]}>
                        {Math.round(mealTotals.carbs)}g
                      </Text>
                      <Text style={[styles.totalLabel, { color: theme.comment }]}>Carbs</Text>
                    </View>
                    <View style={styles.totalItem}>
                      <Ionicons name="water" size={16} color={theme.cyan} />
                      <Text style={[styles.totalValue, { color: theme.foreground }]}>
                        {Math.round(mealTotals.fat)}g
                      </Text>
                      <Text style={[styles.totalLabel, { color: theme.comment }]}>Fat</Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Add Food Button */}
            <Pressable
              style={[styles.addButton, { backgroundColor: theme.primary }, shadows.sm]}
              onPress={() => openSearchScreen(mealType)}
              android_ripple={{ color: theme.surface.elevated }}
            >
              <Ionicons name="add-circle-outline" size={20} color={theme.text.inverse} />
              <Text style={[styles.addButtonText, { color: theme.text.inverse }]}>Add Food</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: theme.foreground }]}>Food Diary</Text>
        <Text style={[styles.pageSubtitle, { color: theme.comment }]}>
          Track your daily nutrition
        </Text>
      </View>

      {/* Meal Sections */}
      {(Object.keys(foodEntries) as MealType[]).map((mealType) => (
        <MealSection key={mealType} mealType={mealType} />
      ))}

      {/* Camera Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={cameraModal.visible}
        onRequestClose={() => setState(prev => ({ ...prev, cameraModal: { ...prev.cameraModal, visible: false } }))}
      >
        <View style={styles.scannerContainer}>
          {permission?.granted ? (
            <>
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                onBarcodeScanned={cameraModal.scanned ? undefined : handleBarCodeScanned}
              />
              {cameraModal.scanned && (
                <TouchableOpacity
                  style={[styles.scanAgainButton, { backgroundColor: theme.primary }, shadows.md]}
                  onPress={() => setState(prev => ({ ...prev, cameraModal: { ...prev.cameraModal, scanned: false } }))}
                >
                  <Text style={[styles.scanAgainButtonText, { color: theme.text.inverse }]}>
                    Tap to Scan Again
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.danger }, shadows.md]}
                onPress={() => setState(prev => ({ ...prev, cameraModal: { ...prev.cameraModal, visible: false } }))}
              >
                <Ionicons name="close" size={24} color={theme.text.inverse} />
              </TouchableOpacity>
            </>
          ) : (
            <View style={[styles.permissionContainer, { backgroundColor: theme.background }]}>
              <Ionicons name="camera-outline" size={64} color={theme.comment} style={styles.permissionIcon} />
              <Text style={[styles.permissionText, { color: theme.foreground }]}>
                Camera permission is required to scan barcodes
              </Text>
              <Pressable
                style={[styles.permissionButton, { backgroundColor: theme.primary }, shadows.sm]}
                onPress={requestPermission}
              >
                <Text style={[styles.permissionButtonText, { color: theme.text.inverse }]}>
                  Grant Permission
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.regular,
  },

  // Meal Section
  mealSection: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    minHeight: 72,
  },
  mealHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  mealHeaderText: {
    flex: 1,
  },
  mealTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  mealSubtitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
  },
  mealHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  caloriesBadge: {
    alignItems: 'flex-end',
  },
  mealCalories: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  caloriesLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
  },

  // Meal Content
  mealContent: {
    paddingBottom: spacing.sm,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  emptyStateText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    textAlign: 'center',
  },

  // Food Item
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    minHeight: 68,
  },
  foodItemLeft: {
    flex: 1,
    gap: spacing.sm,
  },
  foodItemRight: {
    alignItems: 'flex-end',
    marginLeft: spacing.md,
  },
  foodName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  foodDetails: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  servingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  foodServing: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  macroContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  foodMacro: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
  },
  foodCalories: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  foodCaloriesLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
  },

  // Meal Totals
  mealTotals: {
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  mealTotalsLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
  },
  mealTotalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  totalItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  totalValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  totalLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
  },

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    margin: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 52,
    gap: spacing.sm,
  },
  addButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },

  // Scanner/Camera Modal
  scannerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  permissionIcon: {
    marginBottom: spacing.lg,
    opacity: 0.5,
  },
  permissionText: {
    fontSize: typography.sizes.lg,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  permissionButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    minHeight: 52,
  },
  permissionButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    minHeight: 52,
  },
  scanAgainButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },

  // Delete Action
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    height: '100%',
  },
  deleteActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.xs,
  },
});
