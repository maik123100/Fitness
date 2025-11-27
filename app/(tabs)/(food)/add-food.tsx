import { useSnackbar } from '@/app/components/SnackbarProvider';
import { useTheme } from '@/app/contexts/ThemeContext';
import { addFoodItem, getAllFoodItems } from '@/services/database';
import { FoodCategory, FoodItem } from '@/services/db/schema';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import { Picker } from '@react-native-picker/picker';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


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

  const renderInputField = (field: { label: string; key: string; isNumber: boolean }) => {
    const value = (food as any)[field.key];

    return (
      <View key={field.key}>
        <Text style={[styles.label, { color: theme.foreground }]}>{field.label}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface.input, color: theme.foreground }]}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          placeholderTextColor={theme.text.secondary}
          value={value?.toString() ?? ''}
          onChangeText={(v) => handleChange(field.key, field.isNumber ? parseFloat(v) || 0 : v)}
          keyboardType={field.isNumber ? 'decimal-pad' : 'default'}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.subtitle, { color: theme.foreground }]}>Add New Food</Text>

        {/* General Fields */}
        {generalFields.slice(0, 2).map(renderInputField)}

        {/* Barcode field (without scanner for now, shown below) */}
        {renderInputField({ label: 'Barcode', key: 'barcode', isNumber: false })}

        {/* Barcode Scanner Button */}
        <TouchableOpacity style={[styles.scanButton, { backgroundColor: theme.cyan }]} onPress={() => setShowScanner(true)}>
          <Text style={[styles.scanButtonText, { color: theme.text.inverse }]}>Scan Barcode</Text>
        </TouchableOpacity>

        {/* Category Picker */}
        <Text style={[styles.label, { color: theme.foreground }]}>Category</Text>
        <View style={[styles.pickerWrapper, { backgroundColor: theme.surface.input }]}>
          <Picker
            selectedValue={food.category}
            onValueChange={(itemValue) => handleChange('category', itemValue as FoodCategory)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            dropdownIconColor={theme.text.primary}
            mode="dialog"
          >
            {['vegetables', 'fruits', 'grains', 'proteins', 'dairy', 'fats', 'beverages', 'snacks', 'prepared', 'supplements', 'condiments', 'other'].map((cat) => (
              <Picker.Item
                label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                value={cat}
                key={cat}
                color={theme.text.primary}
                style={{ color: theme.text.primary, backgroundColor: theme.surface.input }}
              />
            ))}
          </Picker>
        </View>

        {/* Remaining general fields (Calories, Serving Size, Serving Unit) */}
        {generalFields.slice(2).map(renderInputField)}

        {/* Macronutrients */}
        <Text style={[styles.subtitle, { color: theme.foreground }]}>Macronutrients</Text>
        {macroFields.map(renderInputField)}

        {/* Vitamins Section */}
        <TouchableOpacity onPress={() => setShowVitamins(!showVitamins)}>
          <Text style={[styles.subtitle, { color: theme.foreground }]}>Vitamins (optional)</Text>
        </TouchableOpacity>
        {showVitamins && vitaminFields.map(renderInputField)}

        {/* Minerals Section */}
        <TouchableOpacity onPress={() => setShowMinerals(!showMinerals)}>
          <Text style={[styles.subtitle, { color: theme.foreground }]}>Minerals (optional)</Text>
        </TouchableOpacity>
        {showMinerals && mineralFields.map(renderInputField)}

        {/* Submit Button */}
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.green }]} onPress={handleAddFood}>
          <Text style={[styles.addBtnText, { color: theme.text.inverse }]}>Add Food</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  label: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: typography.sizes.md,
    borderWidth: 1,
  },
  pickerWrapper: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    fontSize: typography.sizes.md,
    height: 58,
    width: '100%',
  },
  pickerItem: {
    fontSize: typography.sizes.md,
  },
  addBtn: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadows.md,
  },
  addBtnText: {
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
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scanButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});

export default AddFood;
