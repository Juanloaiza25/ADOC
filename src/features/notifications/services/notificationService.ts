import { apiRequest } from '@/lib/api'

export interface AppNotification {
  key: string
  source: 'deadline' | 'action'
  sourceId: string
  title: string
  message: string
  dueDate: string
  severity: 'info' | 'warning' | 'critical'
  href: string
  read: boolean
}

export interface NotificationData { notifications: AppNotification[]; unread: number }

export const notificationService = {
  get: () => apiRequest<NotificationData>('/api/notifications'),
  markRead: (keys: string[]) => apiRequest('/api/notifications/read', { method: 'POST', body: JSON.stringify({ keys }) }),
}
