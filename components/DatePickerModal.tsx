import { useTheme } from '@/app/contexts/ThemeContext';
import { formatDateToYYYYMMDD } from '@/utils/dateHelpers';
import { borderRadius, spacing, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

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
  const { theme } = useTheme();
  const [selected, setSelected] = useState(formatDateToYYYYMMDD(currentDate));
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    setSelected(formatDateToYYYYMMDD(currentDate));
    setCurrentMonth(currentDate.getMonth());
    setCurrentYear(currentDate.getFullYear());
  }, [currentDate]);

  const handleDayPress = (day: CalendarDayObject) => {
    setSelected(day.dateString);
    // Create date in local timezone, not UTC
    const localDate = new Date(day.year, day.month - 1, day.day);
    onSelectDate(localDate);
    onClose();
  };

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowButton}>
        <Ionicons name="chevron-back" size={24} color={theme.text.primary} />
      </TouchableOpacity>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={currentMonth}
          style={[styles.picker, { color: theme.text.primary }]}
          onValueChange={(itemValue) => setCurrentMonth(itemValue)}
          dropdownIconColor={theme.text.primary}
        >
          {monthNames.map((month, index) => (
            <Picker.Item key={month} label={month} value={index} />
          ))}
        </Picker>
      </View>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={currentYear}
          style={[styles.picker, { color: theme.text.primary }]}
          onValueChange={(itemValue) => setCurrentYear(itemValue)}
          dropdownIconColor={theme.text.primary}
        >
          {years.map((year) => (
            <Picker.Item key={year} label={year.toString()} value={year} />
          ))}
        </Picker>
      </View>
      <TouchableOpacity onPress={handleNextMonth} style={styles.arrowButton}>
        <Ionicons name="chevron-forward" size={24} color={theme.text.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.surface.card }]}>
          <View style={styles.header}>
            <Text style={[styles.modalTitle, { color: theme.foreground }]}>Select Date</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text.secondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.calendarContainer}>
            <Calendar
              key={`${currentYear}-${currentMonth}`}
              onDayPress={handleDayPress}
              markedDates={{
                [selected]: {
                  selected: true,
                  disableTouchEvent: true,
                  selectedColor: theme.cyan,
                  selectedTextColor: theme.background,
                },
              }}
              renderHeader={renderHeader}
              current={`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`}
              onMonthChange={(date) => {
                setCurrentMonth(date.month - 1);
                setCurrentYear(date.year);
              }}
              hideArrows={true}
              theme={{
                backgroundColor: theme.background,
                calendarBackground: theme.surface.card,
                textSectionTitleColor: theme.foreground,
                selectedDayBackgroundColor: theme.cyan,
                selectedDayTextColor: theme.background,
                todayTextColor: theme.orange,
                dayTextColor: theme.foreground,
                textDisabledColor: theme.comment,
                dotColor: theme.cyan,
                selectedDotColor: theme.background,
                monthTextColor: theme.foreground,
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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  calendarContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  arrowButton: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerWrapper: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'visible',
  },
  picker: {
    width: '100%',
  },
});

export default DatePickerModal;
