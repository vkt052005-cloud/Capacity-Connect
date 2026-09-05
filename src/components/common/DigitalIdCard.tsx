import React, { useState } from "react";
import {
  ShieldCheck, Award, Download, Copy, Check, QrCode,
  Sparkles, ExternalLink, Building2, User
} from "lucide-react";
import { useAppStore } from "../../store/appStore";

interface DigitalIdCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "trainee" | "trainer" | "admin";
    department?: string;
    designation?: string;
  };
}

export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({ user }) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useAppStore();

  const regCode = `CC-${user.role.substring(0, 2).toUpperCase()}-2026-${user.id.replace(/\D/g, "").slice(-4) || "8841"}`;
  const verificationUrl = `${window.location.origin}/verify/id?id=${encodeURIComponent(user.id)}&name=${encodeURIComponent(user.name)}&role=${encodeURIComponent(user.role)}&code=${encodeURIComponent(regCode)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=4&data=${encodeURIComponent(verificationUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    addToast({
      title: "Verification Link Copied",
      message: "Direct QR verification URL copied to clipboard.",
      type: "success"
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="glass-panel p-6 border border-white/15 relative overflow-hidden bg-gradient-to-br from-[#0a0d18] via-[#101424] to-[#080a10] rounded-3xl shadow-2xl">
      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#2997ff] font-bold">
              Official Digital Credential Card
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
            Capacity Connect Smart ID
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge-purple text-[10px] uppercase font-bold tracking-wider px-3 py-1">
            {user.role} PASS
          </span>
          <span className="badge-green text-[10px] font-semibold px-2.5 py-1">
            VERIFIED
          </span>
        </div>
      </div>

      {/* Main Card Body */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 items-center">
        {/* User Details */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0071e3] to-[#2997ff] flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-500/25 border border-white/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-xl font-bold text-white tracking-tight">{user.name}</h4>
              <p className="text-xs text-[#2997ff] font-medium mt-0.5">
                {user.designation || (user.role === "trainer" ? "Lead Technical Faculty" : "Certified Trainee")}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                {user.department || "National Capacity Building Commission"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">Registration Code</span>
              <span className="text-xs font-mono font-bold text-white mt-0.5 block">{regCode}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">Security Level</span>
              <span className="text-xs font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Tier 1 Cleared
              </span>
            </div>
          </div>
        </div>

        {/* QR Code & Scan Prompt */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-2">
          <div className="relative group p-2 bg-white rounded-xl shadow-xl shadow-black/50 border-2 border-[#2997ff]/40">
            <img
              src={qrCodeUrl}
              alt={`QR Verification for ${user.name}`}
              className="w-32 h-32 object-contain"
              loading="lazy"
            />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-300 block font-semibold">
              Scan with Smartphone
            </span>
            <span className="text-[9px] text-slate-500 block">
              Instant Public Verification
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 mt-5 border-t border-white/10 text-xs">
        <span className="text-[11px] text-slate-400">
          Digital ID powered by Capacity Connect Cryptographic Seal
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 sm:flex-initial apple-btn-secondary text-xs px-3 py-1.5 font-medium flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Link"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 sm:flex-initial apple-btn-primary text-xs px-3 py-1.5 font-medium flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default DigitalIdCard;
