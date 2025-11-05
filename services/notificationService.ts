import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { db } from '@/services/db';
import { foodEntries } from '@/services/db/schema';
import { eq, and } from 'drizzle-orm';

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

// Schedule daily meal reminder notifications
export async function scheduleMealReminders() {
  // Cancel all existing scheduled notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('Notification permissions not granted');
    return;
  }

  // Define meal times: 6:00, 12:00, 19:00
  const mealTimes = [
    { hour: 6, minute: 0, mealType: 'Breakfast', title: 'Breakfast Reminder' },
    { hour: 12, minute: 0, mealType: 'Lunch', title: 'Lunch Reminder' },
    { hour: 19, minute: 0, mealType: 'Dinner', title: 'Dinner Reminder' },
  ];

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  for (const meal of mealTimes) {
    try {
      // Check if the meal time has already passed today
      const currentTime = currentHour * 60 + currentMinute;
      const mealTime = meal.hour * 60 + meal.minute;
      const hasPassed = currentTime >= mealTime;
      
      // Calculate the next trigger time
      const nextTrigger = new Date();
      nextTrigger.setHours(meal.hour, meal.minute, 0, 0);
      
      if (hasPassed) {
        // If time has passed, set for tomorrow
        nextTrigger.setDate(nextTrigger.getDate() + 1);
      }
      
      // Use DateTrigger for the first notification, then it will repeat daily
      await Notifications.scheduleNotificationAsync({
        content: {
          title: meal.title,
          body: `Don't forget to track your ${meal.mealType.toLowerCase()}!`,
          data: { mealType: meal.mealType },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          channelId: 'meal-reminders',
          date: nextTrigger,
        },
      });
      
      // Schedule a repeating daily notification starting from the day after the first trigger
      const dailyStart = new Date(nextTrigger);
      dailyStart.setDate(dailyStart.getDate() + 1);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: meal.title,
          body: `Don't forget to track your ${meal.mealType.toLowerCase()}!`,
          data: { mealType: meal.mealType },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          channelId: 'meal-reminders',
          hour: meal.hour,
          minute: meal.minute,
        },
      });
      
      const timeLabel = hasPassed ? 'starting tomorrow' : 'today';
      console.log(`Scheduled notification for ${meal.mealType} at ${meal.hour}:${meal.minute.toString().padStart(2, '0')} (${timeLabel})`);
    } catch (error) {
      console.error(`Error scheduling notification for ${meal.mealType}:`, error);
    }
  }
}

// Initialize notification service
export async function initializeNotifications() {
  try {
    await scheduleMealReminders();
    console.log('Meal reminder notifications initialized successfully');
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}

// Cancel all notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('All notifications cancelled');
}

// Get all scheduled notifications (for debugging)
export async function getScheduledNotifications() {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  console.log('Scheduled notifications:', notifications);
  return notifications;
}
