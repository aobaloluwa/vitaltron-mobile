import { apiRequest } from './api';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  return apiRequest<NotificationItem[]>('/notifications', { method: 'GET' });
}

export async function markAsRead(notificationId: string): Promise<void> {
  await apiRequest(`/notifications/${notificationId}/read`, { method: 'POST' });
}

export async function markAllAsRead(): Promise<void> {
  await apiRequest('/notifications/read-all', { method: 'POST' });
}

export async function registerPushToken(pushToken: string, device?: string): Promise<void> {
  await apiRequest('/notifications/push-token', {
    method: 'POST',
    body: JSON.stringify({ token: pushToken, device }),
  });
}