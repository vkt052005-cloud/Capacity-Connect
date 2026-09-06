import { create } from "zustand";
import type { User, TrainerProfile } from "../types";
import { STORAGE_KEYS, getFromStorage, saveToStorage, generateId, initialUsers } from "../data/seed";
import { dbService } from "../services/db";
import { recordAuditEvent } from "./auditStore";

const defaultRajTrainerProfile: TrainerProfile = {
  bio: "Senior Technical Educator & Mentor specializing in Computer Science, Full-Stack Architecture, and Systems Engineering.",
  expertise: ["Full-Stack Architecture", "Python", "JavaScript", "C Programming"],
  competencies: ["Hands-on Coding", "Curriculum Design", "Real-world Projects"],
  phone: "+91 98765 11111",
  department: "Computer Science & Engineering",
  designation: "Senior Technical Educator & Mentor",
  experience: "10+ Years Technical Education",
  rating: 4.99,
  totalStudentsTaught: 60000,
  verifiedCredentials: ["Senior Educator", "Verified LMS Faculty"],
  isVerifiedByAdmin: true
};

function sanitizeUserForSession(user: User): User {
  if (
    user.email?.toLowerCase() === "tiwariraj052005@gmail.com" ||
    (user.id === "u-trainer-official" && !user.email?.toLowerCase().includes("harry")) ||
    user.id === "trainer-mto8vdlt-rpmv8"
  ) {
    return {
      ...user,
      id: "u-trainer-official",
      name: "Raj Tiwari",
      email: "tiwariraj052005@gmail.com",
      trainerProfile: {
        ...defaultRajTrainerProfile,
        ...(user.trainerProfile || {}),
        bio: defaultRajTrainerProfile.bio,
        designation: defaultRajTrainerProfile.designation,
        verifiedCredentials: defaultRajTrainerProfile.verifiedCredentials,
        isVerifiedByAdmin: true
      }
    };
  } else if (user.email?.toLowerCase() === "codewithharry@gmail.com" || user.id === "u-trainer-codewithharry") {
    return {
      ...user,
      id: "u-trainer-codewithharry",
      name: "CodeWithHarry (Haris Khan)",
      email: "codewithharry@gmail.com"
    };
  }
  return user;
}

function getInitialAuthUser(): User | null {
  try {
    const rawAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!rawAuth) return null;
    const parsed = JSON.parse(rawAuth);
    const targetId = parsed?.userId || parsed?.user?.id || parsed?.id;
    const targetEmail = (parsed?.user?.email || parsed?.email || "").toLowerCase();

    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    let users: User[] = [];
    if (rawUsers) {
      try {
        users = JSON.parse(rawUsers);
      } catch (e) {}
    }
    if (!users || !users.length) {
      users = initialUsers;
    }

    let user: User | undefined;
    if (targetId) {
      user = users.find((u) => u.id === targetId);
    }
    if (!user && targetEmail) {
      user = users.find((u) => u.email?.toLowerCase() === targetEmail);
    }
    if (!user && targetId) {
      user = initialUsers.find((u) => u.id === targetId);
    }
    if (!user && parsed?.user && parsed.user.name && parsed.user.role) {
      user = parsed.user;
    }

    if (user) {
      return sanitizeUserForSession(user);
    }
  } catch (e) {
    console.error("Failed to load initial auth user", e);
  }
  return null;
}

interface AuthState {
  currentUser: User | null;
  isInitialized: boolean;
  login: (email: string, password: string, requiredRole?: User["role"]) => { success: boolean; message: string; user?: User };
  validateCredentials: (email: string, password: string, requiredRole?: User["role"]) => { success: boolean; message: string; user?: User };
  completeLogin: (user: User) => { success: boolean; message: string; user: User };
  logout: () => void;
  register: (data: Omit<User, "id" | "createdAt" | "status">) => { success: boolean; message: string };
  updateProfile: (updates: Partial<User>) => void;
  loadFromStorage: () => void;
  findUserForRecovery: (query: { name: string; department?: string; designation?: string; role?: User["role"] }) => {
    success: boolean;
    message: string;
    accounts: Array<{
      id: string;
      name: string;
      maskedEmail: string;
      rawEmail: string;
      role: User["role"];
      department: string;
      designation: string;
      status: User["status"];
    }>;
  };
  resetUserPassword: (email: string, newPassword: string, requiredRole?: User["role"]) => {
    success: boolean;
    message: string;
  };
  submitRecoveryTicket: (ticket: {
    name: string;
    contactInfo: string;
    role: User["role"];
    description: string;
  }) => {
    success: boolean;
    message: string;
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: getInitialAuthUser(),
  isInitialized: true,

  loadFromStorage: () => {
    const user = getInitialAuthUser();
    if (user) {
      set({ currentUser: user, isInitialized: true });
    } else {
      const rawAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (!rawAuth) {
        set({ currentUser: null, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
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
    const sanitizedUser = sanitizeUserForSession(user);
    set({ currentUser: sanitizedUser, isInitialized: true });
    localStorage.setItem(
      STORAGE_KEYS.AUTH,
      JSON.stringify({ userId: sanitizedUser.id, user: sanitizedUser })
    );
    recordAuditEvent({
      actor: sanitizedUser.name,
      role: sanitizedUser.role,
      action: "SESSION_AUTHENTICATED",
      target: `${sanitizedUser.role.toUpperCase()} Portal`,
      status: "SUCCESS"
    });
    return { success: true, message: "Login successful!", user: sanitizedUser };
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
    localStorage.setItem(
      STORAGE_KEYS.AUTH,
      JSON.stringify({ userId: updatedUser.id, user: updatedUser })
    );
    dbService.update('users', currentUser.id, updates);
  },

  findUserForRecovery: (query) => {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const searchName = (query.name || "").trim().toLowerCase();

    if (!searchName || searchName.length < 2) {
      return {
        success: false,
        message: "Please enter at least 2 characters of your registered name.",
        accounts: []
      };
    }

    const searchDept = (query.department || "").trim().toLowerCase();
    const searchDesig = (query.designation || "").trim().toLowerCase();

    const matches = users.filter((u) => {
      if (query.role && u.role !== query.role) {
        return false;
      }

      const nameMatch = u.name.toLowerCase().includes(searchName);
      if (!nameMatch) return false;

      const uDept = (u.department || u.traineeProfile?.department || u.trainerProfile?.department || "").toLowerCase();
      if (searchDept && searchDept !== "all" && !uDept.includes(searchDept)) {
        return false;
      }

      const uDesig = (u.designation || u.traineeProfile?.designation || u.trainerProfile?.designation || "").toLowerCase();
      if (searchDesig && searchDesig !== "all" && !uDesig.includes(searchDesig)) {
        return false;
      }

      return true;
    });

    if (matches.length === 0) {
      return {
        success: false,
        message: "No registered account matched the provided name and department. Please verify spelling or contact support.",
        accounts: []
      };
    }

    const accounts = matches.map((u) => {
      const parts = u.email.split("@");
      let maskedEmail = u.email;
      if (parts.length === 2) {
        const [n, d] = parts;
        const prefix = n.length > 3 ? n.slice(0, 3) : n.slice(0, 1);
        const suffix = n.length > 3 ? n.slice(-2) : "";
        maskedEmail = `${prefix}*****${suffix}@${d}`;
      }

      return {
        id: u.id,
        name: u.name,
        maskedEmail,
        rawEmail: u.email,
        role: u.role,
        department: u.department || u.traineeProfile?.department || u.trainerProfile?.department || "Computer Science & Engineering",
        designation: u.designation || u.traineeProfile?.designation || u.trainerProfile?.designation || (u.role === "trainee" ? "Undergraduate Student" : "Faculty Trainer"),
        status: u.status
      };
    });

    return {
      success: true,
      message: `Found ${accounts.length} verified account(s) matching "${query.name}".`,
      accounts
    };
  },

  resetUserPassword: (email, newPassword, requiredRole) => {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (userIndex === -1) {
      return { success: false, message: "Account not found with this official email address." };
    }

    const user = users[userIndex];
    if (user.role === "admin") {
      return {
        success: false,
        message: "Administrative accounts cannot be reset via self-service recovery. Please contact a Super Administrator."
      };
    }

    if (requiredRole && user.role !== requiredRole) {
      return {
        success: false,
        message: `Account role mismatch: This email is registered as an ${user.role.toUpperCase()}.`
      };
    }

    if (user.status === "suspended" || user.status === "inactive") {
      return { success: false, message: "This account is inactive or suspended. Please contact an administrator." };
    }

    user.password = newPassword;
    users[userIndex] = user;
    saveToStorage(STORAGE_KEYS.USERS, users);
    dbService.update('users', user.id, { password: newPassword });

    recordAuditEvent({
      actor: user.name,
      role: user.role,
      action: "PASSWORD_RESET_SUCCESS",
      target: "Auth Credentials Service",
      status: "SUCCESS"
    });

    const current = get().currentUser;
    if (current && current.id === user.id) {
      set({ currentUser: { ...user, password: newPassword } });
    }

    return {
      success: true,
      message: "Password updated successfully. You can now sign in with your new credentials."
    };
  },

  submitRecoveryTicket: (ticket) => {
    recordAuditEvent({
      actor: ticket.name,
      role: ticket.role,
      action: "ACCOUNT_RECOVERY_TICKET_FILED",
      target: "Admin Governance Ledger",
      status: "WARNING"
    });

    try {
      const notifs = getFromStorage<any>(STORAGE_KEYS.NOTIFICATIONS);
      const newNotif = {
        id: generateId("notif-recovery"),
        type: "alert",
        title: `Credential Assistance Request: ${ticket.name} (${ticket.role.toUpperCase()})`,
        content: `User reported inaccessible credentials. Contact: ${ticket.contactInfo}. Details: ${ticket.description}`,
        createdAt: new Date().toISOString(),
        pinned: true,
        author: "Security & Recovery Sentinel"
      };
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...notifs]);
    } catch (e) {}

    return {
      success: true,
      message: "Your recovery ticket has been submitted to the platform administrator for manual verification."
    };
  }
}));
