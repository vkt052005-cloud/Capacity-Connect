import { create } from "zustand";
import type { User } from "../types";
import { STORAGE_KEYS, getFromStorage, saveToStorage, generateId } from "../data/seed";
import { dbService } from "../services/db";
import { recordAuditEvent } from "./auditStore";

interface AuthState {
  currentUser: User | null;
  login: (email: string, password: string, requiredRole?: User["role"]) => { success: boolean; message: string; user?: User };
  validateCredentials: (email: string, password: string, requiredRole?: User["role"]) => { success: boolean; message: string; user?: User };
  completeLogin: (user: User) => { success: boolean; message: string; user: User };
  logout: () => void;
  register: (data: Omit<User, "id" | "createdAt" | "status">) => { success: boolean; message: string };
  updateProfile: (updates: Partial<User>) => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,

  loadFromStorage: () => {
    const auth = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (auth) {
      const { userId } = JSON.parse(auth);
      const users = getFromStorage<User>(STORAGE_KEYS.USERS);
      const user = users.find((u) => u.id === userId);
      if (user) set({ currentUser: user });
    }
  },

  validateCredentials: (email, password, requiredRole) => {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) {
      recordAuditEvent({
        actor: email,
        role: requiredRole || "trainee",
        action: "FAILED_LOGIN_ATTEMPT",
        target: "Auth Service",
        status: "FAILED"
      });
      return { success: false, message: "Invalid official email or password." };
    }
    if (user.status === "pending") {
      if (user.role === "trainee") {
        // Students / trainees do not require admin approval; auto-activate
        user.status = "active";
        const updatedUsers = users.map((u) => (u.id === user.id ? { ...u, status: "active" as const } : u));
        saveToStorage(STORAGE_KEYS.USERS, updatedUsers);
        dbService.update('users', user.id, { status: "active" });
      } else {
        recordAuditEvent({
          actor: user.name,
          role: user.role,
          action: "UNAPPROVED_LOGIN_ATTEMPT",
          target: "Auth Service",
          status: "WARNING"
        });
        return { success: false, message: "Your trainer account is awaiting admin approval before you can sign in." };
      }
    }
    if (user.status === "inactive" || user.status === "suspended") {
      recordAuditEvent({
        actor: user.name,
        role: user.role,
        action: "SUSPENDED_LOGIN_ATTEMPT",
        target: "Auth Service",
        status: "FAILED"
      });
      return { success: false, message: "Your account has been deactivated. Please contact an administrator." };
    }

    // Enforce role isolation: An Admin cannot sign in from the Trainee or Trainer tab, and vice versa!
    if (requiredRole && user.role !== requiredRole) {
      recordAuditEvent({
        actor: user.name,
        role: user.role,
        action: "ROLE_MISMATCH_LOGIN_BLOCKED",
        target: `${requiredRole.toUpperCase()} Portal`,
        status: "WARNING"
      });
      return {
        success: false,
        message: `Access Denied: This account is registered as an ${user.role.toUpperCase()}. You cannot sign in through the ${requiredRole.toUpperCase()} portal. Please switch to the ${user.role.toUpperCase()} tab.`
      };
    }

    return { success: true, message: "Credentials validated.", user };
  },

  completeLogin: (user) => {
    set({ currentUser: user });
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ userId: user.id }));
    recordAuditEvent({
      actor: user.name,
      role: user.role,
      action: "SESSION_AUTHENTICATED",
      target: `${user.role.toUpperCase()} Portal`,
      status: "SUCCESS"
    });
    return { success: true, message: "Login successful!", user };
  },

  login: (email, password, requiredRole) => {
    const valid = get().validateCredentials(email, password, requiredRole);
    if (!valid.success || !valid.user) {
      return valid;
    }
    return get().completeLogin(valid.user);
  },

  logout: () => {
    const user = get().currentUser;
    if (user) {
      recordAuditEvent({
        actor: user.name,
        role: user.role,
        action: "SESSION_TERMINATED",
        target: "Auth Service",
        status: "SUCCESS"
      });
    }
    set({ currentUser: null });
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  },

  register: (data) => {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const exists = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) return { success: false, message: "An account with this email already exists." };

    const newUser: User = {
      ...data,
      id: generateId(data.role),
      status: data.role === "trainee" ? "active" : "pending",
      createdAt: new Date().toISOString(),
      traineeProfile: data.role === "trainee" ? {
        bio: "",
        qualifications: [],
        experience: [],
        skills: [],
        interests: [],
        certificates: [],
        phone: "",
        department: "",
        designation: "",
        xpPoints: 100,
        streakDays: 1,
        completedCoursesCount: 0,
        badges: []
      } : undefined,
      trainerProfile: data.role === "trainer" ? {
        bio: "",
        expertise: [],
        competencies: [],
        phone: "",
        department: "",
        designation: "",
        experience: "",
        rating: 5.0,
        totalStudentsTaught: 0,
        verifiedCredentials: []
      } : undefined
    };

    saveToStorage(STORAGE_KEYS.USERS, [...users, newUser]);
    dbService.create('users', newUser);
    recordAuditEvent({
      actor: newUser.name,
      role: newUser.role,
      action: "ACCOUNT_REGISTERED",
      target: "Pending Approvals Registry",
      status: "SUCCESS"
    });
    return { success: true, message: "Registration successful!" };
  },

  updateProfile: (updates) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const updated = users.map((u) => (u.id === currentUser.id ? { ...u, ...updates } : u));
    saveToStorage(STORAGE_KEYS.USERS, updated);
    const updatedUser = { ...currentUser, ...updates };
    set({ currentUser: updatedUser });
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ userId: updatedUser.id }));
    dbService.update('users', currentUser.id, updates);
  }
}));
