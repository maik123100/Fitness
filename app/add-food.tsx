import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { FoodItem, FoodCategory } from '@/types/types';
import { addFoodItem } from '@/services/database';
import { draculaTheme, spacing, borderRadius, typography, shadows } from '../styles/theme';

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

const AddFood: React.FC = () => {
  const router = useRouter();
  const [food, setFood] = useState<FoodItem>({ ...defaultFood });

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
      await addFoodItem(newFood);
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to add food item.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Add New Food</Text>
        <Text style={styles.label}>Food Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter food name"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.name}
          onChangeText={(v) => handleChange('name', v)}
        />
        <Text style={styles.label}>Brand</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter brand (optional)"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.brand}
          onChangeText={(v) => handleChange('brand', v)}
        />
        <Text style={styles.label}>Barcode</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter barcode (optional)"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.barcode}
          onChangeText={(v) => handleChange('barcode', v)}
        />
        <Text style={styles.label}>Food Category</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={food.category}
            onValueChange={(itemValue) => handleChange('category', itemValue as FoodCategory)}
            style={styles.picker}
            dropdownIconColor={draculaTheme.text.primary}
            mode="dropdown"
          >
            {['vegetables','fruits','grains','proteins','dairy','fats','beverages','snacks','prepared','supplements','condiments','other'].map((cat) => (
              <Picker.Item label={cat.charAt(0).toUpperCase() + cat.slice(1)} value={cat} key={cat} color={draculaTheme.text.primary} />
            ))}
          </Picker>
        </View>
        <Text style={styles.label}>Calories</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter calories"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.calories.toString()}
          onChangeText={(v) => handleChange('calories', parseFloat(v) || 0)}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Protein (g)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter protein in grams"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.protein.toString()}
          onChangeText={(v) => handleChange('protein', parseFloat(v) || 0)}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Carbs (g)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter carbs in grams"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.carbs.toString()}
          onChangeText={(v) => handleChange('carbs', parseFloat(v) || 0)}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Fat (g)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter fat in grams"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.fat.toString()}
          onChangeText={(v) => handleChange('fat', parseFloat(v) || 0)}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Fiber (g)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter fiber in grams"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.fiber.toString()}
          onChangeText={(v) => handleChange('fiber', parseFloat(v) || 0)}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Sugar (g)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter sugar in grams"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.sugar.toString()}
          onChangeText={(v) => handleChange('sugar', parseFloat(v) || 0)}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Sodium (mg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter sodium in mg"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.sodium.toString()}
          onChangeText={(v) => handleChange('sodium', parseFloat(v) || 0)}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Cholesterol (mg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter cholesterol in mg"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.cholesterol.toString()}
          onChangeText={(v) => handleChange('cholesterol', parseFloat(v) || 0)}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Saturated Fat (g)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter saturated fat in grams"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.saturatedFat.toString()}
          onChangeText={(v) => handleChange('saturatedFat', parseFloat(v) || 0)}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Trans Fat (g)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter trans fat in grams"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.transFat.toString()}
          onChangeText={(v) => handleChange('transFat', parseFloat(v) || 0)}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Vitamin A (mg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter vitamin A in mg"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.vitaminA?.toString() ?? ''}
          onChangeText={(v) => handleChange('vitaminA', parseFloat(v) || 0)}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Vitamin C (mg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter vitamin C in mg"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.vitaminC?.toString() ?? ''}
          onChangeText={(v) => handleChange('vitaminC', parseFloat(v) || 0)}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Vitamin D (mg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter vitamin D in mg"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.vitaminD?.toString() ?? ''}
          onChangeText={(v) => handleChange('vitaminD', parseFloat(v) || 0)}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Calcium (mg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter calcium in mg"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.calcium?.toString() ?? ''}
          onChangeText={(v) => handleChange('calcium', parseFloat(v) || 0)}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Iron (mg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter iron in mg"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.iron?.toString() ?? ''}
          onChangeText={(v) => handleChange('iron', parseFloat(v) || 0)}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Potassium (mg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter potassium in mg"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.potassium?.toString() ?? ''}
          onChangeText={(v) => handleChange('potassium', parseFloat(v) || 0)}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Serving Size</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter serving size"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.servingSize.toString()}
          onChangeText={(v) => handleChange('servingSize', parseFloat(v) || 0)}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Serving Unit</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. g, ml, piece"
          placeholderTextColor={draculaTheme.text.secondary}
          value={food.servingUnit}
          onChangeText={(v) => handleChange('servingUnit', v)}
        />
        <View style={styles.switchRow}>
          <Text style={styles.label}>Is Verified?</Text>
          <TouchableOpacity
            style={[styles.verifyBtn, food.isVerified && styles.verifyBtnActive]}
            onPress={() => handleChange('isVerified', !food.isVerified)}
          >
            <Text style={styles.verifyText}>{food.isVerified ? 'Yes' : 'No'}</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: typography.sizes.md,
    height: 48,
    width: '100%',
    backgroundColor: draculaTheme.surface.input,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  verifyBtn: {
    backgroundColor: draculaTheme.surface.secondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginLeft: spacing.sm,
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
});

export default AddFood;
