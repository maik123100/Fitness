import { useSnackbar } from '@/components/SnackbarProvider';
import { useTheme } from '@/app/contexts/ThemeContext';
import { addFoodItem, getAllFoodItems } from '@/services/database';
import { FoodCategory, FoodItem } from '@/services/db/schema';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ReanimatedAnimated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';


const defaultFood: FoodItem = {
  id: Date.now().toString(),
  name: '',
  brand: null,
  barcode: null,
  category: 'other',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  servingSize: 100,
  servingUnit: 'g',
  isVerified: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminB6: 0,
  vitaminE: 0, vitaminK: 0, thiamin: 0, vitaminB12: 0,
  riboflavin: 0, folate: 0, niacin: 0, choline: 0,
  pantothenicAcid: 0, biotin: 0, carotenoids: 0,
  calcium: 0, chloride: 0, chromium: 0, copper: 0,
  fluoride: 0, iodine: 0, iron: 0, magnesium: 0,
  manganese: 0, molybdenum: 0, phosphorus: 0,
  potassium: 0, selenium: 0, sodium: 0, zinc: 0,
};

const AddFood: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { showSnackbar } = useSnackbar();
  const [food, setFood] = useState<FoodItem>({ ...defaultFood });
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showVitamins, setShowVitamins] = useState(false);
  const [showMinerals, setShowMinerals] = useState(false);

  // Define input fields as data arrays
  const generalFields = [
    { label: 'Name', key: 'name', isNumber: false },
    { label: 'Brand (optional)', key: 'brand', isNumber: false },
    { label: 'Calories', key: 'calories', isNumber: true },
    { label: 'Serving Size', key: 'servingSize', isNumber: true },
    { label: 'Serving Unit', key: 'servingUnit', isNumber: false },
  ];

  const macroFields = [
    { label: 'Protein (g)', key: 'protein', isNumber: true },
    { label: 'Carbs (g)', key: 'carbs', isNumber: true },
    { label: 'Fat (g)', key: 'fat', isNumber: true },
    { label: 'Fiber (g)', key: 'fiber', isNumber: true },
  ];

  const vitaminFields = [
    { label: 'Vitamin A (µg)', key: 'vitaminA', isNumber: true },
    { label: 'Vitamin C (mg)', key: 'vitaminC', isNumber: true },
    { label: 'Vitamin D (µg)', key: 'vitaminD', isNumber: true },
    { label: 'Vitamin B6 (mg)', key: 'vitaminB6', isNumber: true },
    { label: 'Vitamin E (mg)', key: 'vitaminE', isNumber: true },
    { label: 'Vitamin K (µg)', key: 'vitaminK', isNumber: true },
    { label: 'Thiamin (mg)', key: 'thiamin', isNumber: true },
    { label: 'Vitamin B12 (µg)', key: 'vitaminB12', isNumber: true },
    { label: 'Riboflavin (mg)', key: 'riboflavin', isNumber: true },
    { label: 'Folate (µg)', key: 'folate', isNumber: true },
    { label: 'Niacin (mg)', key: 'niacin', isNumber: true },
    { label: 'Choline (mg)', key: 'choline', isNumber: true },
    { label: 'Pantothenic Acid (mg)', key: 'pantothenicAcid', isNumber: true },
    { label: 'Biotin (µg)', key: 'biotin', isNumber: true },
    { label: 'Carotenoids (µg)', key: 'carotenoids', isNumber: true },
  ];

  const mineralFields = [
    { label: 'Calcium (mg)', key: 'calcium', isNumber: true },
    { label: 'Chloride (g)', key: 'chloride', isNumber: true },
    { label: 'Chromium (µg)', key: 'chromium', isNumber: true },
    { label: 'Copper (µg)', key: 'copper', isNumber: true },
    { label: 'Fluoride (mg)', key: 'fluoride', isNumber: true },
    { label: 'Iodine (µg)', key: 'iodine', isNumber: true },
    { label: 'Iron (mg)', key: 'iron', isNumber: true },
    { label: 'Magnesium (mg)', key: 'magnesium', isNumber: true },
    { label: 'Manganese (mg)', key: 'manganese', isNumber: true },
    { label: 'Molybdenum (µg)', key: 'molybdenum', isNumber: true },
    { label: 'Phosphorus (g)', key: 'phosphorus', isNumber: true },
    { label: 'Potassium (mg)', key: 'potassium', isNumber: true },
    { label: 'Selenium (µg)', key: 'selenium', isNumber: true },
    { label: 'Sodium (mg)', key: 'sodium', isNumber: true },
    { label: 'Zinc (mg)', key: 'zinc', isNumber: true },
  ];

  const handleChange = (key: string, value: string | number | boolean) => {
    setFood((prev) => ({ ...prev, [key]: value as any }));
  };

  const handleAddFood = async () => {
    if (!food.name || !food.calories) {
      Alert.alert('Missing fields', 'Please enter at least a name and calories.');
      return;
    }
    const now = Date.now();
    const newFood: FoodItem = {
      ...food,
      id: now.toString(),
      createdAt: now,
      updatedAt: now,
    };
    try {
      addFoodItem(newFood);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to add food item.');
    }
  };

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    setScanned(true);
    setShowScanner(false);

    const allFoods = getAllFoodItems();
    const existingFood = allFoods.find(food => food.barcode === result.data);

    if (existingFood) {
      showSnackbar('A food item with this barcode already exists!', 3000);
    } else {
      handleChange('barcode', result.data);
      showSnackbar('Barcode scanned successfully!', 1000);
    }
  };

  // Collapsible Section Component
  const CollapsibleSection = ({ 
    title, 
    isExpanded, 
    onToggle, 
    children,
    icon 
  }: { 
    title: string; 
    isExpanded: boolean; 
    onToggle: () => void; 
    children: React.ReactNode;
    icon?: keyof typeof Ionicons.glyphMap;
  }) => {
    const rotation = useSharedValue(isExpanded ? 180 : 0);

    React.useEffect(() => {
      rotation.value = withTiming(isExpanded ? 180 : 0, { duration: 300 });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isExpanded]);

    const animatedIconStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
      <View style={styles.sectionContainer}>
        <Pressable 
          style={[styles.sectionHeader, { backgroundColor: theme.surface.card }, shadows.sm]} 
          onPress={onToggle}
          android_ripple={{ color: theme.selection }}
        >
          <View style={styles.sectionHeaderContent}>
            {icon && <Ionicons name={icon} size={24} color={theme.primary} style={styles.sectionIcon} />}
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{title}</Text>
          </View>
          <ReanimatedAnimated.View style={animatedIconStyle}>
            <Ionicons name="chevron-down" size={24} color={theme.comment} />
          </ReanimatedAnimated.View>
        </Pressable>

        {isExpanded && (
          <View style={[styles.sectionContent, { backgroundColor: theme.surface.card }]}>
            {children}
          </View>
        )}
      </View>
    );
  };

  const renderInputField = (field: { label: string; key: string; isNumber: boolean }) => {
    const value = (food as any)[field.key];

    return (
      <View key={field.key} style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text.secondary }]}>{field.label}</Text>
        <View style={[styles.input, { backgroundColor: theme.surface.input }, shadows.sm]}>
          <TextInput
            style={[styles.textInput, { color: theme.foreground }]}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            placeholderTextColor={theme.comment}
            value={value?.toString() ?? ''}
            onChangeText={(v) => handleChange(field.key, field.isNumber ? parseFloat(v) || 0 : v)}
            keyboardType={field.isNumber ? 'decimal-pad' : 'default'}
          />
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: theme.foreground }]}>Add New Food</Text>
          <Text style={[styles.pageSubtitle, { color: theme.comment }]}>
            Enter nutritional information
          </Text>
        </View>

        {/* General Information */}
        <View style={[styles.card, { backgroundColor: theme.surface.card }, shadows.md]}>
          <Text style={[styles.cardTitle, { color: theme.foreground }]}>Basic Information</Text>
          
          {generalFields.slice(0, 2).map(renderInputField)}
          
          {/* Barcode field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Barcode (optional)</Text>
            <View style={styles.barcodeRow}>
              <View style={[styles.input, styles.barcodeInput, { backgroundColor: theme.surface.input }, shadows.sm]}>
                <TextInput
                  style={[styles.textInput, { color: theme.foreground }]}
                  placeholder="Scan or enter barcode"
                  placeholderTextColor={theme.comment}
                  value={food.barcode?.toString() ?? ''}
                  onChangeText={(v) => handleChange('barcode', v)}
                />
              </View>
              <Pressable
                style={[styles.scanButton, { backgroundColor: theme.primary }, shadows.sm]}
                onPress={() => setShowScanner(true)}
                android_ripple={{ color: theme.surface.elevated }}
              >
                <Ionicons name="barcode-outline" size={24} color={theme.text.inverse} />
              </Pressable>
            </View>
          </View>

          {/* Category Picker */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Category</Text>
            <View style={[styles.pickerWrapper, { backgroundColor: theme.surface.input }, shadows.sm]}>
              <Picker
                selectedValue={food.category}
                onValueChange={(itemValue) => handleChange('category', itemValue as FoodCategory)}
                style={styles.picker}
                dropdownIconColor={theme.foreground}
                mode="dialog"
              >
                {['vegetables', 'fruits', 'grains', 'proteins', 'dairy', 'fats', 'beverages', 'snacks', 'prepared', 'supplements', 'condiments', 'other'].map((cat) => (
                  <Picker.Item
                    label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                    value={cat}
                    key={cat}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Serving Information */}
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>Serving Size</Text>
              <View style={[styles.input, { backgroundColor: theme.surface.input }, shadows.sm]}>
                <TextInput
                  style={[styles.textInput, { color: theme.foreground }]}
                  placeholder="100"
                  placeholderTextColor={theme.comment}
                  value={food.servingSize?.toString() ?? ''}
                  onChangeText={(v) => handleChange('servingSize', parseFloat(v) || 0)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>Unit</Text>
              <View style={[styles.input, { backgroundColor: theme.surface.input }, shadows.sm]}>
                <TextInput
                  style={[styles.textInput, { color: theme.foreground }]}
                  placeholder="g"
                  placeholderTextColor={theme.comment}
                  value={food.servingUnit?.toString() ?? ''}
                  onChangeText={(v) => handleChange('servingUnit', v)}
                />
              </View>
            </View>
          </View>

          {/* Calories */}
          {renderInputField({ label: 'Calories', key: 'calories', isNumber: true })}
        </View>

        {/* Macronutrients */}
        <View style={[styles.card, { backgroundColor: theme.surface.card }, shadows.md]}>
          <Text style={[styles.cardTitle, { color: theme.foreground }]}>Macronutrients</Text>
          {macroFields.map(renderInputField)}
        </View>

        {/* Vitamins Section */}
        <CollapsibleSection 
          title="Vitamins (optional)" 
          isExpanded={showVitamins} 
          onToggle={() => setShowVitamins(!showVitamins)}
          icon="leaf-outline"
        >
          {vitaminFields.map(renderInputField)}
        </CollapsibleSection>

        {/* Minerals Section */}
        <CollapsibleSection 
          title="Minerals (optional)" 
          isExpanded={showMinerals} 
          onToggle={() => setShowMinerals(!showMinerals)}
          icon="diamond-outline"
        >
          {mineralFields.map(renderInputField)}
        </CollapsibleSection>

        {/* Submit Button */}
        <Pressable 
          style={[styles.addButton, { backgroundColor: theme.success }, shadows.md]} 
          onPress={handleAddFood}
          android_ripple={{ color: theme.surface.elevated }}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color={theme.text.inverse} style={styles.buttonIcon} />
          <Text style={[styles.addButtonText, { color: theme.text.inverse }]}>Add Food Item</Text>
        </Pressable>
      </ScrollView>

      {/* Camera Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showScanner}
        onRequestClose={() => setShowScanner(false)}
      >
        <View style={styles.scannerContainer}>
          {permission?.granted ? (
            <>
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              />
              {scanned && (
                <TouchableOpacity
                  style={[styles.scanAgainButton, { backgroundColor: theme.primary }, shadows.md]}
                  onPress={() => setScanned(false)}
                >
                  <Text style={[styles.scanAgainButtonText, { color: theme.text.inverse }]}>
                    Tap to Scan Again
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.danger }, shadows.md]}
                onPress={() => setShowScanner(false)}
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
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

  // Card Styles
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.lg,
  },

  // Section Styles (for collapsible sections)
  sectionContainer: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
    minHeight: 60,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    marginRight: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
  },
  sectionContent: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    paddingTop: spacing.md,
  },

  // Input Styles
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 52,
  },
  textInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputHalf: {
    flex: 1,
  },

  // Barcode Row
  barcodeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  barcodeInput: {
    flex: 1,
  },
  scanButton: {
    width: 56,
    height: 52,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Picker Styles
  pickerWrapper: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    minHeight: 52,
    justifyContent: 'center',
  },
  picker: {
    fontSize: typography.sizes.md,
    height: 52,
  },

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    minHeight: 56,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  addButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
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

export default AddFood;
