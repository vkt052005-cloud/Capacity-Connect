import React from "react";
import { useAppStore } from "../../store/appStore";
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl glass-panel shadow-2xl border border-white/15 animate-fadeIn backdrop-blur-2xl"
          style={{ background: "rgba(18, 18, 24, 0.88)" }}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === "info" && <Info className="w-5 h-5 text-[#2997ff]" />}
            {toast.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {toast.type === "error" && <XCircle className="w-5 h-5 text-rose-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-white tracking-tight">{toast.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white transition p-0.5 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
