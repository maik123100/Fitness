import { useSnackbar } from '@/app/components/SnackbarProvider';
import { useTheme } from '@/app/contexts/ThemeContext';
import {
  deleteFoodItem,
  getAllFoodItems,
} from '@/services/database';
import { FoodItem, MealType } from '@/services/db/schema';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function FoodSearchScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showSnackbar } = useSnackbar();
  const params = useLocalSearchParams<{ mealType: MealType }>();
  const mealType = params.mealType;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cameraModal, setCameraModal] = useState({ visible: false, scanned: false });
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    const allFoods = getAllFoodItems().sort((a, b) => a.name.localeCompare(b.name));
    setResults(allFoods);

    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchQueryChange = (text: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: theme.foreground }]}>Search Food</Text>
        <Text style={[styles.pageSubtitle, { color: theme.comment }]}>
          Find food items to add to your meal
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.surface.input }, shadows.sm]}>
          <Ionicons name="search-outline" size={20} color={theme.comment} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.foreground }]}
            placeholder="Search for food..."
            placeholderTextColor={theme.comment}
            value={query}
            onChangeText={handleSearchQueryChange}
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => handleSearchQueryChange('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={theme.comment} />
            </Pressable>
          )}
        </View>
        <Pressable
          style={[styles.scanButton, { backgroundColor: theme.primary }, shadows.sm]}
          onPress={openBarcodeScanner}
          android_ripple={{ color: theme.surface.elevated }}
        >
          <Ionicons name="barcode-outline" size={24} color={theme.text.inverse} />
        </Pressable>
      </View>

      {/* Add New Food Button */}
      <Pressable
        style={[styles.addNewButton, { backgroundColor: theme.success }, shadows.md]}
        onPress={() => router.navigate('/(tabs)/(food)/add-food')}
        android_ripple={{ color: theme.surface.elevated }}
      >
        <Ionicons name="add-circle-outline" size={20} color={theme.text.inverse} style={styles.buttonIcon} />
        <Text style={[styles.addNewButtonText, { color: theme.text.inverse }]}>Add New Food Item</Text>
      </Pressable>

      {/* Results Count */}
      {query.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsCount, { color: theme.comment }]}>
            {results.length} {results.length === 1 ? 'result' : 'results'} found
          </Text>
        </View>
      )}

      {/* Food List */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.foodCard, { backgroundColor: theme.surface.card }, shadows.sm]}>
            <Pressable
              style={styles.foodCardContent}
              onPress={() => handleAddFood(item)}
              android_ripple={{ color: theme.selection }}
            >
              <View style={styles.foodCardMain}>
                <Text style={[styles.foodName, { color: theme.foreground }]}>{item.name}</Text>
                <View style={styles.caloriesBadge}>
                  <Ionicons name="flame" size={16} color={theme.orange} style={styles.calorieIcon} />
                  <Text style={[styles.caloriesText, { color: theme.foreground }]}>
                    {item.calories}
                  </Text>
                  <Text style={[styles.caloriesLabel, { color: theme.comment }]}>kcal</Text>
                </View>
              </View>
              
              <View style={styles.macrosRow}>
                <View style={styles.macroItem}>
                  <Ionicons name="fitness" size={14} color={theme.orange} />
                  <Text style={[styles.macroLabel, { color: theme.comment }]}>Protein:</Text>
                  <Text style={[styles.macroValue, { color: theme.foreground }]}>{item.protein}g</Text>
                </View>
                <View style={styles.macroItem}>
                  <Ionicons name="leaf" size={14} color={theme.green} />
                  <Text style={[styles.macroLabel, { color: theme.comment }]}>Carbs:</Text>
                  <Text style={[styles.macroValue, { color: theme.foreground }]}>{item.carbs}g</Text>
                </View>
                <View style={styles.macroItem}>
                  <Ionicons name="water" size={14} color={theme.cyan} />
                  <Text style={[styles.macroLabel, { color: theme.comment }]}>Fat:</Text>
                  <Text style={[styles.macroValue, { color: theme.foreground }]}>{item.fat}g</Text>
                </View>
              </View>
            </Pressable>

            {/* Delete Button */}
            <Pressable
              style={[styles.deleteButton, { backgroundColor: theme.surface.elevated }]}
              onPress={() => {
                Alert.alert(
                  'Delete Food Item',
                  `Are you sure you want to delete "${item.name}"? This cannot be undone.`,
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
              <Ionicons name="trash-outline" size={20} color={theme.danger} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={theme.comment} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: theme.foreground }]}>
              {query.length > 0 ? 'No food items found' : 'Start searching for food'}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.comment }]}>
              {query.length > 0 
                ? 'Try a different search term or add a new food item'
                : 'Type in the search box above to find food items'}
            </Text>
          </View>
        }
      />

      {/* Camera Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={cameraModal.visible}
        onRequestClose={() => setCameraModal({ visible: false, scanned: false })}
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
                  onPress={() => setCameraModal({ visible: true, scanned: false })}
                >
                  <Text style={[styles.scanAgainButtonText, { color: theme.text.inverse }]}>
                    Tap to Scan Again
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.danger }, shadows.md]}
                onPress={() => setCameraModal({ visible: false, scanned: false })}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
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

  // Search Section
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    minHeight: 56,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
  },
  clearButton: {
    padding: spacing.xs,
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Add New Button
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    minHeight: 56,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  addNewButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },

  // Results Header
  resultsHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  resultsCount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },

  // Food List
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  foodCard: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  foodCardContent: {
    flex: 1,
    padding: spacing.lg,
  },
  foodCardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  foodName: {
    flex: 1,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginRight: spacing.md,
  },
  caloriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  calorieIcon: {
    marginRight: 2,
  },
  caloriesText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  caloriesLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  macroLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
  },
  macroValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },

  // Delete Button
  deleteButton: {
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    textAlign: 'center',
    lineHeight: 24,
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
});
