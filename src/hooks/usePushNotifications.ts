import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { registerPushToken } from '../services/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        // Send token to our backend
        registerPushToken(token, Platform.OS).catch(() => {});
      }
    }).catch(() => {});

    // Listeners for foreground push notifications
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received in foreground:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('User interacted with notification:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } catch {
      // Android notification channel setup skipped
    }
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      // EAS Project ID not configured yet for remote push
      return;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } catch {
      // Expo push token retrieval skipped
    }
  }

  return token;
}
