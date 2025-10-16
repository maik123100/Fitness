import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { draculaTheme, spacing, borderRadius, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface CalendarDayObject {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

interface DatePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  currentDate: Date;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({ isVisible, onClose, onSelectDate, currentDate }) => {
  const [selected, setSelected] = useState(currentDate.toISOString().split('T')[0]);

  useEffect(() => {
    setSelected(currentDate.toISOString().split('T')[0]);
  }, [currentDate]);

  const handleDayPress = (day: CalendarDayObject) => {
    setSelected(day.dateString);
    onSelectDate(new Date(day.year, day.month - 1, day.day));
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close-circle" size={24} color={draculaTheme.comment} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Select Date</Text>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={{
              [selected]: {
                selected: true,
                disableTouchEvent: true,
                selectedColor: draculaTheme.cyan,
                selectedTextColor: draculaTheme.background,
              },
            }}
            theme={{
              backgroundColor: draculaTheme.background,
              calendarBackground: draculaTheme.surface.card,
              textSectionTitleColor: draculaTheme.foreground,
              selectedDayBackgroundColor: draculaTheme.cyan,
              selectedDayTextColor: draculaTheme.background,
              todayTextColor: draculaTheme.orange,
              dayTextColor: draculaTheme.foreground,
              textDisabledColor: draculaTheme.comment,
              dotColor: draculaTheme.cyan,
              selectedDotColor: draculaTheme.background,
              arrowColor: draculaTheme.cyan,
              monthTextColor: draculaTheme.foreground,
              textDayFontFamily: typography.fontFamily,
              textMonthFontFamily: typography.fontFamily,
              textDayHeaderFontFamily: typography.fontFamily,
              textDayFontSize: typography.sizes.md,
              textMonthFontSize: typography.sizes.lg,
              textDayHeaderFontSize: typography.sizes.sm,
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: spacing.lg,
    backgroundColor: draculaTheme.surface.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: draculaTheme.foreground,
    marginBottom: spacing.lg,
  },
});

export default DatePickerModal;
