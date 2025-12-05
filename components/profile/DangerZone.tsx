import { useTheme } from '@/app/contexts/ThemeContext';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface DangerZoneProps {
  onResetOnboarding: () => void;
  onResetDatabase: () => void;
}

export function DangerZone({ onResetOnboarding, onResetDatabase }: DangerZoneProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface.card, borderColor: theme.danger }, shadows.sm]}>
      <View style={styles.header}>
        <Ionicons name="warning-outline" size={24} color={theme.danger} style={styles.icon} />
        <Text style={[styles.title, { color: theme.danger }]}>Danger Zone</Text>
      </View>
      <Text style={[styles.description, { color: theme.comment }]}>
        Irreversible actions that will affect your data
      </Text>
      
      <Pressable 
        style={[styles.button, { backgroundColor: theme.background, borderColor: theme.orange }]} 
        onPress={onResetOnboarding}
      >
        <Ionicons name="refresh-outline" size={20} color={theme.orange} style={styles.buttonIcon} />
        <Text style={[styles.buttonText, { color: theme.orange }]}>Reset Onboarding</Text>
      </Pressable>

      <Pressable 
        style={[styles.button, { backgroundColor: theme.background, borderColor: theme.danger }]} 
        onPress={onResetDatabase}
      >
        <Ionicons name="trash-outline" size={20} color={theme.danger} style={styles.buttonIcon} />
        <Text style={[styles.buttonText, { color: theme.danger }]}>Reset Database</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  icon: {
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  description: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    marginBottom: spacing.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    borderWidth: 1.5,
    minHeight: 52,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  buttonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
