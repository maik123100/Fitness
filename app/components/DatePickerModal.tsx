import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { draculaTheme, spacing, borderRadius, typography } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { formatDateToYYYYMMDD } from '@/app/utils/dateHelpers';

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
            dropdownIconColor={draculaTheme.text.primary}
            itemStyle={styles.pickerItem}
          >
            {monthNames.map((month, index) => (
            <Picker.Item key={month} label={month} value={index} color={draculaTheme.text.primary} style={{ color: draculaTheme.text.primary, backgroundColor: draculaTheme.surface.input }} />
            ))}
          </Picker>
      </View>
      <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={currentYear}
            style={styles.picker}
            onValueChange={(itemValue) => setCurrentYear(itemValue)}
            dropdownIconColor={draculaTheme.text.primary}
            itemStyle={styles.pickerItem}
          >
            {years.map((year) => (
            <Picker.Item key={year} label={year.toString()} value={year} color={draculaTheme.text.primary} style={{ color: draculaTheme.text.primary, backgroundColor: draculaTheme.surface.input }} />
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
        <View style={styles.modalView}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close-circle" size={24} color={draculaTheme.comment} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Select Date</Text>
          <Calendar
            key={`${currentYear}-${currentMonth}`}
            onDayPress={handleDayPress}
            markedDates={{
              [selected]: {
                selected: true,
                disableTouchEvent: true,
                selectedColor: draculaTheme.cyan,
                selectedTextColor: draculaTheme.background,
              },
            }}
            renderHeader={renderHeader}
            current={`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`}
            onMonthChange={(date) => {
              setCurrentMonth(date.month - 1);
              setCurrentYear(date.year);
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: draculaTheme.surface.input,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: draculaTheme.surface.secondary,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    color: draculaTheme.text.primary,
    backgroundColor: draculaTheme.surface.input,
    fontSize: typography.sizes.md,
  },
  pickerItem: {
    color: draculaTheme.foreground,
    backgroundColor: draculaTheme.surface.input,
    fontSize: typography.sizes.md,
  },
});

export default DatePickerModal;
