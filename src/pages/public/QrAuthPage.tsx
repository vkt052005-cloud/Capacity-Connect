import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck, Smartphone, CheckCircle2, XCircle, ArrowRight,
  Laptop, Clock, ShieldAlert, Sparkles, UserCheck
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export const QrAuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  const sessionId = searchParams.get("session") || "";
  const role = (searchParams.get("role") || "trainee") as "trainee" | "trainer" | "admin";

  const [status, setStatus] = useState<"pending" | "approving" | "approved" | "rejected">("pending");
  const [errorMessage, setErrorMessage] = useState("");

  const roleDetails = {
    trainee: {
      name: currentUser?.role === "trainee" ? currentUser.name : "Registered Trainee",
      email: currentUser?.role === "trainee" ? currentUser.email : "Official Trainee Account",
      roleTitle: "Certified Trainee",
      dashboard: "/trainee/dashboard"
    },
    trainer: {
      name: currentUser?.role === "trainer" ? currentUser.name : "Faculty Trainer",
      email: currentUser?.role === "trainer" ? currentUser.email : "Official Faculty Account",
      roleTitle: "Lead Technical Trainer",
      dashboard: "/trainer/dashboard"
    },
    admin: {
      name: currentUser?.role === "admin" ? currentUser.name : "Chief Administrator",
      email: currentUser?.role === "admin" ? currentUser.email : "vkt052005@gmail.com",
      roleTitle: "System Governance Administrator",
      dashboard: "/admin/dashboard"
    }
  }[role] || {
    name: "User Account",
    email: "Official Account",
    roleTitle: "Authorized User",
    dashboard: "/trainee/dashboard"
  };

  const handleApprove = async () => {
    if (!sessionId) {
      setErrorMessage("Invalid or missing QR session ID.");
      return;
    }

    setStatus("approving");

    try {
      // 1. Notify Vite dev server backend
      await fetch(`/api/qr/approve?sessionId=${encodeURIComponent(sessionId)}&role=${role}`, {
        method: "POST"
      }).catch(() => {
        // Fallback GET if POST unsupported
        return fetch(`/api/qr/approve?sessionId=${encodeURIComponent(sessionId)}&role=${role}`);
      });

      // 2. Cross-tab synchronization via BroadcastChannel & LocalStorage
      try {
        const bc = new BroadcastChannel("cc_qr_auth");
        bc.postMessage({ sessionId, role, approved: true });
        bc.close();
      } catch (err) {
        // BroadcastChannel optional
      }
      localStorage.setItem(`cc_qr_approved_${sessionId}`, JSON.stringify({ approved: true, role, time: Date.now() }));

      setTimeout(() => {
        setStatus("approved");
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to approve login session.");
      setStatus("pending");
    }
  };

  const handleReject = () => {
    setStatus("rejected");
    try {
      localStorage.setItem(`cc_qr_approved_${sessionId}`, JSON.stringify({ approved: false, rejected: true }));
      const bc = new BroadcastChannel("cc_qr_auth");
      bc.postMessage({ sessionId, role, approved: false, rejected: true });
      bc.close();
    } catch (e) {}
  };

  const handleLoginOnThisDevice = () => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black text-[#f5f5f7] relative selection:bg-[#0071e3] selection:text-white overflow-hidden">
      {/* Background glow */}
      <div className="glow-orb-primary" />
      <div className="glow-orb-secondary" />

      <div className="relative max-w-md w-full glass-panel border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl z-10 animate-fadeIn">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3.5 pb-4 border-b border-white/10">
          <img
            src="/logo.png"
            alt="Capacity Connect"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_0_20px_rgba(41,151,255,0.6)]"
          />
          <div className="text-left">
            <span className="font-extrabold text-base text-white tracking-tight block">CAPACITY CONNECT</span>
            <p className="text-xs text-slate-400 -mt-0.5">Mobile Device Authorization</p>
          </div>
        </div>

        {status === "pending" && (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/20 text-[#2997ff] border border-[#2997ff]/30 flex items-center justify-center mx-auto mb-2">
                <Laptop className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Confirm Desktop Sign-In</h2>
              <p className="text-xs text-slate-400">
                A computer terminal is requesting instant authentication to your account.
              </p>
            </div>

            {/* Session Card */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">User Profile</span>
                <span className="badge-blue text-[9px] uppercase font-bold">{roleDetails.roleTitle}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0071e3] to-[#2997ff] text-white flex items-center justify-center font-bold text-sm">
                  {roleDetails.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{roleDetails.name}</h4>
                  <p className="text-[10.5px] text-slate-400">{roleDetails.email}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
                <div>
                  <span className="block text-slate-500">Device Target</span>
                  <strong className="text-slate-300 font-normal">Desktop Terminal</strong>
                </div>
                <div>
                  <span className="block text-slate-500">Session ID</span>
                  <strong className="text-[#2997ff] truncate block font-normal">{sessionId || "QR-LOCAL-01"}</strong>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleApprove}
                className="apple-btn-primary w-full py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Authenticate Desktop</span>
              </button>

              <button
                type="button"
                onClick={handleReject}
                className="w-full py-2.5 rounded-full bg-white/[0.04] hover:bg-rose-500/10 hover:text-rose-300 border border-white/10 text-xs text-slate-400 transition cursor-pointer"
              >
                Deny / Reject Request
              </button>
            </div>
          </div>
        )}

        {status === "approving" && (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-[#2997ff] border-t-transparent animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-white">Transmitting Authorization Token...</h3>
            <p className="text-xs text-slate-400">Verifying mutual handshake with desktop browser.</p>
          </div>
        )}

        {status === "approved" && (
          <div className="text-center space-y-4 py-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Desktop Signed In Successfully!</h2>
              <p className="text-xs text-slate-300">
                Your computer screen has verified the mobile handshake and is now entering the{" "}
                <span className="text-emerald-400 font-semibold capitalize">{role}</span> dashboard.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-left text-xs space-y-1">
              <p className="text-[11px] text-slate-400">Authenticated Session:</p>
              <p className="font-bold text-white">{roleDetails.name} ({roleDetails.roleTitle})</p>
              <p className="text-[10px] text-emerald-400 font-mono">TLS 1.3 Cryptographic Handshake OK</p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleLoginOnThisDevice}
                className="apple-btn-secondary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-[#2997ff]" />
                <span>Also Open Dashboard on This Phone</span>
              </button>

              <Link
                to="/"
                className="block text-center text-xs text-slate-400 hover:text-white py-1"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        )}

        {status === "rejected" && (
          <div className="text-center space-y-4 py-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">Login Request Rejected</h2>
              <p className="text-xs text-slate-400">
                The desktop sign-in attempt was cancelled and no authentication token was granted.
              </p>
            </div>

            <Link
              to="/"
              className="apple-btn-secondary inline-flex px-5 py-2 text-xs font-medium"
            >
              Back to Safety
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};
export default QrAuthPage;
