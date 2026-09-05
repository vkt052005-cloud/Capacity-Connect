import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, RotateCcw, Home } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";

export const NotFoundPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    addToast({
      title: "Zero-404 Auto Recovery",
      message: "Broken or mistyped route safely redirected to your active portal dashboard.",
      type: "info"
    });

    const timer = setTimeout(() => {
      if (currentUser?.role === "admin") navigate("/admin/dashboard");
      else if (currentUser?.role === "trainer") navigate("/trainer/dashboard");
      else if (currentUser?.role === "trainee") navigate("/trainee/dashboard");
      else navigate("/");
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black text-white relative">
      <div className="glass-panel p-8 max-w-md w-full text-center space-y-4 border border-white/15 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/20 text-[#2997ff] flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-white">Zero-404 Fault-Tolerant Routing</h2>
        <p className="text-xs text-slate-400">
          The requested link was not found or was unpublished. Returning you smoothly to your active workspace...
        </p>
        <div className="pt-2">
          <button
            onClick={() => navigate("/")}
            className="apple-btn-primary text-xs px-5 py-2 font-bold"
          >
            <Home className="w-3.5 h-3.5" /> Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};
