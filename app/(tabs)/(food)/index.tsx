import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Text, View, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { draculaTheme, spacing, borderRadius, typography } from '@/styles/theme';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useSnackbar } from '@/app/components/SnackbarProvider';
import {
  getFoodEntriesForDate,
  deleteFoodEntry,
  getFoodItem,
  getAllFoodItems,
} from '@/services/database';
import {
  FoodItem,
  FoodEntry,
  MealType,
} from '@/types/types';

type FoodDiaryState = {
  date: string;
  foodEntries: Record<MealType, FoodEntry[]>;
  cameraModal: {
    visible: boolean;
    scanned: boolean;
  };
};

export default function FoodDiaryScreen() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<FoodDiaryState>({
    date: new Date().toISOString().split('T')[0],
    foodEntries: { breakfast: [], lunch: [], dinner: [], snack: [] },
    cameraModal: {
      visible: false,
      scanned: false,
    },
  });

  const { date, foodEntries, cameraModal } = state;

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

  const handleAddFood = (foodItem: FoodItem, mealType?: MealType) => {
    router.push({
      pathname: '/(tabs)/(food)/food-quantity',
      params: { foodId: foodItem.id, mealType: mealType || 'breakfast' },
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

  const openSearchScreen = (mealType: MealType) => {
    router.push({ pathname: '/(tabs)/(food)/food-search', params: { mealType } });
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

  const openBarcodeScanner = async () => {
    const { status } = await requestPermission();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to scan barcodes.');
      return;
    }
    setState(prev => ({ ...prev, cameraModal: { ...prev.cameraModal, visible: true, scanned: false } }));
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
                <View style={styles.foodNutrients}>
                  <Text style={styles.foodCalories}>{item.totalCalories.toFixed(0)} kcal</Text>
                  <Text style={styles.foodMacro}>P: {item.totalProtein.toFixed(1)}g</Text>
                  <Text style={styles.foodMacro}>C: {item.totalCarbs.toFixed(1)}g</Text>
                  <Text style={styles.foodMacro}>F: {item.totalFat.toFixed(1)}g</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={() => openSearchScreen(mealType as MealType)}>
            <Ionicons name="add" size={24} color={draculaTheme.text.inverse} />
            <Text style={styles.addButtonText}>Add Food</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Modal visible={cameraModal.visible} animationType="slide" onRequestClose={() => setState(prev => ({ ...prev, cameraModal: { ...prev.cameraModal, visible: false } }))}>
        <View style={styles.scannerContainer}>
          {!permission?.granted && (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>We need your permission to show the camera</Text>
              <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
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
            <TouchableOpacity style={styles.scanAgainButton} onPress={() => setState(prev => ({ ...prev, cameraModal: { ...prev.cameraModal, scanned: false } }))}>
              <Text style={styles.scanAgainButtonText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={() => setState(prev => ({ ...prev, cameraModal: { ...prev.cameraModal, visible: false } }))}>
            <Text style={styles.closeButtonText}>Close</Text>
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
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.lg,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  permissionButton: {
    backgroundColor: draculaTheme.purple,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  permissionButtonText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  scanAgainButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
