import { useTheme } from '@/contexts/ThemeContext';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

interface FoodSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onScan: () => void;
}

export function FoodSearchBar({ value, onChange, onScan }: FoodSearchBarProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.inputWrap, { backgroundColor: theme.surface.input }, shadows.sm]}>
        <Ionicons name="search-outline" size={20} color={theme.comment} style={styles.searchIcon} />
        <TextInput
          style={[styles.input, { color: theme.foreground }]}
          placeholder="Search for food..."
          placeholderTextColor={theme.comment}
          value={value}
          onChangeText={onChange}
          autoFocus
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChange('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={theme.comment} />
          </Pressable>
        )}
      </View>
      <Pressable
        style={[styles.scanButton, { backgroundColor: theme.primary }, shadows.sm]}
        onPress={onScan}
        android_ripple={{ color: theme.surface.elevated }}
      >
        <Ionicons name="barcode-outline" size={24} color={theme.text.inverse} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.md },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, borderRadius: borderRadius.lg, minHeight: 56 },
  searchIcon: { marginRight: spacing.sm },
  input: { flex: 1, fontSize: typography.sizes.md, fontWeight: typography.weights.regular },
  clearButton: { padding: spacing.xs },
  scanButton: { width: 56, height: 56, borderRadius: borderRadius.lg, justifyContent: 'center', alignItems: 'center' },
});
