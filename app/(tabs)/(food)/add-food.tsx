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

  const renderTextInput = (label: string, key: string, group?: 'macronutrients' | 'vitamins' | 'minerals', isNumber: boolean = false) => {
    const value = group ? (food as any)[group][key] : (food as any)[key];
    return (
      <View key={key}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={draculaTheme.text.secondary}
          value={value?.toString() ?? ''}
          onChangeText={(v) => handleChange(key, isNumber ? parseFloat(v) || 0 : v, group)}
          keyboardType={isNumber ? 'decimal-pad' : 'default'}
        />
      </View>
    );
  };

  const renderGeneralInputs = () => (
    <>
      {renderTextInput('Name', 'name')}
      {renderTextInput('Brand', 'brand')}
      {renderTextInput('Barcode', 'barcode')}
      <TouchableOpacity style={styles.scanButton} onPress={() => setShowScanner(true)}>
        <Text style={styles.scanButtonText}>Scan Barcode</Text>
      </TouchableOpacity>
      <View>
        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={food.category}
            onValueChange={(itemValue) => handleChange('category', itemValue as FoodCategory)}
            style={styles.picker}
            dropdownIconColor={draculaTheme.text.primary}
            mode="dialog"
          >
            {['vegetables', 'fruits', 'grains', 'proteins', 'dairy', 'fats', 'beverages', 'snacks', 'prepared', 'supplements', 'condiments', 'other'].map((cat) => (
              <Picker.Item
                label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                value={cat}
                key={cat}
                style={{ backgroundColor: draculaTheme.surface.input, color: draculaTheme.text.primary }}
              />
            ))}
          </Picker>
        </View>
      </View>
      {renderTextInput('Calories', 'calories', undefined, true)}
      {renderTextInput('Serving Size', 'servingSize', undefined, true)}
      {renderTextInput('Serving Unit', 'servingUnit')}
    </>
  );

  const renderMacronutrients = () => (
    <>
      <Text style={styles.subtitle}>Macronutrients</Text>
      {renderTextInput('Carbs (g)', 'carbs', 'macronutrients', true)}
      {renderTextInput('Fat (g)', 'fat', 'macronutrients', true)}
      {renderTextInput('Protein (g)', 'protein', 'macronutrients', true)}
      {renderTextInput('Fiber (g)', 'fiber', 'macronutrients', true)}
    </>
  );

  const renderVitamins = () => (
    <>
      <TouchableOpacity onPress={() => setShowVitamins(!showVitamins)}>
        <Text style={styles.subtitle}>Vitamins (optional)</Text>
      </TouchableOpacity>
      {showVitamins && (
        <>
          {renderTextInput('Vitamin A (µg)', 'vitaminA', 'vitamins', true)}
          {renderTextInput('Vitamin C (mg)', 'vitaminC', 'vitamins', true)}
          {renderTextInput('Vitamin D (µg)', 'vitaminD', 'vitamins', true)}
          {renderTextInput('Vitamin B6 (mg)', 'vitaminB6', 'vitamins', true)}
          {renderTextInput('Vitamin E (mg)', 'vitaminE', 'vitamins', true)}
          {renderTextInput('Vitamin K (µg)', 'vitaminK', 'vitamins', true)}
          {renderTextInput('Thiamin (mg)', 'thiamin', 'vitamins', true)}
          {renderTextInput('Vitamin B12 (µg)', 'vitaminB12', 'vitamins', true)}
          {renderTextInput('Riboflavin (mg)', 'riboflavin', 'vitamins', true)}
          {renderTextInput('Folate (µg)', 'folate', 'vitamins', true)}
          {renderTextInput('Niacin (mg)', 'niacin', 'vitamins', true)}
          {renderTextInput('Choline (g)', 'choline', 'vitamins', true)}
          {renderTextInput('Pantothenic Acid (mg)', 'pantothenicAcid', 'vitamins', true)}
          {renderTextInput('Biotin (µg)', 'biotin', 'vitamins', true)}
          {renderTextInput('Carotenoids', 'carotenoids', 'vitamins', true)}
        </>
      )}
    </>
  );

  const renderMinerals = () => (
    <>
      <TouchableOpacity onPress={() => setShowMinerals(!showMinerals)}>
        <Text style={styles.subtitle}>Minerals (optional)</Text>
      </TouchableOpacity>
      {showMinerals && (
        <>
          {renderTextInput('Calcium (mg)', 'calcium', 'minerals', true)}
          {renderTextInput('Chloride (g)', 'chloride', 'minerals', true)}
          {renderTextInput('Chromium (µg)', 'chromium', 'minerals', true)}
          {renderTextInput('Copper (µg)', 'copper', 'minerals', true)}
          {renderTextInput('Fluoride (mg)', 'fluoride', 'minerals', true)}
          {renderTextInput('Iodine (µg)', 'iodine', 'minerals', true)}
          {renderTextInput('Iron (mg)', 'iron', 'minerals', true)}
          {renderTextInput('Magnesium (mg)', 'magnesium', 'minerals', true)}
          {renderTextInput('Manganese (mg)', 'manganese', 'minerals', true)}
          {renderTextInput('Molybdenum (µg)', 'molybdenum', 'minerals', true)}
          {renderTextInput('Phosphorus (g)', 'phosphorus', 'minerals', true)}
          {renderTextInput('Potassium (mg)', 'potassium', 'minerals', true)}
          {renderTextInput('Selenium (µg)', 'selenium', 'minerals', true)}
          {renderTextInput('Sodium (mg)', 'sodium', 'minerals', true)}
          {renderTextInput('Zinc (mg)', 'zinc', 'minerals', true)}
        </>
      )}
    </>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Add New Food</Text>
        {renderGeneralInputs()}
        {renderMacronutrients()}
        {renderVitamins()}
        {renderMinerals()}
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
    marginTop: spacing.lg,
    marginBottom: spacing.md,
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