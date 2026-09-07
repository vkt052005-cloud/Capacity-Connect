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
  verifyTrainer: (userId: string, isVerified: boolean) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  removeUser: (userId: string, reason?: string) => Promise<void>;
  allowUserAccess: (userId: string) => Promise<void>;
  requestReinstatement: (email: string, note?: string) => Promise<{ success: boolean; message: string }>;
  isUserRemoved: (email: string) => boolean;
  getTrainees: () => User[];
  getTrainers: () => User[];
  getPendingUsers: () => User[];
  getRemovedUsers: () => User[];
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  isSubscribed: false,

  initSubscription: () => {
    if (get().isSubscribed) return;
    set({ isSubscribed: true });

    // Listen to real-time server events across all devices on the network
    dbService.subscribe('users', async () => {
      try {
        const fresh = await dbService.getAll<User>('users');
        if (fresh) {
          set({ users: fresh });
        }
      } catch (e) {}
    });
  },

  load: async () => {
    get().initSubscription();

    try {
      const serverUsers = await dbService.getAll<User>('users');
      if (serverUsers) {
        set({ users: serverUsers });
      }
    } catch (e) {
      console.warn('Could not load users from cloud:', e);
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

  verifyTrainer: async (userId, isVerified) => {
    const { users } = get();
    const targetUser = users.find((u) => u.id === userId);
    const updated = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          isVerifiedByAdmin: isVerified,
          trainerProfile: u.trainerProfile
            ? { ...u.trainerProfile, isVerifiedByAdmin: isVerified }
            : undefined
        };
      }
      return u;
    });
    saveToStorage(STORAGE_KEYS.USERS, updated);
    set({ users: updated });

    await dbService.update('users', userId, {
      isVerifiedByAdmin: isVerified,
      trainerProfile: targetUser?.trainerProfile
        ? { ...targetUser.trainerProfile, isVerifiedByAdmin: isVerified }
        : undefined
    });

    if (targetUser) {
      recordAuditEvent({
        actor: "Capacity Connect Admin",
        role: "admin",
        action: isVerified ? "TRAINER_VERIFIED" : "TRAINER_VERIFICATION_REVOKED",
        target: `${targetUser.name} (${targetUser.email}) - Video Upload ${isVerified ? "Unlocked" : "Revoked"}`,
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

  removeUser: async (userId, reason) => {
    const { users } = get();
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;
    if (targetUser.role === "admin") return;

    const now = new Date().toISOString();
    const updatedUser: User = {
      ...targetUser,
      status: "removed",
      removedAt: now,
      removedBy: "Capacity Connect Admin",
      removalReason: reason || "Revoked by Administrator",
      reinstatementRequested: false,
      reinstatementNote: undefined
    };

    const updated = users.map((u) => (u.id === userId ? updatedUser : u));
    saveToStorage(STORAGE_KEYS.USERS, updated);
    set({ users: updated });

    try {
      const removedRaw = localStorage.getItem(STORAGE_KEYS.REMOVED_USERS);
      let removedList: any[] = [];
      if (removedRaw) {
        try { removedList = JSON.parse(removedRaw) || []; } catch {}
      }
      const cleanEmail = targetUser.email.toLowerCase();
      const existingIdx = removedList.findIndex((r: any) => (typeof r === 'string' ? r : r.email || '').toLowerCase() === cleanEmail);
      const entry = {
        id: targetUser.id,
        email: cleanEmail,
        name: targetUser.name,
        role: targetUser.role,
        removedAt: now,
        reason: reason || "Revoked by Administrator"
      };
      if (existingIdx >= 0) {
        removedList[existingIdx] = entry;
      } else {
        removedList.push(entry);
      }
      localStorage.setItem(STORAGE_KEYS.REMOVED_USERS, JSON.stringify(removedList));
    } catch (e) {}

    await dbService.update('users', userId, {
      status: 'removed',
      removedAt: now,
      removedBy: 'Capacity Connect Admin',
      removalReason: reason || 'Revoked by Administrator'
    });

    recordAuditEvent({
      actor: "Capacity Connect Admin",
      role: "admin",
      action: "ACCOUNT_REMOVED",
      target: `${targetUser.name} (${targetUser.email}) [${targetUser.role.toUpperCase()}] Access Revoked. Reason: ${reason || 'Revocation by Administrator'}`,
      status: "WARNING"
    });

    try {
      const currentAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (currentAuth) {
        const parsedAuth = JSON.parse(currentAuth);
        const authId = parsedAuth?.userId || parsedAuth?.user?.id || parsedAuth?.id;
        const authEmail = (parsedAuth?.user?.email || parsedAuth?.email || "").toLowerCase();
        if (authId === userId || authEmail === targetUser.email.toLowerCase()) {
          localStorage.removeItem(STORAGE_KEYS.AUTH);
        }
      }
    } catch (e) {}
  },

  allowUserAccess: async (userId) => {
    const { users } = get();
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const updatedUser: User = {
      ...targetUser,
      status: "active",
      removedAt: undefined,
      removedBy: undefined,
      removalReason: undefined,
      reinstatementRequested: false,
      reinstatementNote: undefined,
      reinstatementRequestedAt: undefined
    };

    const updated = users.map((u) => (u.id === userId ? updatedUser : u));
    saveToStorage(STORAGE_KEYS.USERS, updated);
    set({ users: updated });

    try {
      const removedRaw = localStorage.getItem(STORAGE_KEYS.REMOVED_USERS);
      if (removedRaw) {
        let removedList = JSON.parse(removedRaw) || [];
        removedList = removedList.filter((r: any) => (typeof r === 'string' ? r : r.email || '').toLowerCase() !== targetUser.email.toLowerCase());
        localStorage.setItem(STORAGE_KEYS.REMOVED_USERS, JSON.stringify(removedList));
      }
    } catch (e) {}

    await dbService.update('users', userId, {
      status: 'active',
      removedAt: null,
      removedBy: null,
      removalReason: null,
      reinstatementRequested: false
    });

    recordAuditEvent({
      actor: "Capacity Connect Admin",
      role: "admin",
      action: "ACCOUNT_REINSTATED",
      target: `${targetUser.name} (${targetUser.email}) [${targetUser.role.toUpperCase()}] Access Allowed by Admin`,
      status: "SUCCESS"
    });
  },

  requestReinstatement: async (email, note) => {
    const clean = email.trim().toLowerCase();
    const { users } = get();
    const targetUser = users.find((u) => u.email.toLowerCase() === clean);
    if (!targetUser) {
      return { success: false, message: "No account found with this email." };
    }

    const now = new Date().toISOString();
    const updatedUser: User = {
      ...targetUser,
      reinstatementRequested: true,
      reinstatementRequestedAt: now,
      reinstatementNote: note?.trim() || "User requested re-admission to Capacity Connect."
    };

    const updated = users.map((u) => (u.id === targetUser.id ? updatedUser : u));
    saveToStorage(STORAGE_KEYS.USERS, updated);
    set({ users: updated });

    await dbService.update('users', targetUser.id, {
      reinstatementRequested: true,
      reinstatementRequestedAt: now,
      reinstatementNote: note?.trim() || "User requested re-admission to Capacity Connect."
    });

    recordAuditEvent({
      actor: targetUser.name,
      role: targetUser.role,
      action: "REINSTATEMENT_REQUESTED",
      target: `Re-admission requested by ${targetUser.email}. Note: ${note || 'None'}`,
      status: "WARNING"
    });

    return {
      success: true,
      message: "Re-admission request submitted to Administrators. You will be able to access the portal once an Administrator reviews and allows your account."
    };
  },

  isUserRemoved: (email) => {
    const clean = email.trim().toLowerCase();
    const { users } = get();
    const match = users.find((u) => u.email.toLowerCase() === clean);
    if (match && match.status === "removed") return true;

    try {
      const removedRaw = localStorage.getItem(STORAGE_KEYS.REMOVED_USERS);
      if (removedRaw) {
        const list = JSON.parse(removedRaw);
        if (Array.isArray(list)) {
          return list.some((r: any) => (typeof r === "string" ? r : r.email || "").toLowerCase() === clean);
        }
      }
    } catch {}
    return false;
  },

  getTrainees: () => get().users.filter((u) => u.role === 'trainee'),
  getTrainers: () => get().users.filter((u) => u.role === 'trainer'),
  getPendingUsers: () => get().users.filter((u) => u.status === 'pending'),
  getRemovedUsers: () => get().users.filter((u) => u.status === 'removed'),
}));

// Initialize subscription on boot
if (typeof window !== 'undefined') {
  useUsersStore.getState().load();
}
