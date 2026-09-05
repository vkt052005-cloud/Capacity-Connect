import React, { useRef } from "react";
import { Award, QrCode, Download, Share2, CheckCircle2, Shield, X, Printer } from "lucide-react";
import { Certificate } from "../../types";
import { useAppStore } from "../../store/appStore";

interface CertificateModalProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  isOpen,
  onClose
}) => {
  const { addToast } = useAppStore();
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !certificate) return null;

  const handleDownload = () => {
    window.print();
    addToast({
      title: "Exporting Certificate",
      message: "Ready for PDF print & digital download.",
      type: "success"
    });
  };

  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn">
      <div className="relative max-w-2xl w-full glass-panel border border-white/20 shadow-2xl p-6 sm:p-8 space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Frame */}
        <div
          ref={certRef}
          className="relative rounded-2xl bg-gradient-to-br from-[#0e111a] via-[#141824] to-[#0b0d14] p-8 sm:p-10 border-2 border-[#2997ff]/40 shadow-[0_0_50px_rgba(0,113,227,0.25)] text-center space-y-6 overflow-hidden"
        >
          {/* Subtle watermark badge in background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#0071e3]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Org & Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-9 h-9 rounded-xl bg-[#0071e3]/20 border border-[#2997ff]/40 flex items-center justify-center text-[#2997ff] font-bold text-xs font-mono">
                CC
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-tight">CAPACITY CONNECT</h4>
                <p className="text-[10px] text-slate-400">Digital Capacity Building & Learning Governance</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <Shield className="w-3.5 h-3.5" />
              <span>Cryptographically Verified</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#2997ff]">
              Certificate of Mastery & Competency
            </span>
            <p className="text-xs text-slate-400">This is proudly awarded to</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight py-1 font-serif">
              {certificate.traineeName}
            </h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              for successfully completing all modules, live interactive sessions, and passing the proctored assessment with {certificate.grade || "Distinction"} for:
            </p>
            <h3 className="text-base sm:text-lg font-bold text-[#2997ff] mt-2">
              {certificate.courseTitle}
            </h3>
          </div>

          {/* Signatures & Verifiable QR */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 items-center text-xs">
            <div className="text-left space-y-1">
              <p className="font-semibold text-white">{certificate.trainerName}</p>
              <p className="text-[10px] text-slate-400">Lead Faculty & Trainer</p>
            </div>

            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="w-16 h-16 bg-white p-1 rounded-xl shadow-lg border border-[#2997ff]/40">
                <img
                  src={"https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=" + (certificate.verificationUrl || ("https://capacityconnect.org/verify/" + certificate.certificateHash))}
                  alt="Verification QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[9px] font-mono text-slate-400">{certificate.certificateHash}</span>
            </div>

            <div className="text-right space-y-1">
              <p className="font-semibold text-white">{formattedDate}</p>
              <p className="text-[10px] text-slate-400">Issue & Validation Date</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-slate-400 font-mono">
            Hash: <span className="text-[#2997ff]">{certificate.certificateHash}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownload}
              className="apple-btn-primary flex-1 sm:flex-none text-xs px-4 py-2 font-semibold"
            >
              <Download className="w-4 h-4" /> Download / Print PDF
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(certificate.verificationUrl || ("https://capacityconnect.org/verify/" + certificate.certificateHash));
                addToast({
                  title: "Verification Link Copied",
                  message: "Shareable public verification URL copied to clipboard.",
                  type: "info"
                });
              }}
              className="apple-btn-secondary flex-1 sm:flex-none text-xs px-4 py-2"
            >
              <Share2 className="w-4 h-4" /> Share Credential
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
