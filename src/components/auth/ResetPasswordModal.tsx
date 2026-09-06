import React, { useState, useEffect, useRef } from "react";
import {
  X, KeyRound, CheckCircle2, ArrowRight, Shield,
  Search, User as UserIcon, Building, HelpCircle,
  Eye, EyeOff, RotateCw, Copy, Check, AlertTriangle, GraduationCap
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { PasswordStrengthMeter, checkPasswordStrength } from "./PasswordStrengthMeter";
import { sendOtpEmail, verifyOtpCode } from "../../services/emailService";
import type { UserRole } from "../../types";

export interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "reset_password" | "recover_id" | "helpdesk";
  defaultRole?: UserRole;
  onSelectRecoveredEmail?: (email: string, role: UserRole) => void;
}

const COMMON_DEPARTMENTS = [
  "All Departments",
  "Computer Science & Engineering",
  "Information Technology",
  "Artificial Intelligence & Machine Learning",
  "Data Science & Big Data",
  "Cybersecurity & Digital Forensics",
  "Electronics & Communication",
  "Electrical & Electronics",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration & Management",
  "Executive Governance & Strategy",
  "Other"
];

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  initialTab = "reset_password",
  defaultRole = "trainee",
  onSelectRecoveredEmail
}) => {
  const [activeTab, setActiveTab] = useState<"reset_password" | "recover_id" | "helpdesk">(initialTab);
  const { findUserForRecovery, resetUserPassword, submitRecoveryTicket } = useAuthStore();
  const { addToast } = useAppStore();

  // Reset Password State
  const [resetRole, setResetRole] = useState<UserRole>(defaultRole);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStep, setResetStep] = useState<"email" | "otp_password" | "success">("email");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState("");
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Find Login ID State (No phone numbers)
  const [lookupRole, setLookupRole] = useState<UserRole>(defaultRole);
  const [searchName, setSearchName] = useState("");
  const [searchDept, setSearchDept] = useState("All Departments");
  const [foundAccounts, setFoundAccounts] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Helpdesk State
  const [ticketName, setTicketName] = useState("");
  const [ticketContact, setTicketContact] = useState("");
  const [ticketRole, setTicketRole] = useState<UserRole>(defaultRole);
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setResetRole(defaultRole);
      setLookupRole(defaultRole);
      setTicketRole(defaultRole);
      setResetError("");
      setLookupError("");
      setHasSearched(false);
      setFoundAccounts([]);
    }
  }, [isOpen, initialTab, defaultRole]);

  // Resend Timer Countdown
  useEffect(() => {
    let interval: any;
    if (resetStep === "otp_password" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resetStep, resendTimer]);

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────────
  // Track 1: Reset Password Handlers
  // ─────────────────────────────────────────────────────────────
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    const emailToVerify = resetEmail.trim().toLowerCase();
    if (!emailToVerify) return;

    setIsResetting(true);
    try {
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomOtp);

      const dispatchRes = await sendOtpEmail({
        email: emailToVerify,
        name: "Valued User",
        otp: randomOtp,
        purpose: "reset_password"
      });

      setIsResetting(false);
      setResetStep("otp_password");
      setResendTimer(45);
      setCanResend(false);
      setOtpDigits(["", "", "", "", "", ""]);

      addToast({
        title: dispatchRes.success ? "Security Code Dispatched" : "Security Code Ready",
        message: dispatchRes.message || `A 6-digit recovery code has been sent to ${emailToVerify}.`,
        type: dispatchRes.success ? "info" : "warning"
      });
    } catch (err: any) {
      setIsResetting(false);
      setResetError(err.message || "Failed to dispatch recovery code. Please verify your email address.");
    }
  };

  const handleResendResetOtp = async () => {
    if (!canResend) return;
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setResendTimer(45);
    setCanResend(false);

    await sendOtpEmail({
      email: resetEmail.trim(),
      name: "Valued User",
      otp: randomOtp,
      purpose: "reset_password"
    });

    addToast({
      title: "New Verification Code Dispatched",
      message: `Sent to ${resetEmail.trim()}.`,
      type: "info"
    });
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newDigits = [...otpDigits];
    newDigits[index] = val.substring(val.length - 1);
    setOtpDigits(newDigits);

    if (val && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    const enteredOtp = otpDigits.join("").trim();
    if (enteredOtp.length !== 6) {
      setResetError("Please enter the complete 6-digit verification code.");
      return;
    }

    const verifyRes = await verifyOtpCode(resetEmail.trim(), enteredOtp, generatedOtp);
    if (!verifyRes.valid) {
      setResetError(verifyRes.error || "Incorrect or expired verification code. Please check your email.");
      return;
    }

    const strength = checkPasswordStrength(newPassword);
    if (!strength.isStrong) {
      setResetError("Password does not meet enterprise security standards (must be min. 8 chars, including uppercase, lowercase, numbers, and symbols).");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match. Please re-enter.");
      return;
    }

    setIsResetting(true);
    const updateRes = resetUserPassword(resetEmail.trim(), newPassword, resetRole);
    setIsResetting(false);

    if (!updateRes.success) {
      setResetError(updateRes.message);
      return;
    }

    setResetStep("success");
    addToast({
      title: "Password Updated Successfully",
      message: updateRes.message,
      type: "success"
    });
  };

  const handleUseUpdatedPassword = () => {
    if (onSelectRecoveredEmail) {
      onSelectRecoveredEmail(resetEmail.trim(), resetRole);
    }
    onClose();
  };

  // ─────────────────────────────────────────────────────────────
  // Track 2: Find Login ID Handlers (By Name & Department)
  // ─────────────────────────────────────────────────────────────
  const handleSearchLoginId = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError("");
    setHasSearched(false);
    setIsSearching(true);

    const query = {
      name: searchName.trim(),
      department: searchDept === "All Departments" ? "" : searchDept.trim(),
      role: lookupRole
    };

    const result = findUserForRecovery(query);
    setIsSearching(false);
    setHasSearched(true);

    if (!result.success || result.accounts.length === 0) {
      setLookupError(result.message);
      setFoundAccounts([]);
    } else {
      setFoundAccounts(result.accounts);
      addToast({
        title: "Account(s) Located",
        message: result.message,
        type: "success"
      });
    }
  };

  const handleCopyAndSelect = (account: any) => {
    setCopiedId(account.id);
    navigator.clipboard.writeText(account.rawEmail).catch(() => {});
    setTimeout(() => setCopiedId(null), 2000);

    if (onSelectRecoveredEmail) {
      onSelectRecoveredEmail(account.rawEmail, account.role);
    }

    addToast({
      title: "Login ID Applied",
      message: `${account.rawEmail} populated in sign-in form.`,
      type: "success"
    });
    onClose();
  };

  const handleSwitchToResetWithEmail = (email: string, role: UserRole) => {
    setResetEmail(email);
    setResetRole(role);
    setActiveTab("reset_password");
    setResetStep("email");
  };

  // ─────────────────────────────────────────────────────────────
  // Track 3: Helpdesk Ticket Handler
  // ─────────────────────────────────────────────────────────────
  const handleSubmitHelpdesk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketName.trim() || !ticketContact.trim() || !ticketMessage.trim()) return;

    setIsSubmittingTicket(true);
    const res = submitRecoveryTicket({
      name: ticketName.trim(),
      contactInfo: ticketContact.trim(),
      role: ticketRole,
      description: ticketMessage.trim()
    });
    setIsSubmittingTicket(false);

    if (res.success) {
      setTicketSubmitted(true);
      addToast({
        title: "Support Ticket Registered",
        message: "Governance administrator has been notified.",
        type: "success"
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative max-w-lg w-full glass-panel p-5 sm:p-7 border border-white/15 shadow-2xl my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header & Navigation Tabs */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/20 border border-[#2997ff]/30 flex items-center justify-center text-[#2997ff]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Account & Credential Recovery
              </h3>
              <p className="text-xs text-slate-400">
                Self-service credential assistance for Trainees & Faculty
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex rounded-xl bg-black/50 p-1 border border-white/10 gap-1 text-xs">
            <button
              type="button"
              onClick={() => { setActiveTab("reset_password"); setResetStep("email"); }}
              className={
                "flex-1 py-1.5 px-2 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 " +
                (activeTab === "reset_password"
                  ? "bg-[#0071e3] text-white shadow-md"
                  : "text-slate-400 hover:text-white")
              }
            >
              <KeyRound className="w-3.5 h-3.5" /> Reset Password
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("recover_id")}
              className={
                "flex-1 py-1.5 px-2 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 " +
                (activeTab === "recover_id"
                  ? "bg-[#0071e3] text-white shadow-md"
                  : "text-slate-400 hover:text-white")
              }
            >
              <Search className="w-3.5 h-3.5" /> Find Login ID
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("helpdesk")}
              className={
                "py-1.5 px-3 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1 " +
                (activeTab === "helpdesk"
                  ? "bg-[#0071e3] text-white shadow-md"
                  : "text-slate-400 hover:text-white")
              }
            >
              <HelpCircle className="w-3.5 h-3.5" /> Helpdesk
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: RESET PASSWORD
            ───────────────────────────────────────────────────────────── */}
        {activeTab === "reset_password" && (
          <div className="space-y-4">
            {resetStep === "email" && (
              <form onSubmit={handleSendResetOtp} className="space-y-3.5">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter your registered official email address (Login ID). We will dispatch a 6-digit cryptographic security code to verify your identity.
                </p>

                {/* Role Switcher */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Account Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["trainee", "trainer", "admin"] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setResetRole(r)}
                        className={
                          "py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer capitalize " +
                          (resetRole === r
                            ? "bg-[#0071e3]/20 border-[#2997ff] text-white ring-1 ring-[#2997ff]"
                            : "bg-white/[0.04] border-white/10 text-slate-400 hover:text-white")
                        }
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registered Official Email (Login ID)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. t2005madhav@gmail.com"
                    className="apple-input text-xs"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>

                {resetError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("recover_id")}
                    className="text-[#2997ff] hover:underline flex items-center gap-1 font-medium"
                  >
                    Don't remember your Login ID/Email? Find it here →
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isResetting || !resetEmail.trim()}
                  className="apple-btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" /> Dispatching Code...
                    </>
                  ) : (
                    <>
                      Send 6-Digit Security Code <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {resetStep === "otp_password" && (
              <form onSubmit={handleConfirmReset} className="space-y-4">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">
                    Verification code dispatched to: <span className="text-[#2997ff]">{resetEmail}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Enter the 6-digit code sent to your inbox. It will expire in 10 minutes.
                  </p>
                  {generatedOtp && (
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Security Token (Offline / Demo):</span>
                      <button
                        type="button"
                        onClick={() => {
                          const digits = generatedOtp.split("");
                          setOtpDigits(digits);
                        }}
                        className="font-mono font-bold text-[#2997ff] bg-black/40 px-2 py-0.5 rounded border border-[#2997ff]/40 hover:bg-[#2997ff]/20 cursor-pointer"
                      >
                        ⚡ Autofill Code: {generatedOtp}
                      </button>
                    </div>
                  )}
                </div>

                {/* 6-Digit OTP Box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Enter 6-Digit Security Code
                  </label>
                  <div className="flex gap-2 justify-between">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputsRef.current[idx] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-12 text-center text-lg font-mono font-bold rounded-xl bg-black/50 border border-white/20 text-white focus:border-[#2997ff] focus:ring-1 focus:ring-[#2997ff] outline-none"
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>
                      {resendTimer > 0 ? (
                        `Resend code in ${resendTimer}s`
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendResetOtp}
                          className="text-[#2997ff] font-semibold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <RotateCw className="w-3 h-3" /> Resend Security Code
                        </button>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => setResetStep("email")}
                      className="text-slate-400 hover:text-white underline"
                    >
                      Change Email
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    New Strong Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Minimum 8 characters with symbols & numbers"
                      className="apple-input text-xs !pr-9"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={newPassword} />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm New Password <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Re-enter your new password"
                    className="apple-input text-xs"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {resetError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    isResetting ||
                    otpDigits.join("").length !== 6 ||
                    !checkPasswordStrength(newPassword).isStrong ||
                    newPassword !== confirmPassword
                  }
                  className="apple-btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" /> Updating Credentials...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Save New Password & Invalidate Sessions
                    </>
                  )}
                </button>
              </form>
            )}

            {resetStep === "success" && (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Password Updated Successfully!</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-sm mx-auto">
                    Your new credentials are now active across all portal services. All previous session tokens have been invalidated.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUseUpdatedPassword}
                  className="apple-btn-primary px-6 py-2.5 text-xs font-bold mx-auto flex items-center gap-2 cursor-pointer"
                >
                  Sign In With New Password <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: FIND LOGIN ID (BY NAME & DEPARTMENT — NO PHONE NUMBER)
            ───────────────────────────────────────────────────────────── */}
        {activeTab === "recover_id" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              If you forgot which email address you registered with, search your account using your <strong>Full Legal Name</strong> and <strong>Department</strong>:
            </p>

            <form onSubmit={handleSearchLoginId} className="space-y-3.5">
              {/* Role filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLookupRole("trainee")}
                    className={
                      "py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1.5 " +
                      (lookupRole === "trainee"
                        ? "bg-[#0071e3]/20 border-[#2997ff] text-white ring-1 ring-[#2997ff]"
                        : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white")
                    }
                  >
                    <GraduationCap className="w-3.5 h-3.5" /> Student / Trainee
                  </button>
                  <button
                    type="button"
                    onClick={() => setLookupRole("trainer")}
                    className={
                      "py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1.5 " +
                      (lookupRole === "trainer"
                        ? "bg-[#0071e3]/20 border-[#2997ff] text-white ring-1 ring-[#2997ff]"
                        : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white")
                    }
                  >
                    <UserIcon className="w-3.5 h-3.5" /> Trainer / Faculty
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Registered Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madhav Kumar or Raj Tiwari"
                    className="apple-input text-xs !pl-9"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
              </div>

              {/* Department Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Department
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <select
                    value={searchDept}
                    onChange={(e) => setSearchDept(e.target.value)}
                    className="apple-input text-xs !pl-9"
                  >
                    {COMMON_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} className="bg-slate-900 text-white">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {lookupError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{lookupError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSearching || searchName.trim().length < 2}
                className="apple-btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" /> Searching Records...
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" /> Find My Account
                  </>
                )}
              </button>
            </form>

            {/* Results Display */}
            {hasSearched && foundAccounts.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-white/10 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Verified Accounts Located ({foundAccounts.length})</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Identity Matched
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {foundAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/15 space-y-2.5 text-xs hover:border-[#2997ff]/40 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm">{acc.name}</h4>
                            <span className="badge-blue text-[9px] uppercase font-mono">{acc.role}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {acc.department} • <span className="text-slate-300">{acc.designation}</span>
                          </p>
                        </div>
                        <span className="badge-green text-[9px]">Active</span>
                      </div>

                      {/* Masked Email Badge with Autofill Button */}
                      <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-mono block">
                            Registered Login ID (Email)
                          </span>
                          <span className="font-mono text-xs font-bold text-[#2997ff]">
                            {acc.maskedEmail}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyAndSelect(acc)}
                            className="apple-btn-primary text-[11px] py-1.5 px-3 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === acc.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>Use ID</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => handleSwitchToResetWithEmail(acc.rawEmail, acc.role)}
                          className="text-[#2997ff] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <KeyRound className="w-3 h-3" /> Reset password for this account →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: HELPDESK & ADMIN ESCALATION
            ───────────────────────────────────────────────────────────── */}
        {activeTab === "helpdesk" && (
          <div className="space-y-4">
            {ticketSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Helpdesk Request Dispatched</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                  An urgent credential recovery ticket has been registered in the governance ledger. Our administration team will review your identity and follow up.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="apple-btn-primary px-5 py-2 text-xs font-semibold mx-auto"
                >
                  Close & Return
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitHelpdesk} className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Lost access to your registered email? Submit an official IT credential assistance ticket:
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your registered name"
                    className="apple-input text-xs"
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Account Role
                    </label>
                    <select
                      value={ticketRole}
                      onChange={(e) => setTicketRole(e.target.value as UserRole)}
                      className="apple-input text-xs"
                    >
                      <option value="trainee">Student / Trainee</option>
                      <option value="trainer">Trainer / Faculty</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Alternate Email / Contact ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. alternate email or ID"
                      className="apple-input text-xs"
                      value={ticketContact}
                      onChange={(e) => setTicketContact(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Issue Description
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Describe your credential access issue..."
                    className="apple-input text-xs"
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingTicket}
                  className="apple-btn-primary w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Submit IT Recovery Ticket
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer Security Badge */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" /> Cryptographic Identity Verification
          </span>
          <span>Official Capacity Connect Framework</span>
        </div>
      </div>
    </div>
  );
};
export default ResetPasswordModal;
