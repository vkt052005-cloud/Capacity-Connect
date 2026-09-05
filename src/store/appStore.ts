import { create } from "zustand";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title?: string;
  message: string;
}

interface AppState {
  dataSaverMode: boolean;
  toggleDataSaverMode: () => void;
  activeVideoQuality: "1080p" | "720p" | "480p" | "auto";
  setVideoQuality: (q: "1080p" | "720p" | "480p" | "auto") => void;
  zoomLevel: number;
  setZoomLevel: (lvl: number) => void;
  increaseZoom: () => void;
  decreaseZoom: () => void;
  resetZoom: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  zoomModalOpen: boolean;
  activeZoomSession: any;
  openZoomModal: (session?: any, isHost?: boolean) => void;
  closeZoomModal: () => void;
  certificateVerifierOpen: boolean;
  setCertificateVerifierOpen: (open: boolean) => void;
  toasts: Toast[];
  addToast: (
    toastOrMsg: string | { title?: string; message: string; type?: Toast["type"] },
    legacyType?: Toast["type"]
  ) => void;
  removeToast: (id: string) => void;
}

export const ZOOM_LEVELS = [90, 100, 110, 120, 125, 130, 140] as const;
export type ZoomLevel = (typeof ZOOM_LEVELS)[number];

const initialZoom = Number(localStorage.getItem("displayZoom")) || 100;
if (typeof document !== "undefined") {
  document.documentElement.style.fontSize = (11.5 * (initialZoom / 100)).toFixed(1) + "px";
}

export const useAppStore = create<AppState>((set, get) => ({
  dataSaverMode: localStorage.getItem("dataSaver") === "true",
  toggleDataSaverMode: () => {
    const next = !get().dataSaverMode;
    localStorage.setItem("dataSaver", String(next));
    set({
      dataSaverMode: next,
      activeVideoQuality: next ? "480p" : "1080p"
    });
    get().addToast({
      title: next ? "Data-Saver Mode Active" : "Standard 1080p Streaming",
      message: next ? "Video quality locked to 480p low-bandwidth mode." : "Full HD 1080p streaming restored.",
      type: "info"
    });
  },

  activeVideoQuality: "1080p",
  setVideoQuality: (q) => set({ activeVideoQuality: q }),

  zoomLevel: Number(localStorage.getItem("displayZoom")) || 100,
  setZoomLevel: (lvl: number) => {
    const clamped = Math.min(160, Math.max(70, lvl));
    localStorage.setItem("displayZoom", String(clamped));
    const basePx = (15 * (clamped / 100)).toFixed(1);
    if (typeof document !== "undefined") {
      document.documentElement.style.fontSize = basePx + "px";
    }
    set({ zoomLevel: clamped });
  },
  increaseZoom: () => {
    const current = get().zoomLevel;
    const next = ZOOM_LEVELS.find((lvl) => lvl > current) ?? current;
    get().setZoomLevel(next);
  },
  decreaseZoom: () => {
    const current = get().zoomLevel;
    const prev = [...ZOOM_LEVELS].reverse().find((lvl) => lvl < current) ?? current;
    get().setZoomLevel(prev);
  },
  resetZoom: () => {
    get().setZoomLevel(100);
  },

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  zoomModalOpen: false,
  activeZoomSession: null,
  openZoomModal: (session = null, _isHost = false) =>
    set({
      zoomModalOpen: true,
      activeZoomSession: session
    }),
  closeZoomModal: () => set({ zoomModalOpen: false, activeZoomSession: null }),
  certificateVerifierOpen: false,
  setCertificateVerifierOpen: (open) => set({ certificateVerifierOpen: open }),

  toasts: [],
  addToast: (toastOrMsg, legacyType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    let newToast: Toast;
    if (typeof toastOrMsg === "string") {
      newToast = {
        id,
        title: legacyType === "success" ? "Success" : legacyType === "error" ? "Error" : "Notification",
        message: toastOrMsg,
        type: legacyType
      };
    } else {
      newToast = {
        id,
        title: toastOrMsg.title || "Notification",
        message: toastOrMsg.message,
        type: toastOrMsg.type || "info"
      };
    }
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
}));
