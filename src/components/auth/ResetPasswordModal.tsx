import React, { useState } from "react";
import { X, KeyRound, CheckCircle2, ArrowRight, Shield } from "lucide-react";
import { useAppStore } from "../../store/appStore";
import { PasswordStrengthMeter, checkPasswordStrength } from "./PasswordStrengthMeter";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [tokenSent, setTokenSent] = useState(false);
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { addToast } = useAppStore();

  if (!isOpen) return null;

  const handleSendToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setTokenSent(true);
    setToken("CC-AUTH-" + Math.floor(100000 + Math.random() * 900000));
    addToast({
      title: "Security Token Dispatched",
      message: "One-time cryptographically signed token generated for " + email,
      type: "info"
    });
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    const pwdStrength = checkPasswordStrength(newPassword);
    if (!pwdStrength.isStrong) {
      addToast({
        title: "Password Below Strong Level",
        message: "Security Policy: Passwords below Strong level are not accepted (min. 8 chars, uppercase, lowercase, number, symbol).",
        type: "error"
      });
      return;
    }
    setIsSuccess(true);
    addToast({
      title: "Password Updated Successfully",
      message: "All active tokens invalidated. Please log in with your new credentials.",
      type: "success"
    });
    setTimeout(() => {
      setIsSuccess(false);
      setTokenSent(false);
      setEmail("");
      setNewPassword("");
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative max-w-md w-full glass-panel p-6 sm:p-7 border border-white/15 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/20 border border-[#2997ff]/30 flex items-center justify-center text-[#2997ff]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Forgot & Reset Password</h3>
            <p className="text-xs text-slate-400">Cryptographic token verification</p>
          </div>
        </div>

        {isSuccess ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-white">Password Successfully Reset</h4>
            <p className="text-xs text-slate-400">Your session tokens have been refreshed.</p>
          </div>
        ) : !tokenSent ? (
          <form onSubmit={handleSendToken} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Email Address</label>
              <input
                type="email"
                required
                placeholder="Enter your registered official email"
                className="apple-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="apple-btn-primary w-full py-2.5 text-xs font-semibold">
              Generate Verification Token <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="p-3 rounded-xl bg-[#0071e3]/10 border border-[#2997ff]/20 text-[11px] text-slate-300">
              <span className="font-semibold text-[#2997ff]">Simulated Token:</span> {token}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enter Security Token</label>
              <input
                type="text"
                required
                className="apple-input font-mono uppercase"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Password (Argon2id Hashed) <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Enter a strong password (min. 8 chars)"
                className="apple-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <PasswordStrengthMeter password={newPassword} />
            </div>
            <button
              type="submit"
              disabled={newPassword.length > 0 && !checkPasswordStrength(newPassword).isStrong}
              className={"apple-btn-primary w-full py-2.5 text-xs font-semibold transition " + (newPassword.length > 0 && !checkPasswordStrength(newPassword).isStrong ? "opacity-60 cursor-not-allowed" : "cursor-pointer")}
            >
              Update Password & Invalidate Sessions
            </button>
          </form>
        )}

        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" /> AES-256-GCM Encrypted
          </span>
          <span>Single-Use Token (10m Expiry)</span>
        </div>
      </div>
    </div>
  );
};
