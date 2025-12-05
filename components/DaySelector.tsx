import { useDate } from '@/app/contexts/DateContext';
import { useTheme } from '@/app/contexts/ThemeContext';
import { borderRadius, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DatePickerModal from './DatePickerModal';

const DaySelector: React.FC = () => {
  const { selectedDate, setSelectedDate } = useDate();
  const { theme } = useTheme();
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date: Date) => {
    // Don't mutate the original date - create a copy
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const normalizedToday = new Date(today);
    normalizedToday.setHours(0, 0, 0, 0);

    const normalizedYesterday = new Date(yesterday);
    normalizedYesterday.setHours(0, 0, 0, 0);

    const normalizedTomorrow = new Date(tomorrow);
    normalizedTomorrow.setHours(0, 0, 0, 0);

    if (normalizedDate.getTime() === normalizedToday.getTime()) {
      return 'Today';
    } else if (normalizedDate.getTime() === normalizedYesterday.getTime()) {
      return 'Yesterday';
    } else if (normalizedDate.getTime() === normalizedTomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return normalizedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setDatePickerVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface.card }]}>
      <TouchableOpacity onPress={goToPreviousDay} style={styles.arrowButton}>
        <Ionicons name="chevron-back" size={24} color={theme.foreground} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setDatePickerVisible(true)} style={[styles.dateDisplayButton, { backgroundColor: theme.surface.input }]}>
        <Text style={[styles.dateText, { color: theme.foreground }]}>{formatDate(selectedDate)}</Text>
        <Ionicons name="calendar-outline" size={20} color={theme.foreground} style={styles.calendarIcon} />
      </TouchableOpacity>

      <TouchableOpacity onPress={goToNextDay} style={styles.arrowButton}>
        <Ionicons name="chevron-forward" size={24} color={theme.foreground} />
      </TouchableOpacity>

      <DatePickerModal
        isVisible={isDatePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        onSelectDate={handleDateSelect}
        currentDate={selectedDate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  arrowButton: {
    padding: spacing.md,
    borderRadius: borderRadius.full,
  },
  dateDisplayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    flex: 1,
    marginHorizontal: spacing.sm,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginRight: spacing.sm,
  },
  calendarIcon: {
    marginLeft: spacing.xs,
  },
});

export default DaySelector;
