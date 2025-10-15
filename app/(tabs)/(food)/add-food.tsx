import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FoodItem, FoodCategory } from '@/types/types';
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
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
  cholesterol: 0,
  saturatedFat: 0,
  transFat: 0,
  vitaminA: 0,
  vitaminC: 0,
  vitaminD: 0,
  calcium: 0,
  iron: 0,
  potassium: 0,
  servingSize: 100,
  servingUnit: 'g',
  isVerified: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const foodItemKeys = Object.keys(defaultFood) as (keyof FoodItem)[];

const AddFood: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showSnackbar } = useSnackbar();
  const [food, setFood] = useState<FoodItem>({ ...defaultFood });
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);



  const handleChange = (key: keyof FoodItem, value: string | number | boolean) => {
    setFood((prev) => ({ ...prev, [key]: value }));
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

  const renderInput = (key: keyof FoodItem) => {
    const value = food[key];
    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');

    if (['id', 'createdAt', 'updatedAt'].includes(key)) {
      return null;
    }

    if (key === 'category') {
      return (
        <View key={key}>
          <Text style={styles.label}>{label}</Text>
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
      );
    }

    if (typeof value === 'boolean') {
      return (
        <View key={key} style={styles.switchRow}>
          <Text style={styles.label}>{label}</Text>
          <TouchableOpacity
            style={[styles.verifyBtn, food.isVerified && styles.verifyBtnActive]}
            onPress={() => handleChange(key, !value)}
          >
            <Text style={styles.verifyText}>{value ? 'Yes' : 'No'}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View key={key}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={draculaTheme.text.secondary}
          value={value?.toString() ?? ''}
          onChangeText={(v) => {
            const numericKeys: (keyof FoodItem)[] = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium', 'cholesterol', 'saturatedFat', 'transFat', 'vitaminA', 'vitaminC', 'vitaminD', 'calcium', 'iron', 'potassium', 'servingSize'];
            if (numericKeys.includes(key)) {
              handleChange(key, parseFloat(v) || 0);
            } else {
              handleChange(key, v);
            }
          }}
          keyboardType={typeof value === 'number' ? 'decimal-pad' : 'default'}
        />
        {key === 'barcode' && (
          <TouchableOpacity style={styles.scanButton} onPress={() => setShowScanner(true)}>
            <Text style={styles.scanButtonText}>Scan Barcode</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Add New Food</Text>
        {foodItemKeys.map(renderInput)}
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  verifyBtn: {
    backgroundColor: draculaTheme.surface.secondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  verifyBtnActive: {
    backgroundColor: draculaTheme.success,
  },
  verifyText: {
    color: draculaTheme.text.primary,
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