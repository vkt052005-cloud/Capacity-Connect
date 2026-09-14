import { create } from 'zustand';
import type { Notification } from '../types';
import { generateId } from '../data/seed';
import { dbService } from '../services/db';

interface NotificationsState {
  notifications: Notification[];
  isSubscribed: boolean;
  load: () => void;
  initSubscription: () => void;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt'>) => void;
  deleteNotification: (id: string) => void;
  togglePin: (id: string) => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  isSubscribed: false,

  initSubscription: () => {
    if (get().isSubscribed) return;
    set({ isSubscribed: true });

    dbService.subscribe('notifications', (event) => {
      if (event?.data && Array.isArray(event.data)) {
        set({ notifications: event.data });
      } else {
        dbService.getAll<Notification>('notifications').then((server) => {
          if (server) set({ notifications: server });
        }).catch(() => {});
      }
    });
  },

  load: () => {
    get().initSubscription();

    dbService.getAll<Notification>('notifications')
      .then((server) => {
        if (server) {
          set({ notifications: server });
        }
      })
      .catch(() => {});
  },

  addNotification: (n) => {
    const { notifications } = get();
    const newN: Notification = { ...n, id: generateId('notif'), createdAt: new Date().toISOString() };
    const updated = [newN, ...notifications];
    set({ notifications: updated });
    dbService.create('notifications', newN).catch(() => {});
  },

  deleteNotification: (id) => {
    const { notifications } = get();
    const updated = notifications.filter(n => n.id !== id);
    set({ notifications: updated });
    dbService.remove('notifications', id).catch(() => {});
  },

  togglePin: (id) => {
    const { notifications } = get();
    const target = notifications.find(n => n.id === id);
    const newPinned = !target?.pinned;
    const updated = notifications.map(n => n.id === id ? { ...n, pinned: newPinned } : n);
    set({ notifications: updated });
    dbService.update('notifications', id, { pinned: newPinned }).catch(() => {});
  },
}));
