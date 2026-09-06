import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Mail, Lock, Eye, EyeOff, Shield, Users, GraduationCap,
  ArrowRight, KeyRound, RotateCw, ArrowLeft, CheckCircle2
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { CaptchaWidget } from "../../components/auth/CaptchaWidget";
import { ResetPasswordModal } from "../../components/auth/ResetPasswordModal";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { ToastContainer } from "../../components/common/ToastContainer";
import { sendLoginAlertEmail, sendOtpEmail, verifyOtpCode } from "../../services/emailService";
import type { User } from "../../types";

export const LoginPage: React.FC = () => {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [role, setRole] = useState<"trainee" | "trainer" | "admin">("trainee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 2FA OTP State
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const { validateCredentials, completeLogin } = useAuthStore();
  const { addToast } = useAppStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPendingNotice = searchParams.get("pending") === "true";
  const pendingEmail = searchParams.get("email") || "";

  useEffect(() => {
    const urlRole = searchParams.get("role") as "trainee" | "trainer" | "admin" | null;
    if (urlRole && ["trainee", "trainer", "admin"].includes(urlRole)) {
      setRole(urlRole);
    }
    const urlEmail = searchParams.get("email");
    if (urlEmail) {
      setEmail(urlEmail);
    }
  }, [searchParams]);

  // Timer countdown for resending login OTP
  useEffect(() => {
    let interval: any;
    if (step === "otp" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleRoleChange = (newRole: "trainee" | "trainer" | "admin") => {
    setRole(newRole);
    setError("");
    setStep("credentials");
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!captchaVerified) {
      setError("Please complete the security CAPTCHA verification.");
      return;
    }

    setLoading(true);
    try {
      const res = validateCredentials(email, password, role);
      if (!res.success || !res.user) {
        setError(res.message || "Invalid official email or password.");
        setLoading(false);
        return;
      }

      // For Student (trainee) — direct login without OTP
      if (role === "trainee") {
        completeLogin(res.user);

        sendLoginAlertEmail({
          email: res.user.email,
          name: res.user.name,
          role: "TRAINEE"
        }).catch(() => {});

        setLoading(false);
        addToast({
          title: "Sign In Successful",
          message: "Authenticated as TRAINEE.",
          type: "success"
        });
        navigate("/trainee/dashboard");
        return;
      }

      // For Trainer & Admin — require 2FA OTP verification
      setPendingUser(res.user);

      // Generate secure 6-digit OTP
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomOtp);

      // Dispatch real email verification code via official Capacity Connect email
      const dispatchRes = await sendOtpEmail({
        email: res.user.email,
        name: res.user.name,
        otp: randomOtp,
        purpose: "login"
      });

      setLoading(false);
      setStep("otp");
      setResendTimer(45);
      setCanResend(false);
      setOtpDigits(["", "", "", "", "", ""]);

      addToast({
        title: dispatchRes.success ? "Login Security Code Sent" : "Notice",
        message: dispatchRes.message,
        type: dispatchRes.success ? "info" : "warning"
      });
    } catch (err: any) {
      setError(err.message || "Failed to initiate login verification.");
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.substring(value.length - 1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpDigits(digits);
      otpInputsRef.current[5]?.focus();
    }
  };

  const handleResendLoginOtp = async () => {
    if (!canResend || !pendingUser) return;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setResendTimer(45);
    setCanResend(false);
    setOtpDigits(["", "", "", "", "", ""]);
    setError("");

    const dispatchRes = await sendOtpEmail({
      email: pendingUser.email,
      name: pendingUser.name,
      otp: newOtp,
      purpose: "login"
    });

    addToast({
      title: dispatchRes.success ? "New Verification Code Dispatched" : "Notice",
      message: dispatchRes.message,
      type: dispatchRes.success ? "info" : "warning"
    });
  };

  const handleVerifyOtpAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;

    const enteredOtp = otpDigits.join("");
    if (enteredOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setError("");
    setLoading(true);

    const verificationResult = await verifyOtpCode(pendingUser.email, enteredOtp, generatedOtp);
    if (!verificationResult.valid) {
      setLoading(false);
      setError(verificationResult.error || "Incorrect verification code. Please check your email and try again.");
      return;
    }

    try {
      completeLogin(pendingUser);

      // Dispatch official security login notification to user's email
      sendLoginAlertEmail({
        email: pendingUser.email,
        name: pendingUser.name,
        role: role.toUpperCase()
      }).catch(() => {});

      addToast({
        title: "Sign In Successful",
        message: `Authenticated as ${role.toUpperCase()}.`,
        type: "success"
      });

      if (role === "trainee") navigate("/trainee/dashboard");
      else if (role === "trainer") navigate("/trainer/dashboard");
      else navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to complete authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-[#f5f5f7] relative selection:bg-[#0071e3] selection:text-white">
      <div className="glow-orb-primary" />
      <div className="glow-orb-secondary" />

      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <img
              src="/logo.png"
              alt="Capacity Connect"
              className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-[0_0_35px_rgba(41,151,255,0.65)] mx-auto hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Sign In to Portal</h2>
          <p className="text-xs text-slate-400">Secure role-based authentication</p>
        </div>

        <div className="glass-panel p-6 sm:p-8 space-y-5 border border-white/15 shadow-2xl">
          {isPendingNotice && role === "trainer" && (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/35 text-xs text-amber-200 space-y-1 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Trainer Account Awaiting Administrator Approval</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Your trainer registration application{pendingEmail ? ` for ${pendingEmail}` : ""} has been received. In accordance with platform security governance, an Administrator must review and approve your trainer credentials before you can log in.
              </p>
            </div>
          )}

          {step === "credentials" ? (
            <>
              <div className="grid grid-cols-3 p-1 rounded-xl bg-black/50 border border-white/10 text-center">
                {(["trainee", "trainer", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={"py-2 text-xs font-semibold rounded-lg capitalize transition cursor-pointer " + (role === r ? "bg-[#0071e3] text-white shadow-md" : "text-slate-400 hover:text-white")}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Email</label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none z-10" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      className="apple-input !pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Password</label>
                    {role !== "admin" && (
                      <button
                        type="button"
                        onClick={() => setResetModalOpen(true)}
                        className="text-[11px] text-[#2997ff] hover:underline cursor-pointer font-medium"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none z-10" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                      className="apple-input !pl-10 !pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-white p-1 z-10 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <CaptchaWidget onVerify={setCaptchaVerified} />

                {error && (
                  <div
                    className={
                      "p-3 rounded-xl text-xs font-medium " +
                      (error.toLowerCase().includes("approval")
                        ? "bg-amber-500/15 border border-amber-500/35 text-amber-200"
                        : "bg-rose-500/15 border border-rose-500/30 text-rose-300")
                    }
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="apple-btn-primary w-full py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{loading
                    ? (role === "trainee" ? "Signing In..." : "Verifying Credentials & Sending OTP...")
                    : (role === "trainee"
                      ? "Sign In as Trainee"
                      : "Continue to Sign In as " + (role === "trainer" ? "Trainer" : "Administrator"))
                  }</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#0071e3]/10 border border-[#2997ff]/20 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#0071e3]/20 text-[#2997ff] flex items-center justify-center mx-auto">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Two-Factor Security Verification</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We've sent a 6-digit authentication code to:
                </p>
                <div className="inline-block px-3 py-1 rounded-full bg-white/10 font-mono text-xs text-blue-300 font-semibold">
                  {pendingUser?.email}
                </div>
                <p className="text-[11px] text-slate-400">
                  Dispatched via official Capacity Connect mailer (<span className="text-slate-300">capacityconnect.org@gmail.com</span>)
                </p>
              </div>

              <form onSubmit={handleVerifyOtpAndLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 text-center">
                    Enter 6-Digit Login Security Code
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputsRef.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-mono font-extrabold bg-black/60 border border-white/20 rounded-xl focus:border-[#2997ff] focus:ring-2 focus:ring-[#2997ff]/40 text-white outline-none transition"
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl text-xs font-medium bg-rose-500/15 border border-rose-500/30 text-rose-300 text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="apple-btn-primary w-full py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? "Verifying Code..." : "Verify OTP & Sign In"}</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("credentials");
                      setError("");
                    }}
                    className="text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Credentials</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendLoginOtp}
                    disabled={!canResend}
                    className={"flex items-center gap-1.5 font-semibold transition cursor-pointer " + (canResend ? "text-[#2997ff] hover:underline" : "text-slate-500 cursor-not-allowed")}
                  >
                    <RotateCw className={"w-3.5 h-3.5 " + (!canResend ? "animate-spin" : "")} />
                    <span>{canResend ? "Resend OTP" : ("Resend in " + resendTimer + "s")}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {role !== "admin" && (
          <div className="text-center text-xs text-slate-400 space-y-1">
            <div>
              <span>New user? </span>
              <Link to="/register" className="text-[#2997ff] font-bold hover:underline">
                Register for a new account →
              </Link>
            </div>
            <div>
              <span>Trouble signing in? </span>
              <button
                type="button"
                onClick={() => setResetModalOpen(true)}
                className="text-slate-400 hover:text-[#2997ff] hover:underline font-medium cursor-pointer"
              >
                Reset password with registered email ID →
              </button>
            </div>
          </div>
        )}
      </div>

      </main>

      <Footer />
      <ToastContainer />
      <ResetPasswordModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        defaultRole={role}
        onSelectRecoveredEmail={(recoveredEmail, recoveredRole) => {
          setEmail(recoveredEmail);
          setRole(recoveredRole);
          addToast({
            title: "Account Identifier Applied",
            message: `Sign in email set to ${recoveredEmail}. Enter your password to continue.`,
            type: "info"
          });
        }}
      />
    </div>
  );
};
export default LoginPage;
