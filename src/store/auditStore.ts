import { create } from "zustand";
import type { AuditLog, UserRole } from "../types";
import { dbService } from "../services/db";

interface AuditState {
  logs: AuditLog[];
  isSubscribed: boolean;
  load: () => Promise<void>;
  initSubscription: () => void;
  logAction: (entry: {
    actor: string;
    role: UserRole;
    action: string;
    target: string;
    status?: "SUCCESS" | "WARNING" | "FAILED";
    ipAddress?: string;
  }) => void;
  clearLogs: () => Promise<void>;
}

export const useAuditStore = create<AuditState>((set, get) => {
  const normalizeLogs = (serverLogs: any[]): AuditLog[] => {
    return (serverLogs || []).map((log: any) => {
      let actor = log.actor || log.user_id || "System";
      let role = log.role;
      let target = log.target;
      let status = log.status;

      // Extract from details if needed
      if ((!role || !target) && log.details) {
        const detailsStr = String(log.details);
        if (detailsStr.includes("(admin)")) role = "admin";
        else if (detailsStr.includes("(trainer)")) role = "trainer";
        else if (detailsStr.includes("(trainee)")) role = "trainee";

        if (detailsStr.includes("[FAILED]")) status = "FAILED";
        else if (detailsStr.includes("[WARNING]")) status = "WARNING";
        else if (detailsStr.includes("[SUCCESS]")) status = "SUCCESS";

        if (!target) target = detailsStr;
      }

      if (!status) {
        status = log.severity === "critical" ? "FAILED" : log.severity === "warning" ? "WARNING" : "SUCCESS";
      }

      return {
        id: log.id,
        timestamp: log.timestamp || log.created_at || new Date().toISOString(),
        actor,
        role: (role || "admin") as UserRole,
        action: log.action || "AUDIT_EVENT",
        target: target || "System Platform",
        status: status as "SUCCESS" | "WARNING" | "FAILED",
        ipAddress: log.ipAddress || log.ip_address || "127.0.0.1"
      };
    });
  };

  return {
    logs: [],
    isSubscribed: false,

    initSubscription: () => {
      if (get().isSubscribed) return;
      set({ isSubscribed: true });

      try {
        dbService.subscribe("audit_logs", async () => {
          const fresh = await dbService.getAll<any>("audit_logs", 200);
          set({ logs: normalizeLogs(fresh) });
        });
      } catch (e) {}
    },

    load: async () => {
      get().initSubscription();
      try {
        const serverLogs = await dbService.getAll<any>("audit_logs", 200);
        set({ logs: normalizeLogs(serverLogs) });
      } catch (e) {
        console.warn("Could not load audit logs from cloud:", e);
      }
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
      set({ logs: [newLog, ...current] });

      // Direct write to Supabase cloud
      dbService.create("audit_logs", newLog).catch(() => {});
    },

    clearLogs: async () => {
      const { logs } = get();
      set({ logs: [] });
      for (const log of logs) {
        dbService.remove("audit_logs", log.id).catch(() => {});
      }
    }
  };
});

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
