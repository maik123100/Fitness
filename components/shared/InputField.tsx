import { useTheme } from '@/app/contexts/ThemeContext';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon?: keyof typeof Ionicons.glyphMap;
  keyboardType?: 'default' | 'numeric';
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType = 'default',
}: InputFieldProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: theme.text.secondary }]}>{label}</Text>
      <View style={[styles.input, { backgroundColor: theme.surface.input, borderColor: theme.surface.secondary }, shadows.sm]}>
        {icon && <Ionicons name={icon} size={20} color={theme.comment} style={styles.inputIcon} />}
        <TextInput
          style={[styles.textInput, { color: theme.foreground }]}
          placeholder={placeholder}
          placeholderTextColor={theme.comment}
          keyboardType={keyboardType}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
  },
});
