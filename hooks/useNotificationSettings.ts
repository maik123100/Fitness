import {
  getNotificationSettings,
  MealTypeMain,
  testNotification,
  toggleNotification,
  updateNotificationTime,
} from '@/services/notificationService';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface NotificationTime {
  enabled: boolean;
  hour: number;
  minute: number;
}

interface NotificationSettings {
  breakfast: NotificationTime;
  lunch: NotificationTime;
  dinner: NotificationTime;
}

export function useNotificationSettings() {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    breakfast: { enabled: true, hour: 6, minute: 0 },
    lunch: { enabled: true, hour: 12, minute: 0 },
    dinner: { enabled: true, hour: 19, minute: 0 },
  });

  const [showTimePicker, setShowTimePicker] = useState<MealTypeMain | null>(null);
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const settings = await getNotificationSettings();
      setNotificationSettings({
        breakfast: { enabled: settings.breakfast.enabled, hour: settings.breakfast.hour, minute: settings.breakfast.minute },
        lunch: { enabled: settings.lunch.enabled, hour: settings.lunch.hour, minute: settings.lunch.minute },
        dinner: { enabled: settings.dinner.enabled, hour: settings.dinner.hour, minute: settings.dinner.minute },
      });
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleToggleNotification = async (mealType: MealTypeMain, enabled: boolean) => {
    try {
      await toggleNotification(mealType, enabled);
      setNotificationSettings(prev => ({
        ...prev,
        [mealType]: { ...prev[mealType], enabled }
      }));
    } catch (error) {
      console.error(`Error toggling ${mealType} notification:`, error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const openTimePicker = (mealType: MealTypeMain) => {
    const meal = notificationSettings[mealType];
    setSelectedHour(meal.hour);
    setSelectedMinute(meal.minute);
    setShowTimePicker(mealType);
  };

  const handleTimeSave = async () => {
    if (!showTimePicker) return;

    try {
      await updateNotificationTime(showTimePicker, selectedHour, selectedMinute);
      setNotificationSettings(prev => ({
        ...prev,
        [showTimePicker]: { ...prev[showTimePicker], hour: selectedHour, minute: selectedMinute }
      }));
      setShowTimePicker(null);
    } catch (error) {
      console.error(`Error updating ${showTimePicker} time:`, error);
      Alert.alert('Error', 'Failed to update notification time');
    }
  };

  const handleTestNotification = async (mealType: MealTypeMain) => {
    try {
      await testNotification(mealType);
      Alert.alert('Test Notification', `A test notification for ${mealType} will appear in 5 seconds`);
    } catch (error) {
      console.error(`Error sending test notification:`, error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  return {
    notificationSettings,
    showTimePicker,
    selectedHour,
    selectedMinute,
    setSelectedHour,
    setSelectedMinute,
    setShowTimePicker,
    handleToggleNotification,
    openTimePicker,
    handleTimeSave,
    handleTestNotification,
  };
}
