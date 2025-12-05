import { useTheme } from '@/app/contexts/ThemeContext';
import { MEAL_ICONS, MEAL_LABELS, MEAL_TYPES } from '@/constants/foodConstants';
import { MealType } from '@/services/db/schema';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { StyleSheet, Text, View } from 'react-native';

interface MealTypePickerProps {
  value: MealType;
  onChange: (mealType: MealType) => void;
  label?: string;
}

export function MealTypePicker({ value, onChange, label = 'Meal Type' }: MealTypePickerProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text.secondary }]}>{label}</Text>
      <View style={[styles.pickerContainer, { backgroundColor: theme.surface.input }, shadows.sm]}>
        <Ionicons 
          name={MEAL_ICONS[value]} 
          size={20} 
          color={theme.comment} 
          style={styles.icon} 
        />
        <Picker
          selectedValue={value}
          onValueChange={(itemValue) => onChange(itemValue as MealType)}
          style={[styles.picker, { color: theme.foreground }]}
          dropdownIconColor={theme.comment}
        >
          {MEAL_TYPES.map((mealType) => (
            <Picker.Item 
              key={mealType} 
              label={MEAL_LABELS[mealType]} 
              value={mealType} 
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  icon: {
    marginRight: spacing.sm,
  },
  picker: {
    flex: 1,
  },
});
