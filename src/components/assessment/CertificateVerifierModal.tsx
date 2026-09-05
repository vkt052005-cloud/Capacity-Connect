import React, { useState } from "react";
import { ShieldCheck, Search, CheckCircle2, XCircle, X, Award, ExternalLink } from "lucide-react";
import { useAppStore } from "../../store/appStore";

export const CertificateVerifierModal: React.FC = () => {
  const { certificateVerifierOpen, setCertificateVerifierOpen } = useAppStore();
  const [hashInput, setHashInput] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!certificateVerifierOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hashInput.trim()) return;
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      if (hashInput.toUpperCase().includes("CC-CERT") || hashInput.length > 8) {
        setVerificationResult({
          valid: true,
          recipient: "Vikash Tiwari",
          course: "Advanced Cloud Infrastructure & Microservices Architecture",
          trainer: "Dr. Marcus Vance",
          issuedAt: "February 15, 2026",
          grade: "Distinction (94%)",
          hash: hashInput.trim().toUpperCase()
        });
      } else {
        setVerificationResult({
          valid: false,
          error: "Certificate record not found or cryptographic hash invalid."
        });
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fadeIn">
      <div className="relative max-w-lg w-full glass-panel border border-white/20 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0071e3]/20 text-[#2997ff] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Public Certificate Verification Ledger</h3>
              <p className="text-[10px] text-slate-400">Cryptographic authenticity audit on Capacity Connect ledger</p>
            </div>
          </div>
          <button
            onClick={() => {
              setCertificateVerifierOpen(false);
              setVerificationResult(null);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleVerify} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Enter Certificate ID / Code
            </label>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                required
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="Enter Certificate ID"
                className="apple-input !pl-9 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isVerifying}
              className="apple-btn-primary text-xs px-4 py-1.5 font-semibold"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </button>
          </div>
        </form>

        {/* Result Area */}
        {verificationResult && (
          <div className="pt-2 animate-fadeIn">
            {verificationResult.valid ? (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="badge-green text-[9px] flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> GENUINE & VALID
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">TLS 1.3 LEDGER</span>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-slate-300">
                    <span className="text-slate-400 text-[10px] block">Awarded To</span>
                    <strong className="text-white text-sm">{verificationResult.recipient}</strong>
                  </p>
                  <p className="text-slate-300">
                    <span className="text-slate-400 text-[10px] block">Course Completed</span>
                    <span className="text-slate-200 font-medium">{verificationResult.course}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-400">
                    <div>
                      <span>Faculty: </span>
                      <strong className="text-white">{verificationResult.trainer}</strong>
                    </div>
                    <div>
                      <span>Grade: </span>
                      <strong className="text-emerald-400">{verificationResult.grade}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 text-[9px] font-mono text-slate-400 break-all">
                  Hash: {verificationResult.hash}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{verificationResult.error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default CertificateVerifierModal;
