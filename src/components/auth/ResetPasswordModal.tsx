import React, { useState, useEffect, useRef } from "react";
import {
  X, KeyRound, CheckCircle2, ArrowRight, Shield,
  Mail, Eye, EyeOff, RotateCw, AlertTriangle, HelpCircle
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { PasswordStrengthMeter, checkPasswordStrength } from "./PasswordStrengthMeter";
import { sendOtpEmail, verifyOtpCode } from "../../services/emailService";
import type { UserRole, User } from "../../types";
import { useUsersStore } from "../../store/usersStore";

export interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  onSelectRecoveredEmail?: (email: string, role: UserRole) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultRole = "trainee",
  onSelectRecoveredEmail
}) => {
  const [activeView, setActiveView] = useState<"reset" | "helpdesk">("reset");
  const { resetUserPassword, submitRecoveryTicket } = useAuthStore();
  const { addToast } = useAppStore();

  const safeDefaultRole: "trainee" | "trainer" = defaultRole === "admin" ? "trainee" : (defaultRole as "trainee" | "trainer") || "trainee";

  // Reset Password State (Exclusively using registered email ID - Admin excluded for security)
  const [resetRole, setResetRole] = useState<"trainee" | "trainer">(safeDefaultRole);
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

  // Helpdesk State
  const [ticketName, setTicketName] = useState("");
  const [ticketContact, setTicketContact] = useState("");
  const [ticketRole, setTicketRole] = useState<"trainee" | "trainer">(safeDefaultRole);
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialRole: "trainee" | "trainer" = defaultRole === "admin" ? "trainee" : (defaultRole as "trainee" | "trainer") || "trainee";
      setActiveView("reset");
      setResetStep("email");
      setResetRole(initialRole);
      setTicketRole(initialRole);
      setResetError("");
      setNewPassword("");
      setConfirmPassword("");
      setOtpDigits(["", "", "", "", "", ""]);
    }
  }, [isOpen, defaultRole]);

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

  // Step 1: Send verification code to registered email ID
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    const emailToVerify = resetEmail.trim().toLowerCase();
    if (!emailToVerify) return;

    setIsResetting(true);
    try {
      // Security Pre-check: Ensure account is valid and reject admin self-reset
      const users = useUsersStore.getState().users;
      const matchedUser = users.find((u: User) => u.email?.toLowerCase() === emailToVerify);

      if (matchedUser && matchedUser.role === "admin") {
        setIsResetting(false);
        setResetError("Administrative accounts cannot be reset via self-service recovery. Please contact platform engineering or a Super Administrator.");
        return;
      }

      if (matchedUser && matchedUser.role !== resetRole) {
        setIsResetting(false);
        setResetError(`Account role mismatch: This email is registered as a ${matchedUser.role.toUpperCase()}, not a ${resetRole.toUpperCase()}.`);
        return;
      }

      if (!matchedUser) {
        setIsResetting(false);
        setResetError(`No ${resetRole} account found with this email address.`);
        return;
      }

      if (matchedUser.status === "suspended" || matchedUser.status === "inactive") {
        setIsResetting(false);
        setResetError("This account is inactive or suspended. Please contact an administrator.");
        return;
      }

      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomOtp);

      const dispatchRes = await sendOtpEmail({
        email: emailToVerify,
        name: matchedUser.name || "Valued User",
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
        message: dispatchRes.message || `A 6-digit recovery code has been sent to your registered email: ${emailToVerify}.`,
        type: dispatchRes.success ? "info" : "warning"
      });
    } catch (err: any) {
      setIsResetting(false);
      setResetError(err.message || "Failed to dispatch recovery code. Please check your registered email address.");
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
      title: "New Verification Code Sent",
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

  // Step 2: Validate OTP and update password
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    const enteredOtp = otpDigits.join("").trim();
    if (enteredOtp.length !== 6) {
      setResetError("Please enter the complete 6-digit verification code.");
      return;
    }

    const verifyRes = await verifyOtpCode(resetEmail.trim(), enteredOtp);
    if (!verifyRes.valid) {
      setResetError(verifyRes.error || "Incorrect or expired verification code. Please check your email inbox.");
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
    const updateRes = await resetUserPassword(resetEmail.trim(), newPassword, resetRole);
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

  const handleFinishAndSignIn = () => {
    if (onSelectRecoveredEmail) {
      onSelectRecoveredEmail(resetEmail.trim(), resetRole);
    }
    onClose();
  };

  // Helpdesk Ticket Handler
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
      <div className="relative max-w-md w-full glass-panel p-5 sm:p-7 border border-white/15 shadow-2xl my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/20 border border-[#2997ff]/30 flex items-center justify-center text-[#2997ff]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {activeView === "reset" ? "Reset Password" : "IT Helpdesk Assistance"}
            </h3>
            <p className="text-xs text-slate-400">
              {activeView === "reset"
                ? "Recover access using your registered email ID"
                : "Submit an emergency credential ticket"}
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            MAIN VIEW: RESET WITH REGISTERED EMAIL ID
            ───────────────────────────────────────────────────────────── */}
        {activeView === "reset" && (
          <div className="space-y-4">
            {resetStep === "email" && (
              <form onSubmit={handleSendResetOtp} className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter your <strong>registered email ID</strong>. We will send a 6-digit verification code to verify your identity and reset your password.
                </p>

                {/* Role Switcher */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["trainee", "trainer"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setResetRole(r)}
                        className={
                          "py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer capitalize " +
                          (resetRole === r
                            ? "bg-[#0071e3]/20 border-[#2997ff] text-white ring-1 ring-[#2997ff]"
                            : "bg-white/[0.04] border-white/10 text-slate-400 hover:text-white")
                        }
                      >
                        {r === "trainee" ? "Student / Trainee" : "Trainer / Faculty"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Registered Email ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registered Email ID <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your registered email"
                      className="apple-input text-xs !pl-9"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                </div>

                {resetError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isResetting || !resetEmail.trim()}
                  className="apple-btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" /> Dispatching Verification Code...
                    </>
                  ) : (
                    <>
                      Send 6-Digit Code to Email <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveView("helpdesk")}
                    className="text-[11px] text-slate-400 hover:text-[#2997ff] hover:underline cursor-pointer"
                  >
                    No longer have access to this email? Contact Administrator →
                  </button>
                </div>
              </form>
            )}

            {resetStep === "otp_password" && (
              <form onSubmit={handleConfirmReset} className="space-y-4">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">
                    Verification code dispatched to: <span className="text-[#2997ff] font-mono">{resetEmail}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Check your inbox and enter the 6-digit security code below.
                  </p>
                </div>

                {/* 6-Digit OTP */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Enter 6-Digit Verification Code
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
                          <RotateCw className="w-3 h-3" /> Resend Verification Code
                        </button>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => setResetStep("email")}
                      className="text-slate-400 hover:text-white underline"
                    >
                      Change Email ID
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
                      <RotateCw className="w-3.5 h-3.5 animate-spin" /> Saving Credentials...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Update Password & Invalidate Sessions
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
                    Your new credentials for <strong className="text-white">{resetEmail}</strong> are now active. All previous session tokens have been invalidated.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFinishAndSignIn}
                  className="apple-btn-primary px-6 py-2.5 text-xs font-bold mx-auto flex items-center gap-2 cursor-pointer"
                >
                  Sign In With New Password <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            HELPDESK ESCALATION VIEW
            ───────────────────────────────────────────────────────────── */}
        {activeView === "helpdesk" && (
          <div className="space-y-4">
            {ticketSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Support Ticket Dispatched</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                  An urgent credential assistance ticket has been recorded in the platform governance ledger. An administrator will contact you.
                </p>
                <button
                  type="button"
                  onClick={() => { setTicketSubmitted(false); setActiveView("reset"); }}
                  className="apple-btn-primary px-5 py-2 text-xs font-semibold mx-auto"
                >
                  Back to Password Reset
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitHelpdesk} className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Lost access to your registered email address? Submit an official IT credential assistance ticket:
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Full Name
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
                      onChange={(e) => setTicketRole(e.target.value as "trainee" | "trainer")}
                      className="apple-input text-xs"
                    >
                      <option value="trainee">Student / Trainee</option>
                      <option value="trainer">Trainer / Faculty</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Alternate Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Alternate contact email"
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
                    placeholder="Explain why you cannot access your registered email..."
                    className="apple-input text-xs"
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveView("reset")}
                    className="apple-btn-secondary flex-1 py-2 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTicket}
                    className="apple-btn-primary flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Submit Ticket
                  </button>
                </div>
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
