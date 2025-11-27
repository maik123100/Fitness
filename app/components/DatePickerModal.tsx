import { useTheme } from '@/app/contexts/ThemeContext';
import { formatDateToYYYYMMDD } from '@/app/utils/dateHelpers';
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

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={currentMonth}
          style={styles.picker}
          onValueChange={(itemValue) => setCurrentMonth(itemValue)}
          dropdownIconColor={theme.text.primary}
          itemStyle={styles.pickerItem}
        >
          {monthNames.map((month, index) => (
            <Picker.Item key={month} label={month} value={index} color={theme.text.primary} style={{ color: theme.text.primary, backgroundColor: theme.surface.input }} />
          ))}
        </Picker>
      </View>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={currentYear}
          style={styles.picker}
          onValueChange={(itemValue) => setCurrentYear(itemValue)}
          dropdownIconColor={theme.text.primary}
          itemStyle={styles.pickerItem}
        >
          {years.map((year) => (
            <Picker.Item key={year} label={year.toString()} value={year} color={theme.text.primary} style={{ color: theme.text.primary, backgroundColor: theme.surface.input }} />
          ))}
        </Picker>
      </View>
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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close-circle" size={24} color={theme.comment} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.foreground }]}>Select Date</Text>
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
              arrowColor: theme.cyan,
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
    marginBottom: spacing.lg,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  pickerWrapper: {
    flex: 1,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    fontSize: typography.sizes.md,
  },
  pickerItem: {
    fontSize: typography.sizes.md,
  },
});

export default DatePickerModal;
