import { create } from 'zustand';
import type { Notification } from '../types';
import { STORAGE_KEYS, getFromStorage, saveToStorage, generateId } from '../data/seed';
import { dbService } from '../services/db';

interface NotificationsState {
  notifications: Notification[];
  load: () => void;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt'>) => void;
  deleteNotification: (id: string) => void;
  togglePin: (id: string) => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],

  load: () => {
    const local = getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    set({ notifications: local });

    dbService.getAll<Notification>('notifications')
      .then((server) => {
        if (server && server.length > 0) {
          saveToStorage(STORAGE_KEYS.NOTIFICATIONS, server);
          set({ notifications: server });
        }
      })
      .catch(() => {});
  },

  addNotification: (n) => {
    const { notifications } = get();
    const newN: Notification = { ...n, id: generateId('notif'), createdAt: new Date().toISOString() };
    const updated = [newN, ...notifications];
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
    set({ notifications: updated });
    dbService.create('notifications', newN).catch(() => {});
  },

  deleteNotification: (id) => {
    const { notifications } = get();
    const updated = notifications.filter(n => n.id !== id);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
    set({ notifications: updated });
    dbService.remove('notifications', id).catch(() => {});
  },

  togglePin: (id) => {
    const { notifications } = get();
    const target = notifications.find(n => n.id === id);
    const newPinned = !target?.pinned;
    const updated = notifications.map(n => n.id === id ? { ...n, pinned: newPinned } : n);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
    set({ notifications: updated });
    dbService.update('notifications', id, { pinned: newPinned }).catch(() => {});
  },
}));
