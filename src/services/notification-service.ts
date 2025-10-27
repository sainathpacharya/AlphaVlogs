// @ts-ignore
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
import { Notification } from '@/types';
import { NOTIFICATION_TYPES } from '@/constants';

class NotificationService {
  constructor() {
    this.configure();
  }

  private configure() {
    // Configure push notifications
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      // (required) Called when a remote or local notification is opened or received
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },

      // (optional) Called when the user fails to register for remote notifications
      onRegistrationError: function (err) {
        console.error('Registration error:', err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - false: it will not be called (iOS) when the app is opened from a notification
       * - true: it will be called (iOS) when the app is opened from a notification
       */
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'jack-marvels-events',
          channelName: 'Jack Marvels Events',
          channelDescription: 'Notifications for talent show events',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
      );

      PushNotification.createChannel(
        {
          channelId: 'jack-marvels-quiz',
          channelName: 'Jack Marvels Quiz',
          channelDescription: 'Notifications for quiz reminders and results',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
      );

      PushNotification.createChannel(
        {
          channelId: 'jack-marvels-subscription',
          channelName: 'Jack Marvels Subscription',
          channelDescription: 'Notifications for subscription updates',
          playSound: true,
          soundName: 'default',
          importance: 3,
          vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
      );
    }
  }

  // Schedule local notification
  scheduleNotification(notification: {
    id: string;
    title: string;
    message: string;
    date: Date;
    type: 'event' | 'quiz' | 'result' | 'subscription';
    data?: any;
  }) {
    const channelId = this.getChannelId(notification.type);

    PushNotification.localNotificationSchedule({
      id: notification.id,
      channelId,
      title: notification.title,
      message: notification.message,
      date: notification.date,
      allowWhileIdle: true,
      repeatType: 'day',
      data: notification.data,
    });
  }

  // Send immediate notification
  sendNotification(notification: {
    title: string;
    message: string;
    type: 'event' | 'quiz' | 'result' | 'subscription';
    data?: any;
  }) {
    const channelId = this.getChannelId(notification.type);

    PushNotification.localNotification({
      channelId,
      title: notification.title,
      message: notification.message,
      data: notification.data,
    });
  }

  // Cancel specific notification
  cancelNotification(notificationId: string) {
    PushNotification.cancelLocalNotification(notificationId);
  }

  // Cancel all notifications
  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  // Get channel ID based on notification type
  private getChannelId(type: string): string {
    switch (type) {
      case NOTIFICATION_TYPES.EVENT:
        return 'jack-marvels-events';
      case NOTIFICATION_TYPES.QUIZ:
        return 'jack-marvels-quiz';
      case NOTIFICATION_TYPES.SUBSCRIPTION:
        return 'jack-marvels-subscription';
      default:
        return 'jack-marvels-events';
    }
  }

  // Schedule event reminder
  scheduleEventReminder(eventId: string, eventTitle: string, eventDate: Date) {
    const reminderDate = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before

    this.scheduleNotification({
      id: `event-reminder-${eventId}`,
      title: 'Event Reminder',
      message: `Don't forget! "${eventTitle}" is tomorrow. Prepare your video submission!`,
      date: reminderDate,
      type: 'event',
      data: { eventId, eventTitle },
    });
  }

  // Schedule quiz reminder
  scheduleQuizReminder(quizId: string, quizTitle: string, quizDate: Date) {
    const reminderDate = new Date(quizDate.getTime() - 2 * 60 * 60 * 1000); // 2 hours before

    this.scheduleNotification({
      id: `quiz-reminder-${quizId}`,
      title: 'Quiz Reminder',
      message: `Quiz "${quizTitle}" starts in 2 hours. Are you ready?`,
      date: reminderDate,
      type: 'quiz',
      data: { quizId, quizTitle },
    });
  }

  // Send quiz result notification
  sendQuizResult(quizTitle: string, score: number, totalQuestions: number) {
    this.sendNotification({
      title: 'Quiz Result',
      message: `Your result for "${quizTitle}": ${score}/${totalQuestions} (${Math.round((score / totalQuestions) * 100)}%)`,
      type: 'result',
      data: { quizTitle, score, totalQuestions },
    });
  }

  // Send subscription update notification
  sendSubscriptionUpdate(message: string) {
    this.sendNotification({
      title: 'Subscription Update',
      message,
      type: 'subscription',
    });
  }

  // Send new event notification
  sendNewEventNotification(eventTitle: string, eventCategory: string) {
    this.sendNotification({
      title: 'New Event Available',
      message: `New ${eventCategory} event: "${eventTitle}". Check it out!`,
      type: 'event',
      data: { eventTitle, eventCategory },
    });
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.requestPermissions().then((permissions) => {
        resolve(permissions.alert || false);
      });
    });
  }

  // Check if notifications are enabled
  async areNotificationsEnabled(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions) => {
        resolve(permissions.alert || false);
      });
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
