export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  is_actionable: boolean;
  action_data?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total_count: number;
  unread_count: number;
}

export interface UnreadCountResponse {
  unread_count: number;
} 