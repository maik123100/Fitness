import { useTheme } from '@/app/contexts/ThemeContext';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface QuantityPickerProps {
  value: string;
  onChange: (value: string) => void;
  unit: string;
  step?: number;
  label?: string;
}

export function QuantityPicker({ 
  value, 
  onChange, 
  unit, 
  step = 10,
  label = 'Quantity' 
}: QuantityPickerProps) {
  const { theme } = useTheme();

  const handleIncrement = (amount: number) => {
    const currentValue = parseFloat(value) || 0;
    const newValue = Math.max(0, currentValue + amount);
    onChange(newValue.toString());
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text.secondary }]}>{label}</Text>
      
      <View style={styles.pickerRow}>
        {/* Quick decrease buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: theme.surface.input }, shadows.sm]}
            onPress={() => handleIncrement(-100)}
          >
            <Text style={[styles.quickButtonText, { color: theme.foreground }]}>-100</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: theme.surface.input }, shadows.sm]}
            onPress={() => handleIncrement(-10)}
          >
            <Text style={[styles.quickButtonText, { color: theme.foreground }]}>-10</Text>
          </TouchableOpacity>
        </View>

        {/* Input field */}
        <View style={[styles.inputContainer, { backgroundColor: theme.surface.input }, shadows.sm]}>
          <TextInput
            style={[styles.input, { color: theme.foreground }]}
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={theme.comment}
          />
          <Text style={[styles.unit, { color: theme.comment }]}>{unit}</Text>
        </View>

        {/* Quick increase buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: theme.surface.input }, shadows.sm]}
            onPress={() => handleIncrement(10)}
          >
            <Text style={[styles.quickButtonText, { color: theme.foreground }]}>+10</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: theme.surface.input }, shadows.sm]}
            onPress={() => handleIncrement(100)}
          >
            <Text style={[styles.quickButtonText, { color: theme.foreground }]}>+100</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Large increment buttons */}
      <View style={styles.largeButtonRow}>
        <TouchableOpacity
          style={[styles.largeButton, { backgroundColor: theme.danger }, shadows.sm]}
          onPress={() => handleIncrement(-step)}
        >
          <Ionicons name="remove" size={24} color={theme.text.inverse} />
          <Text style={[styles.largeButtonText, { color: theme.text.inverse }]}>-{step}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.largeButton, { backgroundColor: theme.success }, shadows.sm]}
          onPress={() => handleIncrement(step)}
        >
          <Ionicons name="add" size={24} color={theme.text.inverse} />
          <Text style={[styles.largeButtonText, { color: theme.text.inverse }]}>+{step}</Text>
        </TouchableOpacity>
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
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  buttonGroup: {
    gap: spacing.xs,
  },
  quickButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 60,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  unit: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.sm,
  },
  largeButtonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  largeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    minHeight: 52,
  },
  largeButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
});
