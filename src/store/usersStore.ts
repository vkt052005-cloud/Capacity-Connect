import { create } from 'zustand';
import type { User } from '../types';
import { STORAGE_KEYS, getFromStorage, saveToStorage } from '../data/seed';
import { dbService } from '../services/db';
import { recordAuditEvent } from './auditStore';

interface UsersState {
  users: User[];
  isSubscribed: boolean;
  load: () => Promise<void>;
  initSubscription: () => void;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
  deactivateUser: (userId: string) => Promise<void>;
  activateUser: (userId: string) => Promise<void>;
  updateRole: (userId: string, role: User['role']) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  getTrainees: () => User[];
  getTrainers: () => User[];
  getPendingUsers: () => User[];
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: getFromStorage<User>(STORAGE_KEYS.USERS),
  isSubscribed: false,

  initSubscription: () => {
    if (get().isSubscribed) return;
    set({ isSubscribed: true });

    // Listen to real-time server events across all devices on the network
    dbService.subscribe('users', async (event) => {
      try {
        const fresh = await dbService.getAll<User>('users');
        if (fresh && fresh.length > 0) {
          saveToStorage(STORAGE_KEYS.USERS, fresh);
          set({ users: fresh });
        }
      } catch (e) {}
    });
  },

  load: async () => {
    // 1. Instant local read
    const local = getFromStorage<User>(STORAGE_KEYS.USERS);
    if (local && local.length > 0) {
      set({ users: local });
    }

    // 2. Ensure real-time listener is running
    get().initSubscription();

    // 3. Fresh pull from central server database
    try {
      const serverUsers = await dbService.getAll<User>('users');
      if (serverUsers && serverUsers.length > 0) {
        saveToStorage(STORAGE_KEYS.USERS, serverUsers);
        set({ users: serverUsers });
      }
    } catch (e) {
      // Offline fallback
    }
  },

  approveUser: async (userId) => {
    const { users } = get();
    const targetUser = users.find((u) => u.id === userId);
    const updated = users.map((u) => (u.id === userId ? { ...u, status: 'active' as const } : u));
    saveToStorage(STORAGE_KEYS.USERS, updated);
    set({ users: updated });

    await dbService.update('users', userId, { status: 'active' });
    if (targetUser) {
      recordAuditEvent({
        actor: "Capacity Connect Admin",
        role: "admin",
        action: "ACCOUNT_APPROVED",
        target: `${targetUser.name} (${targetUser.email})`,
        status: "SUCCESS"
      });
    }
  },

  rejectUser: async (userId) => {
    const { users } = get();
    const targetUser = users.find((u) => u.id === userId);
    const updated = users.map((u) => (u.id === userId ? { ...u, status: "rejected" as const } : u));
    saveToStorage(STORAGE_KEYS.USERS, updated);
    set({ users: updated });

    await dbService.update('users', userId, { status: 'rejected' });
    if (targetUser) {
      recordAuditEvent({
        actor: "Capacity Connect Admin",
        role: "admin",
        action: "ACCOUNT_REJECTED",
        target: `${targetUser.name} (${targetUser.email})`,
        status: "WARNING"
      });
    }
  },

  deactivateUser: async (userId) => {
    const { users } = get();
    const targetUser = users.find((u) => u.id === userId);
    const updated = users.map((u) => (u.id === userId ? { ...u, status: 'inactive' as const } : u));
    saveToStorage(STORAGE_KEYS.USERS, updated);
    set({ users: updated });

    await dbService.update('users', userId, { status: 'inactive' });
    if (targetUser) {
      recordAuditEvent({
        actor: "Capacity Connect Admin",
        role: "admin",
        action: "ACCOUNT_DEACTIVATED",
        target: `${targetUser.name} (${targetUser.email})`,
        status: "WARNING"
      });
    }
  },

  activateUser: async (userId) => {
    const { users } = get();
    const targetUser = users.find((u) => u.id === userId);
    const updated = users.map((u) => (u.id === userId ? { ...u, status: 'active' as const } : u));
    saveToStorage(STORAGE_KEYS.USERS, updated);
    set({ users: updated });

    await dbService.update('users', userId, { status: 'active' });
    if (targetUser) {
      recordAuditEvent({
        actor: "Capacity Connect Admin",
        role: "admin",
        action: "ACCOUNT_ACTIVATED",
        target: `${targetUser.name} (${targetUser.email})`,
        status: "SUCCESS"
      });
    }
  },

  updateRole: async (userId, role) => {
    const { users } = get();
    const targetUser = users.find((u) => u.id === userId);
    const updated = users.map((u) => (u.id === userId ? { ...u, role } : u));
    saveToStorage(STORAGE_KEYS.USERS, updated);
    set({ users: updated });

    await dbService.update('users', userId, { role });
    if (targetUser) {
      recordAuditEvent({
        actor: "Capacity Connect Admin",
        role: "admin",
        action: "ROLE_PROMOTED",
        target: `${targetUser.name} -> ${role.toUpperCase()}`,
        status: "SUCCESS"
      });
    }
  },

  deleteUser: async (userId) => {
    const { users } = get();
    const targetUser = users.find((u) => u.id === userId);
    const updated = users.filter((u) => u.id !== userId);
    saveToStorage(STORAGE_KEYS.USERS, updated);
    set({ users: updated });

    await dbService.remove('users', userId);
    if (targetUser) {
      recordAuditEvent({
        actor: "Capacity Connect Admin",
        role: "admin",
        action: "ACCOUNT_DELETED",
        target: `${targetUser.name} (${targetUser.email})`,
        status: "SUCCESS"
      });
    }
  },

  getTrainees: () => get().users.filter((u) => u.role === 'trainee'),
  getTrainers: () => get().users.filter((u) => u.role === 'trainer'),
  getPendingUsers: () => get().users.filter((u) => u.status === 'pending'),
}));

// Initialize subscription on boot
if (typeof window !== 'undefined') {
  useUsersStore.getState().load();
}
