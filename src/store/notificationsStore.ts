import { create } from 'zustand';
import type { Notification } from '../types';
import { STORAGE_KEYS, getFromStorage, saveToStorage, generateId } from '../data/seed';

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
    set({ notifications: getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS) });
  },

  addNotification: (n) => {
    const { notifications } = get();
    const newN: Notification = { ...n, id: generateId('notif'), createdAt: new Date().toISOString() };
    const updated = [newN, ...notifications];
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
    set({ notifications: updated });
  },

  deleteNotification: (id) => {
    const { notifications } = get();
    const updated = notifications.filter(n => n.id !== id);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
    set({ notifications: updated });
  },

  togglePin: (id) => {
    const { notifications } = get();
    const updated = notifications.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
    set({ notifications: updated });
  },
}));
