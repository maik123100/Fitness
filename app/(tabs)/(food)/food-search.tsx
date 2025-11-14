import { useSnackbar } from '@/app/components/SnackbarProvider';
import {
  deleteFoodItem,
  getAllFoodItems,
} from '@/services/database';
import { borderRadius, draculaTheme, spacing, typography } from '@/styles/theme';
import { FoodItem, MealType } from '@/services/db/schema';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function FoodSearchScreen() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const params = useLocalSearchParams<{ mealType: MealType }>();
  const mealType = params.mealType;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [debounceTimeout, setDebounceTimeout] = useState<number | null>(null);
  const [cameraModal, setCameraModal] = useState({ visible: false, scanned: false });
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    const allFoods = getAllFoodItems().sort((a, b) => a.name.localeCompare(b.name));
    setResults(allFoods);
  }, []);

  const handleSearchQueryChange = (text: string) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const newTimeout = setTimeout(() => {
      const allFoods = getAllFoodItems();
      if (text.length > 0) {
        const filteredResults = allFoods.filter(food =>
          food.name.toLowerCase().includes(text.toLowerCase())
        ).sort((a, b) => a.name.localeCompare(b.name));
        setResults(filteredResults);
      } else {
        setResults(allFoods.sort((a, b) => a.name.localeCompare(b.name)));
      }
    }, 500);

    setQuery(text);
    setDebounceTimeout(newTimeout as any);
  };

  const handleAddFood = (foodItem: FoodItem) => {
    router.navigate({
      pathname: '/(tabs)/(food)/food-quantity',
      params: { foodId: foodItem.id, mealType: mealType },
    });
  };

  const openBarcodeScanner = async () => {
    const { status } = await requestPermission();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to scan barcodes.');
      return;
    }
    setCameraModal({ visible: true, scanned: false });
  };

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    setCameraModal({ visible: false, scanned: true });
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
    <View style={styles.modalContainer}>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for food..."
          placeholderTextColor={draculaTheme.comment}
          value={query}
          onChangeText={handleSearchQueryChange}
        />
        <TouchableOpacity style={styles.barcodeScanButton} onPress={openBarcodeScanner}>
          <Ionicons name="barcode-outline" size={24} color={draculaTheme.text.inverse} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.addNewFoodButton} onPress={() => {
        router.navigate('/(tabs)/(food)/add-food');
      }}>
        <Text style={styles.addNewFoodButtonText}>Add New Food</Text>
      </TouchableOpacity>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.searchResultItemRow}>
            <TouchableOpacity style={styles.searchResultItem} onPress={() => handleAddFood(item)}>
              <Text style={styles.searchResultName}>{item.name}</Text>
              <View style={styles.searchResultNutrientRow}>
                <Text style={styles.searchResultNutrientLabel}>Calories:</Text>
                <Text style={styles.searchResultNutrientValue}>{item.calories} kcal</Text>
              </View>
              <View style={styles.searchResultMacrosRow}>
                <Text style={styles.searchResultMacroText}>Proteins: {item.protein}g</Text>
                <Text style={styles.searchResultMacroText}>Carbs: {item.carbs}g</Text>
                <Text style={styles.searchResultMacroText}>Fats: {item.fat}g</Text>
              </View>
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
                        deleteFoodItem(item);
                        const allFoods = getAllFoodItems().sort((a, b) => a.name.localeCompare(b.name));
                        setResults(allFoods);
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

      <Modal visible={cameraModal.visible} animationType="slide" onRequestClose={() => setCameraModal({ visible: false, scanned: false })}>
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
            <TouchableOpacity style={styles.scanAgainButton} onPress={() => setCameraModal({ visible: true, scanned: false })}>
              <Text style={styles.scanAgainButtonText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={() => setCameraModal({ visible: false, scanned: false })}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
    flex: 1,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    width: '100%',
  },
  barcodeScanButton: {
    backgroundColor: draculaTheme.cyan,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
    height: 50, // Match TextInput height
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  searchResultItem: {
    flex: 1,
  },
  trashIconBtn: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: draculaTheme.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  searchResultName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
  },
  searchResultNutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.xs,
  },
  searchResultNutrientLabel: {
    fontSize: typography.sizes.sm,
    color: draculaTheme.comment,
    fontWeight: typography.weights.semibold,
  },
  searchResultNutrientValue: {
    fontSize: typography.sizes.sm,
    color: draculaTheme.foreground,
  },
  searchResultMacrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  searchResultMacroText: {
    fontSize: typography.sizes.sm,
    color: draculaTheme.foreground,
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
  scannerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    backgroundColor: draculaTheme.background,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  permissionText: {
    color: draculaTheme.foreground,
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
    backgroundColor: draculaTheme.surface.overlay,
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: draculaTheme.foreground,
    fontSize: 16,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: draculaTheme.surface.overlay,
    padding: 10,
    borderRadius: 5,
  },
  scanAgainButtonText: {
    color: draculaTheme.foreground,
    fontSize: 16,
  },
});
