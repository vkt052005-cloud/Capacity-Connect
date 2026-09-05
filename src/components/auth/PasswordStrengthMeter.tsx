import React from "react";
import { ShieldCheck, ShieldAlert, Check, X } from "lucide-react";

export interface PasswordStrengthResult {
  score: number;
  checks: {
    length: boolean;
    upper: boolean;
    lower: boolean;
    number: boolean;
    special: boolean;
  };
  level: "empty" | "weak" | "fair" | "strong" | "very-strong";
  label: string;
  color: string;
  textColor: string;
  isStrong: boolean;
}

export const checkPasswordStrength = (pwd: string): PasswordStrengthResult => {
  const checks = {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd)
  };

  const score = Object.values(checks).filter(Boolean).length;

  if (!pwd) {
    return {
      score: 0,
      checks,
      level: "empty",
      label: "",
      color: "bg-slate-700",
      textColor: "text-slate-500",
      isStrong: false
    };
  }

  // A password MUST have at least 8 chars and at least 4 of the 5 criteria to be classified as Strong
  if (score <= 2 || pwd.length < 6) {
    return {
      score,
      checks,
      level: "weak",
      label: "Weak",
      color: "bg-rose-500",
      textColor: "text-rose-400",
      isStrong: false
    };
  }

  if (score === 3 || pwd.length < 8) {
    return {
      score,
      checks,
      level: "fair",
      label: "Fair (Below Required Level)",
      color: "bg-amber-500",
      textColor: "text-amber-400",
      isStrong: false
    };
  }

  if (score === 4) {
    return {
      score,
      checks,
      level: "strong",
      label: "Strong",
      color: "bg-emerald-500",
      textColor: "text-emerald-400",
      isStrong: true
    };
  }

  return {
    score,
    checks,
    level: "very-strong",
    label: "Very Strong",
    color: "bg-cyan-400",
    textColor: "text-cyan-300",
    isStrong: true
  };
};

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  showRequirements = true
}) => {
  if (!password) return null;

  const strength = checkPasswordStrength(password);

  return (
    <div className="space-y-2 mt-2 p-3 rounded-xl bg-black/40 border border-white/10 animate-fadeIn">
      {/* Header Level Indicator */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400 font-medium">Security Level:</span>
        <span className={`text-xs font-bold ${strength.textColor} flex items-center gap-1`}>
          {strength.isStrong ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          )}
          {strength.label}
        </span>
      </div>

      {/* 4-Segment Strength Progress Bar */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.color : "bg-white/10"}`} />
        <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.color : "bg-white/10"}`} />
        <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 4 ? strength.color : "bg-white/10"}`} />
        <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 5 ? strength.color : "bg-white/10"}`} />
      </div>

      {/* Checklist of security requirements */}
      {showRequirements && (
        <div className="pt-1 grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
          <span
            className={`px-2 py-0.5 rounded-md border flex items-center gap-1 transition ${
              strength.checks.length
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-white/5 border-white/10 text-slate-400"
            }`}
          >
            {strength.checks.length ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <X className="w-2.5 h-2.5 text-slate-500" />}
            8+ characters
          </span>
          <span
            className={`px-2 py-0.5 rounded-md border flex items-center gap-1 transition ${
              strength.checks.upper
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-white/5 border-white/10 text-slate-400"
            }`}
          >
            {strength.checks.upper ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <X className="w-2.5 h-2.5 text-slate-500" />}
            Uppercase (A-Z)
          </span>
          <span
            className={`px-2 py-0.5 rounded-md border flex items-center gap-1 transition ${
              strength.checks.lower
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-white/5 border-white/10 text-slate-400"
            }`}
          >
            {strength.checks.lower ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <X className="w-2.5 h-2.5 text-slate-500" />}
            Lowercase (a-z)
          </span>
          <span
            className={`px-2 py-0.5 rounded-md border flex items-center gap-1 transition ${
              strength.checks.number
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-white/5 border-white/10 text-slate-400"
            }`}
          >
            {strength.checks.number ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <X className="w-2.5 h-2.5 text-slate-500" />}
            Number (0-9)
          </span>
          <span
            className={`px-2 py-0.5 rounded-md border flex items-center gap-1 col-span-2 sm:col-span-2 transition ${
              strength.checks.special
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-white/5 border-white/10 text-slate-400"
            }`}
          >
            {strength.checks.special ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <X className="w-2.5 h-2.5 text-slate-500" />}
            Special symbol (!@#$%)
          </span>
        </div>
      )}

      {/* Enforcement Notice */}
      {!strength.isStrong ? (
        <div className="text-[10.5px] text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>Security requirement: Passwords below <strong>Strong</strong> level are not accepted.</span>
        </div>
      ) : (
        <div className="text-[10.5px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Password satisfies the required <strong>Strong</strong> security level.</span>
        </div>
      )}
    </div>
  );
};
