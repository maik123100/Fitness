import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const NOTIFICATION_SETTINGS_KEY = '@fitness_app_notification_settings';

const DEFAULT_SETTINGS: NotificationSettings = {
  breakfast: { enabled: true, hour: 6, minute: 0 },
  lunch: { enabled: true, hour: 12, minute: 0 },
  dinner: { enabled: true, hour: 19, minute: 0 },
};

async function loadSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return DEFAULT_SETTINGS;
  }
}

async function saveSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
    throw error;
  }
}

type MealTypeMain = 'breakfast' | 'lunch' | 'dinner';

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
      const settings = await loadSettings();
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleToggleNotification = async (mealType: MealTypeMain, enabled: boolean) => {
    try {
      const newSettings = {
        ...notificationSettings,
        [mealType]: { ...notificationSettings[mealType], enabled }
      };
      await saveSettings(newSettings);
      setNotificationSettings(newSettings);
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
      const newSettings = {
        ...notificationSettings,
        [showTimePicker]: { ...notificationSettings[showTimePicker], hour: selectedHour, minute: selectedMinute }
      };
      await saveSettings(newSettings);
      setNotificationSettings(newSettings);
      setShowTimePicker(null);
    } catch (error) {
      console.error(`Error updating ${showTimePicker} time:`, error);
      Alert.alert('Error', 'Failed to update notification time');
    }
  };

  const handleTestNotification = async (_mealType: MealTypeMain) => {
    Alert.alert('Test Notification', 'Test notifications not implemented yet');
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