import { useTheme } from '@/app/contexts/ThemeContext';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function ThemeSection() {
  const { theme, themeName, setTheme } = useTheme();

  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: theme.text.secondary }]}>App Theme</Text>
      <View style={styles.themeSelector}>
        <Pressable
          style={[
            styles.themeOption,
            { backgroundColor: theme.surface.input },
            themeName === 'dracula' && [styles.themeOptionActive, { backgroundColor: theme.primary }],
            shadows.sm
          ]}
          onPress={() => setTheme('dracula')}
        >
          <Ionicons 
            name="moon" 
            size={20} 
            color={themeName === 'dracula' ? theme.text.inverse : theme.comment} 
            style={styles.themeIcon}
          />
          <Text 
            style={[
              styles.themeText, 
              { color: theme.foreground },
              themeName === 'dracula' && { color: theme.text.inverse, fontWeight: typography.weights.semibold }
            ]}
          >
            Dark
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.themeOption,
            { backgroundColor: theme.surface.input },
            themeName === 'light' && [styles.themeOptionActive, { backgroundColor: theme.primary }],
            shadows.sm
          ]}
          onPress={() => setTheme('light')}
        >
          <Ionicons 
            name="sunny" 
            size={20} 
            color={themeName === 'light' ? theme.text.inverse : theme.comment}
            style={styles.themeIcon}
          />
          <Text 
            style={[
              styles.themeText, 
              { color: theme.foreground },
              themeName === 'light' && { color: theme.text.inverse, fontWeight: typography.weights.semibold }
            ]}
          >
            Light
          </Text>
        </Pressable>
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
  themeSelector: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 52,
  },
  themeOptionActive: {},
  themeIcon: {
    marginRight: spacing.sm,
  },
  themeText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
  },
});
