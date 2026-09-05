import React, { useEffect, useState } from "react";
import { ShieldAlert, AlertTriangle, Eye, Lock } from "lucide-react";
import { useAppStore } from "../../store/appStore";

interface ProctoringGuardProps {
  onViolation: (count: number, log: string) => void;
  maxViolations?: number;
}

export const ProctoringGuard: React.FC<ProctoringGuardProps> = ({
  onViolation,
  maxViolations = 3
}) => {
  const [violations, setViolations] = useState(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const { addToast } = useAppStore();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const next = violations + 1;
        setViolations(next);
        const log = "Tab switch / background blur detected at " + new Date().toLocaleTimeString();
        onViolation(next, log);
        setWarningMessage("Warning (" + next + "/" + maxViolations + "): Navigating away from the assessment window is strictly logged by the proctoring engine.");
        addToast({
          title: "Proctoring Alert: Tab Switch Logged",
          message: "Warning " + next + "/" + maxViolations + ". Loss of browser focus detected.",
          type: "warning"
        });
      }
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      addToast({
        title: "Proctoring Notice",
        message: "Clipboard copy/paste is restricted during timed assessments.",
        type: "warning"
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
    };
  }, [violations]);

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 text-xs">
      <div className="flex items-center gap-2 text-slate-300">
        <ShieldAlert className="w-4 h-4 text-emerald-400" />
        <span className="font-semibold text-white">Live Proctoring Active</span>
        <span className="text-[10px] text-slate-400 hidden sm:inline">• Tab-focus & Fullscreen monitored</span>
      </div>

      <div className="flex items-center gap-2">
        <span className={"badge text-[10px] " + (violations > 0 ? "badge-red" : "badge-green")}>
          {violations} / {maxViolations} Strikes
        </span>
      </div>
    </div>
  );
};
