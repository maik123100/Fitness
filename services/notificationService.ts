import { db } from '@/services/db';
import { foodEntries } from '@/services/db/schema';
import { and, eq } from 'drizzle-orm';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============== Type Definitions ==============

const NOTIFICATION_SETTINGS_KEY = '@fitness_app_notification_settings';

export type MealTypeMain = 'breakfast' | 'lunch' | 'dinner';

export interface NotificationSetting {
  mealType: MealTypeMain;
  enabled: boolean;
  hour: number;
  minute: number;
  title: string;
  body: string;
  notificationId?: string;
}

export interface NotificationSettings {
  breakfast: NotificationSetting;
  lunch: NotificationSetting;
  dinner: NotificationSetting;
}

// Default settings
const DEFAULT_SETTINGS: NotificationSettings = {
  breakfast: {
    mealType: 'breakfast',
    enabled: true,
    hour: 6,
    minute: 0,
    title: 'Breakfast Reminder',
    body: "Don't forget to track your breakfast!",
  },
  lunch: {
    mealType: 'lunch',
    enabled: true,
    hour: 12,
    minute: 0,
    title: 'Lunch Reminder',
    body: "Don't forget to track your lunch!",
  },
  dinner: {
    mealType: 'dinner',
    enabled: true,
    hour: 19,
    minute: 0,
    title: 'Dinner Reminder',
    body: "Don't forget to track your dinner!",
  },
};

// Configure notification handler to check if food has been tracked
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Get meal type from notification data
    const mealType = notification.request.content.data?.mealType as string;

    if (mealType) {
      // Get current date
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];

      // Check if user has already tracked food for this meal
      const hasTracked = await hasFoodTrackedForMeal(currentDate, mealType);

      // Only show notification if food hasn't been tracked yet
      if (hasTracked) {
        console.log(`Skipping ${mealType} notification - food already tracked`);
        return {
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: false,
          shouldShowList: false,
        };
      }
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('meal-reminders', {
      name: 'Meal Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

// Check if user has tracked food for a specific meal type on a given date
async function hasFoodTrackedForMeal(date: string, mealType: string): Promise<boolean> {
  try {
    const entries = await db.select()
      .from(foodEntries)
      .where(and(
        eq(foodEntries.date, date),
        eq(foodEntries.mealType, mealType)
      ))
      .execute();

    return entries.length > 0;
  } catch (error) {
    console.error('Error checking food entries:', error);
    return false;
  }
}

// ============== AsyncStorage Operations ==============

async function saveSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
    throw error;
  }
}

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

// ============== CRUD Operations ==============

export async function getNotificationSettings(): Promise<NotificationSettings> {
  return await loadSettings();
}

export async function getNotificationSetting(
  mealType: MealTypeMain
): Promise<NotificationSetting> {
  const settings = await loadSettings();
  return settings[mealType];
}

export async function updateNotificationSetting(
  mealType: MealTypeMain,
  updates: Partial<NotificationSetting>
): Promise<void> {
  const settings = await loadSettings();
  settings[mealType] = { ...settings[mealType], ...updates };
  await saveSettings(settings);
}

export async function toggleNotification(
  mealType: MealTypeMain,
  enabled: boolean
): Promise<void> {
  await updateNotificationSetting(mealType, { enabled });
  await rescheduleMealNotification(mealType);
}

export async function updateNotificationTime(
  mealType: MealTypeMain,
  hour: number,
  minute: number
): Promise<void> {
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error('Invalid time values');
  }
  
  await updateNotificationSetting(mealType, { hour, minute });
  await rescheduleMealNotification(mealType);
}

export async function resetNotificationSettings(): Promise<void> {
  await saveSettings(DEFAULT_SETTINGS);
  await rescheduleAllNotifications();
}

// ============== Scheduling Operations ==============

async function scheduleMealNotification(
  setting: NotificationSetting
): Promise<string> {
  if (!setting.enabled) {
    return '';
  }

  const hasPermission = await checkNotificationPermissions();
  if (!hasPermission) {
    console.log('Notification permissions not granted');
    return '';
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: `meal-${setting.mealType}`,
      content: {
        title: setting.title,
        body: setting.body,
        data: { mealType: setting.mealType },
        categoryIdentifier: 'meal-reminder',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: setting.hour,
        minute: setting.minute,
        channelId: 'meal-reminders',
      },
    });

    console.log(`Scheduled ${setting.mealType} notification at ${setting.hour}:${setting.minute.toString().padStart(2, '0')}`);
    return notificationId;
  } catch (error) {
    console.error(`Error scheduling ${setting.mealType} notification:`, error);
    throw error;
  }
}

async function cancelMealNotification(mealType: MealTypeMain): Promise<void> {
  const setting = await getNotificationSetting(mealType);
  if (setting?.notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(setting.notificationId);
      console.log(`Cancelled ${mealType} notification`);
    } catch (error) {
      console.error(`Error cancelling ${mealType} notification:`, error);
    }
  }
}

export async function rescheduleMealNotification(
  mealType: MealTypeMain
): Promise<void> {
  await cancelMealNotification(mealType);
  
  const setting = await getNotificationSetting(mealType);
  if (setting && setting.enabled) {
    const notificationId = await scheduleMealNotification(setting);
    await updateNotificationSetting(mealType, { notificationId });
  }
}

export async function rescheduleAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  const settings = await getNotificationSettings();
  const mealTypes: MealTypeMain[] = ['breakfast', 'lunch', 'dinner'];
  
  for (const mealType of mealTypes) {
    const setting = settings[mealType];
    if (setting.enabled) {
      const notificationId = await scheduleMealNotification(setting);
      await updateNotificationSetting(mealType, { notificationId });
    }
  }
}

// ============== Initialization ==============

export async function initializeNotifications() {
  try {
    // Set up notification categories first
    await setupNotificationCategories();
    
    // Load or create default settings
    const settings = await getNotificationSettings();
    await saveSettings(settings);
    
    // Schedule all enabled notifications
    await rescheduleAllNotifications();
    
    console.log('Meal reminder notifications initialized successfully');
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}

// Set up notification categories with action buttons
async function setupNotificationCategories() {
  await Notifications.setNotificationCategoryAsync('meal-reminder', [
    {
      identifier: 'dismiss',
      buttonTitle: 'Dismiss',
      options: {
        opensAppToForeground: false,
      },
    },
    {
      identifier: 'track',
      buttonTitle: 'Track Food',
      options: {
        opensAppToForeground: true,
      },
    },
  ]);
}

// ============== Permission & Utility Functions ==============

export async function checkNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

export async function verifyPermissionsBeforeSettings(): Promise<boolean> {
  const hasPermission = await checkNotificationPermissions();
  
  if (!hasPermission) {
    return false;
  }
  
  return true;
}

// ============== Testing & Debug Functions ==============

export async function testNotification(mealType: MealTypeMain): Promise<void> {
  const setting = await getNotificationSetting(mealType);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Test: ${setting.title}`,
      body: setting.body,
      data: { mealType },
      categoryIdentifier: 'meal-reminder',
    },
    trigger: { seconds: 5 },
  });
  
  console.log(`Test notification for ${mealType} will fire in 5 seconds`);
}

export async function listScheduledNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.map(n => ({
    id: n.identifier,
    mealType: n.content.data?.mealType,
    trigger: n.trigger,
  }));
}

// Get all scheduled notifications (for debugging)
export async function getScheduledNotifications() {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  console.log('Scheduled notifications:', notifications);
  return notifications;
}

// ============== Backward Compatibility ==============

// ============== Notification Response Handlers ==============

export function setupNotificationHandlers(router: any) {
  // Handle notification clicks and action buttons
  Notifications.addNotificationResponseReceivedListener((response) => {
    const mealType = response.notification.request.content.data?.mealType as MealTypeMain;
    const actionIdentifier = response.actionIdentifier;
    
    if (!mealType) return;
    
    if (actionIdentifier === 'dismiss') {
      // User dismissed - just log it
      console.log(`User dismissed ${mealType} notification`);
      return;
    }
    
    // For 'track' action or default tap, navigate to food diary
    if (actionIdentifier === 'track' || actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      router.push({
        pathname: '/(tabs)/(food)',
        params: { expandMeal: mealType }
      });
    }
  });
}

// ============== Backward Compatibility ==============

// Keep old function for backward compatibility
export async function scheduleMealReminders() {
  await rescheduleAllNotifications();
}

// Cancel all notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('All notifications cancelled');
}
