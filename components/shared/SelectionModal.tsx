import { useTheme } from '@/app/contexts/ThemeContext';
import { borderRadius, shadows, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type SelectionOption = {
  key: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  onPress: () => void;
};

interface SelectionModalProps {
  visible: boolean;
  title: string;
  description?: string;
  options: SelectionOption[];
  onClose: () => void;
}

export function SelectionModal({ visible, title, description, options, onClose }: SelectionModalProps) {
  const { theme } = useTheme();

  const handleSelect = (option: SelectionOption) => {
    onClose();
    option.onPress();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: theme.surface.card }, shadows.lg]} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.foreground }]}>{title}</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.comment} />
            </Pressable>
          </View>

          {description ? (
            <Text style={[styles.description, { color: theme.comment }]}>{description}</Text>
          ) : null}

          <View style={styles.optionsList}>
            {options.map((option) => {
              const accentColor = option.accentColor ?? theme.primary;

              return (
                <Pressable
                  key={option.key}
                  style={[styles.optionCard, { backgroundColor: theme.surface.input }]}
                  onPress={() => handleSelect(option)}
                >
                  <View style={[styles.iconWrap, { backgroundColor: `${accentColor}22` }]}>
                    <Ionicons name={option.icon} size={20} color={accentColor} />
                  </View>
                  <View style={styles.optionTextWrap}>
                    <Text style={[styles.optionTitle, { color: theme.foreground }]}>{option.title}</Text>
                    <Text style={[styles.optionDescription, { color: theme.comment }]}>{option.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.comment} />
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  closeButton: {
    padding: spacing.xs,
  },
  description: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  optionsList: {
    gap: spacing.md,
  },
  optionCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
});
