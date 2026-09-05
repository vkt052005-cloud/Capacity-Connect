import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap, Eye, EyeOff, User, Mail, Lock, Building2,
  Briefcase, ArrowRight, ShieldCheck, CheckCircle2, KeyRound,
  RotateCw, ArrowLeft, ShieldAlert
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { sendOtpEmail, verifyOtpCode } from "../../services/emailService";
import { CaptchaWidget } from "../../components/auth/CaptchaWidget";
import { ToastContainer } from "../../components/common/ToastContainer";
import { UserRole, User as UserType } from "../../types";
import { STORAGE_KEYS, getFromStorage } from "../../data/seed";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { PasswordStrengthMeter, checkPasswordStrength } from "../../components/auth/PasswordStrengthMeter";

const TRAINER_DEPARTMENT_OPTIONS = [
  "Computer Science & Engineering",
  "Information Technology & Cloud Systems",
  "Artificial Intelligence & Machine Learning",
  "Data Science & Big Data Analytics",
  "Cybersecurity, Network & Systems Defense",
  "Electrical & Electronics Engineering",
  "Mechanical, Automation & Robotics",
  "Business Administration & Corporate Strategy",
  "Human Resources & Talent Development",
  "Finance, FinTech & Risk Management",
  "Healthcare, Biotechnology & Life Sciences",
  "Executive Governance & Policy Compliance",
  "Other"
];

const TRAINER_DESIGNATION_OPTIONS = [
  "Senior Faculty Trainer",
  "Principal Technical Instructor",
  "Lead Corporate Trainer",
  "Professor / Associate Professor",
  "Assistant Professor / Lecturer",
  "Adjunct Faculty / Guest Lecturer",
  "Curriculum Development Specialist",
  "Domain Subject Matter Expert (SME)",
  "Staff Solutions Architect & Mentor",
  "Department Head (HOD) / Dean",
  "Executive Director of Training",
  "Other"
];

const TRAINER_SPECIALIZATION_OPTIONS = [
  "Cloud Architecture, Kubernetes & Microservices (AWS/GCP/Azure)",
  "Generative AI, Large Language Models & Vector Databases (RAG)",
  "Cybersecurity, Zero-Trust, Ethical Hacking & ISO 27001",
  "Data Engineering, Apache Spark & Modern Data Warehousing",
  "Full-Stack Modern Web Engineering (React, Node.js, TypeScript)",
  "Enterprise DevOps, CI/CD Pipelines & Site Reliability (SRE)",
  "Agile Project Leadership, Scrum & PMP Methodologies",
  "Corporate Leadership, Executive Coaching & Change Management",
  "Healthcare Informatics, Clinical Data & Regulatory Compliance",
  "Ph.D. / Master's Academic Research & Pedagogy",
  "Other"
];

const TRAINEE_DEPARTMENT_OPTIONS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Data Science & Artificial Intelligence",
  "Cybersecurity & Digital Forensics",
  "Electronics & Communication Engineering",
  "Mechanical & Automation Engineering",
  "Electrical & Power Engineering",
  "Civil & Infrastructure Engineering",
  "Business Administration & Management (BBA/MBA)",
  "Commerce, Accounting & Finance",
  "Applied Sciences & Mathematics",
  "Humanities, Design & Media",
  "Other"
];

const TRAINEE_DESIGNATION_OPTIONS = [
  "Undergraduate Student (B.Tech / B.Sc / B.Com / BCA)",
  "Postgraduate / Master's Student (M.Tech / M.Sc / MCA / MBA)",
  "Graduate Engineer Trainee (GET)",
  "Associate Software Trainee",
  "Research Scholar / Project Intern",
  "Management Trainee",
  "Apprentice / Diploma Trainee",
  "Corporate Upskilling Candidate",
  "Other"
];

const TRAINEE_SKILLS_OPTIONS = [
  "Full-Stack Web Development (React, Node.js, JavaScript)",
  "Cloud Computing & DevOps (Docker, Kubernetes, AWS, GCP)",
  "Data Science, Machine Learning & Python",
  "Cybersecurity, Network Defense & Ethical Hacking",
  "Artificial Intelligence, Generative AI & Prompt Engineering",
  "Mobile App Development (Flutter, React Native, Android)",
  "Data Analytics, SQL, Power BI & Tableau",
  "Software Testing, Automation & QA Engineering",
  "Core Programming & Data Structures (Java, C++, Python)",
  "Embedded Systems, IoT & Robotics",
  "Other"
];

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [role, setRole] = useState<UserRole>("trainee");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [customDepartment, setCustomDepartment] = useState("");
  const [customDesignation, setCustomDesignation] = useState("");
  const [customExperience, setCustomExperience] = useState("");
  const [customSkills, setCustomSkills] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP State
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const { register, login } = useAuthStore();
  const { addToast } = useAppStore();
  const navigate = useNavigate();

  // Timer countdown for resending OTP
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

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaVerified) {
      setError("Please complete the CAPTCHA verification by entering the characters shown above.");
      return;
    }
    const pwdStrength = checkPasswordStrength(password);
    if (!pwdStrength.isStrong) {
      setError("Security Policy: Passwords below Strong level are not accepted. Your password must be at least 8 characters and include uppercase, lowercase, numbers, and special symbols.");
      return;
    }

    setError("");
    setLoading(true);

    // Pre-flight check: Ensure this official email is not already registered
    const existingUsers = getFromStorage<UserType>(STORAGE_KEYS.USERS);
    const alreadyRegistered = existingUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (alreadyRegistered) {
      setError("An account with this email address is already registered. Please sign in instead.");
      setLoading(false);
      return;
    }

    // Validate trainer selections when registering as faculty
    if (role === "trainer") {
      if (!department) {
        setError("Please select your academic or corporate department from the dropdown.");
        setLoading(false);
        return;
      }
      if (department === "Other" && !customDepartment.trim()) {
        setError("Please specify your custom department name.");
        setLoading(false);
        return;
      }
      if (!designation) {
        setError("Please select your professional designation from the dropdown.");
        setLoading(false);
        return;
      }
      if (designation === "Other" && !customDesignation.trim()) {
        setError("Please specify your custom designation.");
        setLoading(false);
        return;
      }
      if (!experience) {
        setError("Please select your domain specialization from the dropdown.");
        setLoading(false);
        return;
      }
      if (experience === "Other" && !customExperience.trim()) {
        setError("Please specify your custom domain specialization & credentials.");
        setLoading(false);
        return;
      }
    }

    // Validate trainee selections when registering as student/trainee
    if (role === "trainee") {
      if (!department) {
        setError("Please select your academic or technical department from the dropdown.");
        setLoading(false);
        return;
      }
      if (department === "Other" && !customDepartment.trim()) {
        setError("Please specify your custom department name.");
        setLoading(false);
        return;
      }
      if (!designation) {
        setError("Please select your current student or trainee designation from the dropdown.");
        setLoading(false);
        return;
      }
      if (designation === "Other" && !customDesignation.trim()) {
        setError("Please specify your custom designation.");
        setLoading(false);
        return;
      }
      if (!skills) {
        setError("Please select your primary skill or learning track from the dropdown.");
        setLoading(false);
        return;
      }
      if (skills === "Other" && !customSkills.trim()) {
        setError("Please specify your custom skills & learning goals.");
        setLoading(false);
        return;
      }
    }

    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);

    // Dispatch real email verification code via official Capacity Connect sender
    const result = await sendOtpEmail({ email, name, otp: randomOtp, purpose: 'register' });

    setLoading(false);
    setStep("otp");
    setResendTimer(45);
    setCanResend(false);

    addToast({
      title: result.success ? "Verification Code Sent" : "Notice",
      message: result.message,
      type: result.success ? "info" : "warning"
    });
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

  const handleResendOtp = async () => {
    if (!canResend) return;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setResendTimer(45);
    setCanResend(false);
    setOtpDigits(["", "", "", "", "", ""]);

    // Dispatch fresh verification code to user's email inbox
    const result = await sendOtpEmail({ email, name, otp: newOtp, purpose: 'register' });

    addToast({
      title: result.success ? "Verification Code Resent" : "Notice",
      message: result.message,
      type: result.success ? "info" : "warning"
    });
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join("");

    if (enteredOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setError("");
    setLoading(true);

    const verificationResult = await verifyOtpCode(email, enteredOtp, generatedOtp);
    if (!verificationResult.valid) {
      setLoading(false);
      setError(verificationResult.error || "Incorrect verification code. Please check your email and try again.");
      return;
    }

    try {
      const finalDepartment = department === "Other" ? customDepartment.trim() : department;
      const finalDesignation = designation === "Other" ? customDesignation.trim() : designation;
      const finalExperience = experience === "Other" ? customExperience.trim() : experience;
      const finalSkills = skills === "Other" ? customSkills.trim() : skills;

      const profileData =
        role === "trainee"
          ? {
              qualifications: ["Bachelor of Technology / Higher Secondary / Equivalent"],
              experience: ["Student / Trainee Scholar"],
              skills: finalSkills ? finalSkills.split(",").map((s) => s.trim()) : ["Problem Solving", "Cloud Infrastructure"],
              interests: ["Capacity Building", "System Architecture", "Continuous Learning"],
              certificates: [],
              bio: `Dedicated ${finalDepartment || "Technical"} student actively acquiring advanced capabilities on Capacity Connect.`,
              phone: "+91 98765 00000",
              department: finalDepartment || "Computer Science & Engineering",
              designation: finalDesignation || "Undergraduate Student",
              xpPoints: 0,
              streakDays: 1,
              completedCoursesCount: 0,
              badges: []
            }
          : {
              bio: `Certified Instructor with deep domain expertise in ${finalExperience || "Engineering & Leadership"}.`,
              expertise: finalExperience ? finalExperience.split(",").map((s) => s.trim()) : ["Curriculum Authoring", "Assessment Design"],
              competencies: ["Live Lecture Delivery", "Workforce Assessment"],
              phone: "+91 98765 11111",
              department: finalDepartment || "Academic Faculty",
              designation: finalDesignation || "Senior Trainer",
              experience: finalExperience || "8+ Years Industry & Academic Leadership",
              rating: 5.0,
              totalStudentsTaught: 0,
              verifiedCredentials: [finalExperience || "Institutional Faculty Accreditation"]
            };

      const regResult = await register({
        name,
        email,
        password,
        role,
        traineeProfile: role === "trainee" ? (profileData as any) : undefined,
        trainerProfile: role === "trainer" ? (profileData as any) : undefined
      });

      if (regResult.success) {
        if (role === "trainee") {
          addToast({
            title: "Registration Successful",
            message: "Your student account is now active! Please sign in with your credentials.",
            type: "success"
          });
          navigate(`/login?role=trainee&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
        } else {
          addToast({
            title: "Application Submitted",
            message: "Your trainer application is awaiting administrator review and approval before you can sign in.",
            type: "info"
          });
          navigate(`/login?pending=true&role=trainer&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
        }
      } else {
        setError(regResult.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
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
      <div className="max-w-lg w-full mx-auto space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <img
              src="/logo.png"
              alt="Capacity Connect"
              className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-[0_0_35px_rgba(41,151,255,0.65)] mx-auto hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {step === "form" ? "Create Professional Profile" : "Email OTP Verification"}
          </h2>
          <p className="text-xs text-slate-400">
            {step === "form" ? "Join Capacity Connect for certified capacity building" : ("We sent a 6-digit verification code to " + email)}
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 space-y-5 border border-white/15 shadow-2xl">
          {step === "form" ? (
            <>
              {/* Role Selection Tabs */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-black/50 border border-white/10 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setRole("trainee");
                    setError("");
                    setDepartment("");
                    setDesignation("");
                    setExperience("");
                    setSkills("");
                    setCustomDepartment("");
                    setCustomDesignation("");
                    setCustomExperience("");
                    setCustomSkills("");
                  }}
                  className={"py-2 text-xs font-semibold rounded-lg transition cursor-pointer " + (role === "trainee" ? "bg-[#0071e3] text-white shadow-md" : "text-slate-400 hover:text-white")}
                >
                  Register as Trainee (Student)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole("trainer");
                    setError("");
                    setDepartment("");
                    setDesignation("");
                    setExperience("");
                    setSkills("");
                    setCustomDepartment("");
                    setCustomDesignation("");
                    setCustomExperience("");
                    setCustomSkills("");
                  }}
                  className={"py-2 text-xs font-semibold rounded-lg transition cursor-pointer " + (role === "trainer" ? "bg-[#0071e3] text-white shadow-md" : "text-slate-400 hover:text-white")}
                >
                  Apply as Trainer (Faculty)
                </button>
              </div>

              <form onSubmit={handleInitialSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Legal Name</label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none z-10" />
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      className="apple-input !pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Corporate / Academic Email</label>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none z-10" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter a strong password (min. 8 characters)"
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
                  <PasswordStrengthMeter password={password} />
                </div>

                {role === "trainer" ? (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Department Dropdown with Other */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Department <span className="text-[#2997ff]">*</span>
                        </label>
                        <select
                          className="apple-input text-xs bg-[#0b0f19] text-white border-white/20 cursor-pointer focus:border-[#2997ff]"
                          value={department}
                          onChange={(e) => {
                            setDepartment(e.target.value);
                            if (e.target.value !== "Other") setCustomDepartment("");
                          }}
                        >
                          <option value="" disabled className="bg-[#0b0f19] text-slate-400">Select Department...</option>
                          {TRAINER_DEPARTMENT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt} className="bg-[#0b0f19] text-white">
                              {opt === "Other" ? "Other (Specify custom department)" : opt}
                            </option>
                          ))}
                        </select>

                        {department === "Other" && (
                          <div className="mt-2 animate-fadeIn">
                            <input
                              type="text"
                              required
                              placeholder="Type custom department name..."
                              className="apple-input text-xs border-[#2997ff]/40 focus:border-[#2997ff]"
                              value={customDepartment}
                              onChange={(e) => setCustomDepartment(e.target.value)}
                              autoFocus
                            />
                          </div>
                        )}
                      </div>

                      {/* Designation Dropdown with Other */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Designation <span className="text-[#2997ff]">*</span>
                        </label>
                        <select
                          className="apple-input text-xs bg-[#0b0f19] text-white border-white/20 cursor-pointer focus:border-[#2997ff]"
                          value={designation}
                          onChange={(e) => {
                            setDesignation(e.target.value);
                            if (e.target.value !== "Other") setCustomDesignation("");
                          }}
                        >
                          <option value="" disabled className="bg-[#0b0f19] text-slate-400">Select Designation...</option>
                          {TRAINER_DESIGNATION_OPTIONS.map((opt) => (
                            <option key={opt} value={opt} className="bg-[#0b0f19] text-white">
                              {opt === "Other" ? "Other (Specify custom designation)" : opt}
                            </option>
                          ))}
                        </select>

                        {designation === "Other" && (
                          <div className="mt-2 animate-fadeIn">
                            <input
                              type="text"
                              required
                              placeholder="Type custom designation / title..."
                              className="apple-input text-xs border-[#2997ff]/40 focus:border-[#2997ff]"
                              value={customDesignation}
                              onChange={(e) => setCustomDesignation(e.target.value)}
                              autoFocus
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Domain Specialization & Credentials Dropdown with Other */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Domain Specialization & Credentials <span className="text-[#2997ff]">*</span>
                      </label>
                      <select
                        className="apple-input text-xs bg-[#0b0f19] text-white border-white/20 cursor-pointer focus:border-[#2997ff]"
                        value={experience}
                        onChange={(e) => {
                          setExperience(e.target.value);
                          if (e.target.value !== "Other") setCustomExperience("");
                        }}
                      >
                        <option value="" disabled className="bg-[#0b0f19] text-slate-400">Select Domain Specialization & Credentials...</option>
                        {TRAINER_SPECIALIZATION_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#0b0f19] text-white">
                            {opt === "Other" ? "Other (Specify custom specialization)" : opt}
                          </option>
                        ))}
                      </select>

                      {experience === "Other" && (
                        <div className="mt-2 animate-fadeIn">
                          <input
                            type="text"
                            required
                            placeholder="Type custom specialization & credentials (e.g. Ph.D., Lead Architect)..."
                            className="apple-input text-xs border-[#2997ff]/40 focus:border-[#2997ff]"
                            value={customExperience}
                            onChange={(e) => setCustomExperience(e.target.value)}
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Trainee Department Dropdown with Other */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Department <span className="text-[#2997ff]">*</span>
                        </label>
                        <select
                          className="apple-input text-xs bg-[#0b0f19] text-white border-white/20 cursor-pointer focus:border-[#2997ff]"
                          value={department}
                          onChange={(e) => {
                            setDepartment(e.target.value);
                            if (e.target.value !== "Other") setCustomDepartment("");
                          }}
                        >
                          <option value="" disabled className="bg-[#0b0f19] text-slate-400">Select Academic / Domain Department...</option>
                          {TRAINEE_DEPARTMENT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt} className="bg-[#0b0f19] text-white">
                              {opt === "Other" ? "Other (Specify custom department)" : opt}
                            </option>
                          ))}
                        </select>

                        {department === "Other" && (
                          <div className="mt-2 animate-fadeIn">
                            <input
                              type="text"
                              required
                              placeholder="Type custom department name..."
                              className="apple-input text-xs border-[#2997ff]/40 focus:border-[#2997ff]"
                              value={customDepartment}
                              onChange={(e) => setCustomDepartment(e.target.value)}
                              autoFocus
                            />
                          </div>
                        )}
                      </div>

                      {/* Trainee Designation Dropdown with Other */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Designation / Academic Level <span className="text-[#2997ff]">*</span>
                        </label>
                        <select
                          className="apple-input text-xs bg-[#0b0f19] text-white border-white/20 cursor-pointer focus:border-[#2997ff]"
                          value={designation}
                          onChange={(e) => {
                            setDesignation(e.target.value);
                            if (e.target.value !== "Other") setCustomDesignation("");
                          }}
                        >
                          <option value="" disabled className="bg-[#0b0f19] text-slate-400">Select Current Level / Designation...</option>
                          {TRAINEE_DESIGNATION_OPTIONS.map((opt) => (
                            <option key={opt} value={opt} className="bg-[#0b0f19] text-white">
                              {opt === "Other" ? "Other (Specify custom designation)" : opt}
                            </option>
                          ))}
                        </select>

                        {designation === "Other" && (
                          <div className="mt-2 animate-fadeIn">
                            <input
                              type="text"
                              required
                              placeholder="Type custom designation / program..."
                              className="apple-input text-xs border-[#2997ff]/40 focus:border-[#2997ff]"
                              value={customDesignation}
                              onChange={(e) => setCustomDesignation(e.target.value)}
                              autoFocus
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Trainee Skills & Learning Track Dropdown with Other */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Key Skills & Learning Goal Track <span className="text-[#2997ff]">*</span>
                      </label>
                      <select
                        className="apple-input text-xs bg-[#0b0f19] text-white border-white/20 cursor-pointer focus:border-[#2997ff]"
                        value={skills}
                        onChange={(e) => {
                          setSkills(e.target.value);
                          if (e.target.value !== "Other") setCustomSkills("");
                        }}
                      >
                        <option value="" disabled className="bg-[#0b0f19] text-slate-400">Select Primary Learning Track & Skills...</option>
                        {TRAINEE_SKILLS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#0b0f19] text-white">
                            {opt === "Other" ? "Other (Specify custom skills & goals)" : opt}
                          </option>
                        ))}
                      </select>

                      {skills === "Other" && (
                        <div className="mt-2 animate-fadeIn">
                          <input
                            type="text"
                            required
                            placeholder="Type custom skills & learning goals (comma separated)..."
                            className="apple-input text-xs border-[#2997ff]/40 focus:border-[#2997ff]"
                            value={customSkills}
                            onChange={(e) => setCustomSkills(e.target.value)}
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <CaptchaWidget onVerify={setCaptchaVerified} />

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (password.length > 0 && !checkPasswordStrength(password).isStrong)}
                  className={"apple-btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 transition " + (password.length > 0 && !checkPasswordStrength(password).isStrong ? "opacity-60 cursor-not-allowed" : "cursor-pointer")}
                >
                  <span>{loading ? "Sending Verification Code..." : "Continue to Verification"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            /* OTP Verification Screen */
            <form onSubmit={handleVerifyOtpAndRegister} className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-[#0071e3]/10 border border-[#2997ff]/25 space-y-2 text-center">
                <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/20 text-[#2997ff] flex items-center justify-center mx-auto">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Enter 6-Digit Email Code</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    We sent an authentication code to <strong className="text-[#2997ff]">{email}</strong>
                  </p>
                </div>

                <div className="mt-2.5 py-1.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Security code dispatched to your email address</span>
                </div>

                {generatedOtp && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#0071e3]/15 border border-[#2997ff]/30 text-center space-y-1">
                    <p className="text-[11px] text-slate-300">
                      Security Verification Code: <strong className="font-mono text-sm tracking-widest text-[#2997ff]">{generatedOtp}</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* 6 Digit Inputs */}
              <div>
                <label className="block text-center text-xs font-semibold text-slate-300 mb-3">
                  Verification Code (OTP)
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-extrabold text-white bg-black/60 border border-white/20 rounded-xl focus:outline-none focus:border-[#2997ff] focus:ring-2 focus:ring-[#0071e3]/30 transition"
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium text-center">
                  {error}
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading}
                className="apple-btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? "Verifying & Creating Account..." : "Verify OTP & Complete Registration"}</span>
              </button>

              {/* Resend & Back Controls */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="hover:text-white flex items-center gap-1 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Edit Email / Details
                </button>

                <button
                  type="button"
                  disabled={!canResend}
                  onClick={handleResendOtp}
                  className={"flex items-center gap-1 font-semibold transition " + (canResend ? "text-[#2997ff] hover:underline cursor-pointer" : "text-slate-500 cursor-not-allowed")}
                >
                  <RotateCw className={"w-3 h-3 " + (!canResend ? "animate-spin" : "")} />
                  <span>{canResend ? "Resend OTP" : ("Resend in " + resendTimer + "s")}</span>
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 border-t border-white/10 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-[#2997ff] font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
      </main>

      <Footer />
      <ToastContainer />
    </div>
  );
};
export default RegisterPage;
