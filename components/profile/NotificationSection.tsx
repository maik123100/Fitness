import { useTheme } from '@/app/contexts/ThemeContext';
import { MealTypeMain } from '@/services/notificationService';
import { borderRadius, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface NotificationSectionProps {
  notificationSettings: {
    breakfast: { enabled: boolean; hour: number; minute: number };
    lunch: { enabled: boolean; hour: number; minute: number };
    dinner: { enabled: boolean; hour: number; minute: number };
  };
  onToggleNotification: (mealType: MealTypeMain, enabled: boolean) => void;
  onOpenTimePicker: (mealType: MealTypeMain) => void;
  onTestNotification: (mealType: MealTypeMain) => void;
}

export function NotificationSection({
  notificationSettings,
  onToggleNotification,
  onOpenTimePicker,
  onTestNotification,
}: NotificationSectionProps) {
  const { theme } = useTheme();

  const formatTime = (hour: number, minute: number): string => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${ampm}`;
  };

  const mealConfig: Array<{
    type: MealTypeMain;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
  }> = [
    { type: 'breakfast', label: 'Breakfast', icon: 'sunny-outline', iconColor: theme.orange },
    { type: 'lunch', label: 'Lunch', icon: 'partly-sunny-outline', iconColor: theme.yellow },
    { type: 'dinner', label: 'Dinner', icon: 'moon-outline', iconColor: theme.purple },
  ];

  return (
    <View style={styles.container}>
      {mealConfig.map(({ type, label, icon, iconColor }) => (
        <View key={type} style={[styles.meal, { backgroundColor: theme.surface.input }]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name={icon} size={20} color={iconColor} />
              <Text style={[styles.mealTitle, { color: theme.foreground }]}>{label}</Text>
            </View>
            <Switch
              value={notificationSettings[type].enabled}
              onValueChange={(value) => onToggleNotification(type, value)}
              trackColor={{ false: theme.surface.secondary, true: theme.cyan }}
              thumbColor={notificationSettings[type].enabled ? theme.text.inverse : theme.comment}
            />
          </View>
          
          {notificationSettings[type].enabled && (
            <View style={styles.details}>
              <TouchableOpacity
                style={[styles.timeButton, { backgroundColor: theme.surface.secondary }]}
                onPress={() => onOpenTimePicker(type)}
              >
                <Ionicons name="time-outline" size={18} color={theme.cyan} />
                <Text style={[styles.timeText, { color: theme.foreground }]}>
                  {formatTime(notificationSettings[type].hour, notificationSettings[type].minute)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: theme.purple }]}
                onPress={() => onTestNotification(type)}
              >
                <Ionicons name="flask-outline" size={16} color={theme.text.inverse} />
                <Text style={[styles.testButtonText, { color: theme.text.inverse }]}>Test</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  meal: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mealTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  details: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  timeText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    minWidth: 80,
  },
  testButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});
