import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FoodItem, FoodCategory, Macronutrients, Vitamins, Minerals } from '@/types/types';
import { addFoodItem, getAllFoodItems } from '@/services/database';
import { draculaTheme, spacing, borderRadius, typography, shadows } from '@/styles/theme';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';

import { useSnackbar } from '@/app/components/SnackbarProvider';

const defaultFood: FoodItem = {
  id: Date.now().toString(),
  name: '',
  brand: '',
  barcode: '',
  category: 'other',
  calories: 0,
  macronutrients: {
    carbs: 0,
    fat: 0,
    protein: 0,
    fiber: 0,
  },
  vitamins: {},
  minerals: {},
  servingSize: 100,
  servingUnit: 'g',
  isVerified: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const AddFood: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    { label: 'Protein (g)', key: 'protein', group: 'macronutrients' as const, isNumber: true },
    { label: 'Carbs (g)', key: 'carbs', group: 'macronutrients' as const, isNumber: true },
    { label: 'Fat (g)', key: 'fat', group: 'macronutrients' as const, isNumber: true },
    { label: 'Fiber (g)', key: 'fiber', group: 'macronutrients' as const, isNumber: true },
  ];

  const vitaminFields = [
    { label: 'Vitamin A (µg)', key: 'vitaminA', group: 'vitamins' as const, isNumber: true },
    { label: 'Vitamin C (mg)', key: 'vitaminC', group: 'vitamins' as const, isNumber: true },
    { label: 'Vitamin D (µg)', key: 'vitaminD', group: 'vitamins' as const, isNumber: true },
    { label: 'Vitamin B6 (mg)', key: 'vitaminB6', group: 'vitamins' as const, isNumber: true },
    { label: 'Vitamin E (mg)', key: 'vitaminE', group: 'vitamins' as const, isNumber: true },
    { label: 'Vitamin K (µg)', key: 'vitaminK', group: 'vitamins' as const, isNumber: true },
    { label: 'Thiamin (mg)', key: 'thiamin', group: 'vitamins' as const, isNumber: true },
    { label: 'Vitamin B12 (µg)', key: 'vitaminB12', group: 'vitamins' as const, isNumber: true },
    { label: 'Riboflavin (mg)', key: 'riboflavin', group: 'vitamins' as const, isNumber: true },
    { label: 'Folate (µg)', key: 'folate', group: 'vitamins' as const, isNumber: true },
    { label: 'Niacin (mg)', key: 'niacin', group: 'vitamins' as const, isNumber: true },
    { label: 'Choline (mg)', key: 'choline', group: 'vitamins' as const, isNumber: true },
    { label: 'Pantothenic Acid (mg)', key: 'pantothenicAcid', group: 'vitamins' as const, isNumber: true },
    { label: 'Biotin (µg)', key: 'biotin', group: 'vitamins' as const, isNumber: true },
    { label: 'Carotenoids (µg)', key: 'carotenoids', group: 'vitamins' as const, isNumber: true },
  ];

  const mineralFields = [
    { label: 'Calcium (mg)', key: 'calcium', group: 'minerals' as const, isNumber: true },
    { label: 'Chloride (g)', key: 'chloride', group: 'minerals' as const, isNumber: true },
    { label: 'Chromium (µg)', key: 'chromium', group: 'minerals' as const, isNumber: true },
    { label: 'Copper (µg)', key: 'copper', group: 'minerals' as const, isNumber: true },
    { label: 'Fluoride (mg)', key: 'fluoride', group: 'minerals' as const, isNumber: true },
    { label: 'Iodine (µg)', key: 'iodine', group: 'minerals' as const, isNumber: true },
    { label: 'Iron (mg)', key: 'iron', group: 'minerals' as const, isNumber: true },
    { label: 'Magnesium (mg)', key: 'magnesium', group: 'minerals' as const, isNumber: true },
    { label: 'Manganese (mg)', key: 'manganese', group: 'minerals' as const, isNumber: true },
    { label: 'Molybdenum (µg)', key: 'molybdenum', group: 'minerals' as const, isNumber: true },
    { label: 'Phosphorus (g)', key: 'phosphorus', group: 'minerals' as const, isNumber: true },
    { label: 'Potassium (mg)', key: 'potassium', group: 'minerals' as const, isNumber: true },
    { label: 'Selenium (µg)', key: 'selenium', group: 'minerals' as const, isNumber: true },
    { label: 'Sodium (mg)', key: 'sodium', group: 'minerals' as const, isNumber: true },
    { label: 'Zinc (mg)', key: 'zinc', group: 'minerals' as const, isNumber: true },
  ];

  const handleChange = (
    key: string,
    value: string | number | boolean,
    group?: 'macronutrients' | 'vitamins' | 'minerals'
  ) => {
    if (group) {
      setFood((prev) => ({
        ...prev,
        [group]: {
          ...prev[group],
          [key]: value,
        },
      }));
    } else {
      setFood((prev) => ({ ...prev, [key]: value as any }));
    }
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
    } catch (err) {
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

  if (showScanner) {
    if (!permission) {
      // Camera permissions are still loading
      return <View />;
    }

    if (!permission.granted) {
      // Camera permissions are not granted yet
      return (
        <View style={styles.container}>
          <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
          <Button onPress={requestPermission} title="grant permission" />
        </View>
      );
    }

    return (
      <View style={styles.scannerContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
        <TouchableOpacity style={styles.closeButton} onPress={() => setShowScanner(false)}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderInputField = (field: { label: string; key: string; group?: 'macronutrients' | 'vitamins' | 'minerals'; isNumber: boolean }) => {
    const value = field.group ? (food as any)[field.group]?.[field.key] : (food as any)[field.key];
    
    return (
      <View key={`${field.group || 'general'}-${field.key}`}>
        <Text style={styles.label}>{field.label}</Text>
        <TextInput
          style={styles.input}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          placeholderTextColor={draculaTheme.text.secondary}
          value={value?.toString() ?? ''}
          onChangeText={(v) => handleChange(field.key, field.isNumber ? parseFloat(v) || 0 : v, field.group)}
          keyboardType={field.isNumber ? 'decimal-pad' : 'default'}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Add New Food</Text>
        
        {/* General Fields */}
        {generalFields.slice(0, 2).map(renderInputField)}
        
        {/* Barcode field (without scanner for now, shown below) */}
        {renderInputField({ label: 'Barcode', key: 'barcode', isNumber: false })}
        
        {/* Barcode Scanner Button */}
        <TouchableOpacity style={styles.scanButton} onPress={() => setShowScanner(true)}>
          <Text style={styles.scanButtonText}>Scan Barcode</Text>
        </TouchableOpacity>

        {/* Category Picker */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={food.category}
            onValueChange={(itemValue) => handleChange('category', itemValue as FoodCategory)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            dropdownIconColor={draculaTheme.text.primary}
            mode="dialog"
          >
            {['vegetables', 'fruits', 'grains', 'proteins', 'dairy', 'fats', 'beverages', 'snacks', 'prepared', 'supplements', 'condiments', 'other'].map((cat) => (
              <Picker.Item
                label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                value={cat}
                key={cat}
                color={draculaTheme.text.primary}
                style={{ color: draculaTheme.text.primary, backgroundColor: draculaTheme.surface.input }}
              />
            ))}
          </Picker>
        </View>

        {/* Remaining general fields (Calories, Serving Size, Serving Unit) */}
        {generalFields.slice(2).map(renderInputField)}

        {/* Macronutrients */}
        <Text style={styles.subtitle}>Macronutrients</Text>
        {macroFields.map(renderInputField)}

        {/* Vitamins Section */}
        <TouchableOpacity onPress={() => setShowVitamins(!showVitamins)}>
          <Text style={styles.subtitle}>Vitamins (optional)</Text>
        </TouchableOpacity>
        {showVitamins && vitaminFields.map(renderInputField)}

        {/* Minerals Section */}
        <TouchableOpacity onPress={() => setShowMinerals(!showMinerals)}>
          <Text style={styles.subtitle}>Minerals (optional)</Text>
        </TouchableOpacity>
        {showMinerals && mineralFields.map(renderInputField)}

        {/* Submit Button */}
        <TouchableOpacity style={styles.addBtn} onPress={handleAddFood}>
          <Text style={styles.addBtnText}>Add Food</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: draculaTheme.background,
  },
  scrollContent: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    color: draculaTheme.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: draculaTheme.text.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  label: {
    color: draculaTheme.text.secondary,
    fontSize: typography.sizes.md,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: draculaTheme.surface.input,
    color: draculaTheme.text.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: typography.sizes.md,
    borderWidth: 1,
    borderColor: draculaTheme.surface.secondary,
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
    color: draculaTheme.text.primary,
    backgroundColor: draculaTheme.surface.input,
    fontSize: typography.sizes.md,
    height: 58,
    width: '100%',
  },
  pickerItem: {
    color: draculaTheme.text.primary,
    backgroundColor: draculaTheme.surface.input,
    fontSize: typography.sizes.md,
  },
  addBtn: {
    backgroundColor: draculaTheme.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadows.md,
  },
  addBtnText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  scannerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
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
  scanButton: {
    backgroundColor: draculaTheme.cyan,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scanButtonText: {
    color: draculaTheme.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});

export default AddFood;
