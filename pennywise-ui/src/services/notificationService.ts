import { apiClient } from './apiClient';
import { NotificationListResponse, UnreadCountResponse } from '@/types/notification';

export const notificationService = {
  // Get notifications with pagination
  getNotifications: async (skip = 0, limit = 50, unreadOnly = false): Promise<NotificationListResponse> => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      unread_only: unreadOnly.toString(),
    });
    
    return await apiClient.get<NotificationListResponse>(`/notifications/?${params}`);
  },

  // Get unread count
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    return await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
  },

  // Mark notification as read
  markAsRead: async (notificationId: number): Promise<void> => {
    await apiClient.put(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/mark-all-read');
  },

  // Delete notification
  deleteNotification: async (notificationId: number): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`);
  },

  // Accept group invitation
  acceptGroupInvitation: async (notificationId: number): Promise<void> => {
    await apiClient.post(`/notifications/${notificationId}/accept-invitation`);
  },

  // Decline group invitation
  declineGroupInvitation: async (notificationId: number): Promise<void> => {
    await apiClient.post(`/notifications/${notificationId}/decline-invitation`);
  },
}; 