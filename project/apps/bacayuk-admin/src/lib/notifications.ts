import { api } from './api';

export type NotificationAudience = 'admin' | 'siswa' | 'all';
export type NotificationType = 'book' | 'category' | 'user' | 'system';

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  audience: NotificationAudience;
  createdAt: string;
  readByAdmin: boolean;
  readBySiswa: boolean;
};

export const NOTIFICATIONS_UPDATED_EVENT = 'notifications_updated';

function emitUpdate() {
  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
}

export async function getNotificationsFor(audience: 'admin' | 'siswa'): Promise<AppNotification[]> {
  const data = await api.get<AppNotification[]>(`/api/notifications?audience=${audience}`);
  return Array.isArray(data) ? data : [];
}

export async function getUnreadCount(audience: 'admin' | 'siswa'): Promise<number> {
  const list = await getNotificationsFor(audience);
  return list.filter((n) => (audience === 'admin' ? !n.readByAdmin : !n.readBySiswa)).length;
}

export async function addNotification(input: {
  title: string;
  message: string;
  type?: NotificationType;
  audience?: NotificationAudience;
}): Promise<AppNotification | null> {
  try {
    const notif = await api.post<AppNotification>('/api/notifications', {
      title: input.title,
      message: input.message,
      type: input.type ?? 'system',
      audience: input.audience ?? 'all',
    });
    emitUpdate();
    return notif;
  } catch {
    return null;
  }
}

export async function markAllRead(audience: 'admin' | 'siswa'): Promise<void> {
  try {
    await api.post('/api/notifications/mark-all-read', { audience });
  } finally {
    emitUpdate();
  }
}

export function formatNotifTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} hari lalu`;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
