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

  type RenderTextInputProps = {
    label: string;
    fieldKey: string;
    group?: 'macronutrients' | 'vitamins' | 'minerals';
    isNumber?: boolean;
  };

  const RenderTextInput: React.FC<RenderTextInputProps> = ({ label, fieldKey, group, isNumber = false }) => {
    const value = group ? (food as any)[group]?.[fieldKey] : (food as any)[fieldKey];

    return (
      <View key={fieldKey}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={draculaTheme.text.secondary}
          value={value?.toString() ?? ''}
          onChangeText={(v) => handleChange(fieldKey, isNumber ? parseFloat(v) || 0 : v, group)}
          keyboardType={isNumber ? 'decimal-pad' : 'default'}
        />
      </View>
    );
  };

  const GeneralInputs: React.FC = () => (
    <>
      <RenderTextInput label="Name" fieldKey="name" />
      <RenderTextInput label="Brand" fieldKey="brand" />
      <RenderTextInput label="Barcode" fieldKey="barcode" />
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
      </View>
      <RenderTextInput label="Calories" fieldKey="calories" isNumber />
      <RenderTextInput label="Serving Size" fieldKey="servingSize" isNumber />
      <RenderTextInput label="Serving Unit" fieldKey="servingUnit" />
    </>
  );

  const MacronutrientsSection: React.FC = () => (
    <>
      <Text style={styles.subtitle}>Macronutrients</Text>
      <RenderTextInput label="Carbs (g)" fieldKey="carbs" group="macronutrients" isNumber />
      <RenderTextInput label="Fat (g)" fieldKey="fat" group="macronutrients" isNumber />
      <RenderTextInput label="Protein (g)" fieldKey="protein" group="macronutrients" isNumber />
      <RenderTextInput label="Fiber (g)" fieldKey="fiber" group="macronutrients" isNumber />
    </>
  );

  const VitaminsSection: React.FC = () => (
    <>
      <TouchableOpacity onPress={() => setShowVitamins(!showVitamins)}>
        <Text style={styles.subtitle}>Vitamins (optional)</Text>
      </TouchableOpacity>
      {showVitamins && (
        <>
          <RenderTextInput label="Vitamin A (µg)" fieldKey="vitaminA" group="vitamins" isNumber />
          <RenderTextInput label="Vitamin C (mg)" fieldKey="vitaminC" group="vitamins" isNumber />
          <RenderTextInput label="Vitamin D (µg)" fieldKey="vitaminD" group="vitamins" isNumber />
          <RenderTextInput label="Vitamin B6 (mg)" fieldKey="vitaminB6" group="vitamins" isNumber />
          <RenderTextInput label="Vitamin E (mg)" fieldKey="vitaminE" group="vitamins" isNumber />
          <RenderTextInput label="Vitamin K (µg)" fieldKey="vitaminK" group="vitamins" isNumber />
          <RenderTextInput label="Thiamin (mg)" fieldKey="thiamin" group="vitamins" isNumber />
          <RenderTextInput label="Vitamin B12 (µg)" fieldKey="vitaminB12" group="vitamins" isNumber />
          <RenderTextInput label="Riboflavin (mg)" fieldKey="riboflavin" group="vitamins" isNumber />
          <RenderTextInput label="Folate (µg)" fieldKey="folate" group="vitamins" isNumber />
          <RenderTextInput label="Niacin (mg)" fieldKey="niacin" group="vitamins" isNumber />
          <RenderTextInput label="Choline (g)" fieldKey="choline" group="vitamins" isNumber />
          <RenderTextInput label="Pantothenic Acid (mg)" fieldKey="pantothenicAcid" group="vitamins" isNumber />
          <RenderTextInput label="Biotin (µg)" fieldKey="biotin" group="vitamins" isNumber />
          <RenderTextInput label="Carotenoids" fieldKey="carotenoids" group="vitamins" isNumber />
        </>
      )}
    </>
  );

  const MineralsSection: React.FC = () => (
    <>
      <TouchableOpacity onPress={() => setShowMinerals(!showMinerals)}>
        <Text style={styles.subtitle}>Minerals (optional)</Text>
      </TouchableOpacity>
      {showMinerals && (
        <>
          <RenderTextInput label="Calcium (mg)" fieldKey="calcium" group="minerals" isNumber />
          <RenderTextInput label="Chloride (g)" fieldKey="chloride" group="minerals" isNumber />
          <RenderTextInput label="Chromium (µg)" fieldKey="chromium" group="minerals" isNumber />
          <RenderTextInput label="Copper (µg)" fieldKey="copper" group="minerals" isNumber />
          <RenderTextInput label="Fluoride (mg)" fieldKey="fluoride" group="minerals" isNumber />
          <RenderTextInput label="Iodine (µg)" fieldKey="iodine" group="minerals" isNumber />
          <RenderTextInput label="Iron (mg)" fieldKey="iron" group="minerals" isNumber />
          <RenderTextInput label="Magnesium (mg)" fieldKey="magnesium" group="minerals" isNumber />
          <RenderTextInput label="Manganese (mg)" fieldKey="manganese" group="minerals" isNumber />
          <RenderTextInput label="Molybdenum (µg)" fieldKey="molybdenum" group="minerals" isNumber />
          <RenderTextInput label="Phosphorus (g)" fieldKey="phosphorus" group="minerals" isNumber />
          <RenderTextInput label="Potassium (mg)" fieldKey="potassium" group="minerals" isNumber />
          <RenderTextInput label="Selenium (µg)" fieldKey="selenium" group="minerals" isNumber />
          <RenderTextInput label="Sodium (mg)" fieldKey="sodium" group="minerals" isNumber />
          <RenderTextInput label="Zinc (mg)" fieldKey="zinc" group="minerals" isNumber />
        </>
      )}
    </>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Add New Food</Text>
        <GeneralInputs />
        <MacronutrientsSection />
        <VitaminsSection />
        <MineralsSection />
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
