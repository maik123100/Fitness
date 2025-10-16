import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { draculaTheme, spacing, borderRadius, typography } from '@/styles/theme';
import { useDate } from '@/app/contexts/DateContext';
import DatePickerModal from './DatePickerModal';

const DaySelector: React.FC = () => {
  const { selectedDate, setSelectedDate } = useDate();
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date: Date) => {
    date.setHours(0, 0, 0, 0);
    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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
    <View style={styles.container}>
      <TouchableOpacity onPress={goToPreviousDay} style={styles.arrowButton}>
        <Ionicons name="chevron-back" size={24} color={draculaTheme.foreground} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setDatePickerVisible(true)} style={styles.dateDisplayButton}>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        <Ionicons name="calendar-outline" size={20} color={draculaTheme.foreground} style={styles.calendarIcon} />
      </TouchableOpacity>

      <TouchableOpacity onPress={goToNextDay} style={styles.arrowButton}>
        <Ionicons name="chevron-forward" size={24} color={draculaTheme.foreground} />
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
    backgroundColor: draculaTheme.surface.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  arrowButton: {
    padding: spacing.sm,
  },
  dateDisplayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: draculaTheme.surface.input,
  },
  dateText: {
    color: draculaTheme.foreground,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginRight: spacing.sm,
  },
  calendarIcon: {
    // Add any specific styling for the calendar icon if needed
  },
});

export default DaySelector;
