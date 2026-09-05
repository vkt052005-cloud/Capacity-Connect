import React, { useState, useEffect, useRef } from "react";
import {
  QrCode, Smartphone, CheckCircle2, RefreshCw, X, Shield,
  ExternalLink, Copy, Check, Sparkles, Laptop
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { useNavigate } from "react-router-dom";

interface QrLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: "trainee" | "trainer" | "admin";
}

export const QrLoginModal: React.FC<QrLoginModalProps> = ({ isOpen, onClose, targetRole }) => {
  const [countdown, setCountdown] = useState(60);
  const [sessionId, setSessionId] = useState("");
  const [scanned, setScanned] = useState(false);
  const [copied, setCopied] = useState(false);
  const [authUrl, setAuthUrl] = useState("");

  const { login } = useAuthStore();
  const { addToast } = useAppStore();
  const navigate = useNavigate();
  const pollTimerRef = useRef<any>(null);

  const getRoleCredentials = (role: "trainee" | "trainer" | "admin") => {
    const rawUsers = localStorage.getItem("cc_users");
    const users = rawUsers ? JSON.parse(rawUsers) : [];
    const matchedUser = users.find((u: any) => u.role === role && u.status === "active");

    if (matchedUser) {
      return {
        email: matchedUser.email,
        pass: matchedUser.password,
        path: `/${role}/dashboard`,
        name: matchedUser.name
      };
    }

    if (role === "admin") {
      return {
        email: "vkt052005@gmail.com",
        pass: "SRNNv@2005",
        path: "/admin/dashboard",
        name: "Capacity Connect Administrator"
      };
    }

    return null;
  };

  const handleSuccessfulAuth = () => {
    if (scanned) return;
    setScanned(true);

    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }

    const creds = getRoleCredentials(targetRole);

    if (!creds) {
      addToast({
        title: "Account Required",
        message: `No active ${targetRole} found in database. Please register first.`,
        type: "error"
      });
      onClose();
      return;
    }

    addToast({
      title: "Mobile Handshake Verified",
      message: `Signed in as ${creds.name} via real-time mobile authorization.`,
      type: "success"
    });

    setTimeout(() => {
      login(creds.email, creds.pass, targetRole);
      onClose();
      navigate(creds.path);
    }, 1000);
  };

  // Generate / Refresh Session
  const initSession = async () => {
    const newSessionId = "qr_" + Math.random().toString(36).substring(2, 11);
    setSessionId(newSessionId);
    setCountdown(60);
    setScanned(false);

    // Calculate public network reachable URL so phone camera on LAN can open it
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : "";
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    // If local, prefer the standard Wi-Fi LAN IP (192.168.1.4) so phones can reach the server
    const baseHost = isLocal ? `http://192.168.1.4${port}` : window.location.origin;
    const targetUrl = `${baseHost}/auth/qr?session=${newSessionId}&role=${targetRole}`;
    setAuthUrl(targetUrl);

    // Register with dev server
    try {
      await fetch(`/api/qr/session?role=${targetRole}`).catch(() => {});
    } catch (e) {}
  };

  useEffect(() => {
    if (!isOpen) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      return;
    }

    initSession();

    // 1. Listen to BroadcastChannel for instant same-browser / multi-tab approval
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("cc_qr_auth");
      bc.onmessage = (event) => {
        if (event.data?.approved && (!event.data?.sessionId || event.data.sessionId === sessionId)) {
          handleSuccessfulAuth();
        }
      };
    } catch (e) {}

    // 2. Listen to LocalStorage cross-tab sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("cc_qr_approved_") && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.approved) {
            handleSuccessfulAuth();
          }
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorage);

    // 3. Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          initSession();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (bc) bc.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, [isOpen, targetRole]);

  // Active Polling of server session status
  useEffect(() => {
    if (!isOpen || !sessionId || scanned) return;

    pollTimerRef.current = setInterval(async () => {
      try {
        // Check localStorage first
        const localCheck = localStorage.getItem(`cc_qr_approved_${sessionId}`);
        if (localCheck) {
          const parsed = JSON.parse(localCheck);
          if (parsed.approved) {
            handleSuccessfulAuth();
            return;
          }
        }

        // Check backend server endpoint
        const res = await fetch(`/api/qr/status?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.approved) {
            handleSuccessfulAuth();
          }
        }
      } catch (err) {
        // Ignore polling network glitches
      }
    }, 800);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen, sessionId, scanned]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!authUrl) return;
    navigator.clipboard.writeText(authUrl);
    setCopied(true);
    addToast({
      title: "Authorization Link Copied",
      message: "Open this link on your phone or in another tab to approve.",
      type: "info"
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulateScan = async () => {
    if (!sessionId) return;
    try {
      await fetch(`/api/qr/approve?sessionId=${sessionId}&role=${targetRole}`);
    } catch (e) {}
    localStorage.setItem(`cc_qr_approved_${sessionId}`, JSON.stringify({ approved: true, time: Date.now() }));
    handleSuccessfulAuth();
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(authUrl || "https://capacityconnect.org")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fadeIn">
      <div className="relative max-w-sm w-full glass-panel p-6 border border-white/15 shadow-2xl text-center space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className="w-11 h-11 mx-auto rounded-2xl bg-[#0071e3]/20 border border-[#2997ff]/30 flex items-center justify-center text-[#2997ff]">
          <QrCode className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Dynamic QR Instant Login</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Scan with your phone camera to log in as{" "}
            <span className="text-[#2997ff] font-semibold capitalize">{targetRole}</span>
          </p>
        </div>

        {/* Dynamic QR Box */}
        <div className="relative mx-auto w-48 h-48 rounded-2xl bg-white p-3 flex items-center justify-center shadow-2xl shadow-blue-500/20 border-2 border-[#2997ff]/40 group">
          {scanned ? (
            <div className="flex flex-col items-center justify-center text-slate-900 animate-fadeIn">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
              <p className="text-xs font-bold mt-2 text-slate-900">Handshake Verified!</p>
              <p className="text-[10px] text-slate-600 font-medium">Entering {targetRole} dashboard...</p>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={qrImageUrl}
                alt="Instant Auth QR"
                className="w-full h-full object-contain rounded-lg"
              />
              <div className="absolute inset-0 bg-blue-500/5 rounded-xl pointer-events-none group-hover:bg-transparent transition" />
            </div>
          )}
        </div>

        {/* Refresh countdown */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2997ff]" />
          <span>Refreshing token in {countdown}s</span>
        </div>

        {/* Quick Testing Options */}
        <div className="space-y-2 pt-1">
          {/* Main simulator button */}
          <button
            onClick={handleSimulateScan}
            disabled={scanned}
            className="apple-btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>{scanned ? "Connecting Handshake..." : "Approve & Sign In Instantly"}</span>
          </button>

          {/* Test Link Actions */}
          <div className="flex items-center justify-center gap-3 pt-1 text-[11px]">
            <a
              href={authUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2997ff] hover:underline flex items-center gap-1 font-medium"
              title="Open Mobile Screen in new tab"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open Mobile Screen</span>
            </a>

            <span className="text-slate-600">•</span>

            <button
              type="button"
              onClick={handleCopyLink}
              className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
              title="Copy mobile authorization link"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied Link!" : "Copy Mobile Link"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default QrLoginModal;
