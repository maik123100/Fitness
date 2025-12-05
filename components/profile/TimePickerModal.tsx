import { useTheme } from '@/app/contexts/ThemeContext';
import { borderRadius, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TimePickerModalProps {
  visible: boolean;
  title: string;
  hour: number;
  minute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function TimePickerModal({
  visible,
  title,
  hour,
  minute,
  onHourChange,
  onMinuteChange,
  onSave,
  onCancel,
}: TimePickerModalProps) {
  const { theme } = useTheme();

  const formatTime = (hour: number, minute: number): string => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${ampm}`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.surface.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.foreground }]}>{title}</Text>
            <TouchableOpacity onPress={onCancel}>
              <Ionicons name="close" size={24} color={theme.comment} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.pickerRow}>
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: theme.comment }]}>Hour</Text>
                <Picker
                  selectedValue={hour}
                  onValueChange={onHourChange}
                  style={[styles.picker, { color: theme.foreground }]}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i} />
                  ))}
                </Picker>
              </View>

              <Text style={[styles.timeSeparator, { color: theme.foreground }]}>:</Text>

              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: theme.comment }]}>Minute</Text>
                <Picker
                  selectedValue={minute}
                  onValueChange={onMinuteChange}
                  style={[styles.picker, { color: theme.foreground }]}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i} />
                  ))}
                </Picker>
              </View>
            </View>

            <Text style={[styles.timePreview, { color: theme.cyan }]}>
              {formatTime(hour, minute)}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.surface.secondary }]}
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, { color: theme.foreground }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.cyan }]}
              onPress={onSave}
            >
              <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modal: {
    width: '85%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...Platform.select({
      android: { elevation: 8 },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  picker: {
    width: 100,
    height: 150,
  },
  timeSeparator: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    marginTop: spacing.lg,
  },
  timePreview: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginTop: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
