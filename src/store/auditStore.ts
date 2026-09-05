import { create } from "zustand";
import type { AuditLog, UserRole } from "../types";
import { STORAGE_KEYS, getFromStorage, saveToStorage } from "../data/seed";
import { dbService } from "../services/db";

interface AuditState {
  logs: AuditLog[];
  load: () => void;
  logAction: (entry: {
    actor: string;
    role: UserRole;
    action: string;
    target: string;
    status?: "SUCCESS" | "WARNING" | "FAILED";
    ipAddress?: string;
  }) => void;
  clearLogs: () => void;
}

export const useAuditStore = create<AuditState>((set, get) => ({
  logs: [],

  load: () => {
    dbService.getAll<AuditLog>("audit_logs").then((serverLogs) => {
      if (serverLogs && Array.isArray(serverLogs) && serverLogs.length > 0) {
        set({ logs: serverLogs });
        saveToStorage(STORAGE_KEYS.AUDIT_LOGS, serverLogs);
        return;
      }
      const local = getFromStorage<AuditLog>(STORAGE_KEYS.AUDIT_LOGS);
      set({ logs: local || [] });
    }).catch(() => {
      const local = getFromStorage<AuditLog>(STORAGE_KEYS.AUDIT_LOGS);
      set({ logs: local || [] });
    });
  },

  logAction: (entry) => {
    const newLog: AuditLog = {
      id: "log_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      actor: entry.actor,
      role: entry.role,
      action: entry.action,
      target: entry.target,
      status: entry.status || "SUCCESS",
      ipAddress: entry.ipAddress || (typeof window !== "undefined" && window.location.hostname === "localhost" ? "127.0.0.1" : "192.168.1.4")
    };

    const current = get().logs;
    const updated = [newLog, ...current];
    set({ logs: updated });
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, updated);
    dbService.create("audit_logs", newLog);
  },

  clearLogs: () => {
    set({ logs: [] });
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, []);
    try {
      localStorage.setItem("cc_audit_logs", JSON.stringify([]));
    } catch (e) {}
  }
}));

// Global helper so any component or service can log an audit event
export function recordAuditEvent(entry: {
  actor: string;
  role: UserRole;
  action: string;
  target: string;
  status?: "SUCCESS" | "WARNING" | "FAILED";
  ipAddress?: string;
}) {
  useAuditStore.getState().logAction(entry);
}
