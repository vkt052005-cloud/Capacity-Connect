import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, NavLink } from "react-router-dom";
import {
  Wifi, WifiOff, LogOut, ShieldCheck, ChevronDown,
  ZoomIn, ZoomOut, RotateCcw, Video, Menu, X,
  BookOpen, Award, Shield, Users, BarChart3,
  Bell, Brain, Library, FileText, UserCheck,
  FolderLock, FolderOpen, Home, ArrowRight
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAppStore, ZOOM_LEVELS } from "../../store/appStore";
import { useLiveSessionsStore } from "../../store/liveSessionsStore";
import { useCoursesStore } from "../../store/coursesStore";
import { isStudentEnrolledInTeacherCourse } from "../../utils/liveMeetEnrollment";
import { LiveSession } from "../../types";

export const Header: React.FC = () => {
  const { currentUser, logout, login } = useAuthStore();
  const {
    dataSaverMode, toggleDataSaverMode,
    addToast, zoomLevel, setZoomLevel,
    increaseZoom, decreaseZoom, resetZoom
  } = useAppStore();
  const { sessions, launchGoogleMeet } = useLiveSessionsStore();
  const { courses, enrollments } = useCoursesStore();
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [customZoomInput, setCustomZoomInput] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const liveSessions = sessions.filter((s) => s.status === "live");
  let activeLiveClass: LiveSession | undefined = liveSessions[0];
  if (currentUser?.role === "trainee") {
    activeLiveClass = liveSessions.find((s) =>
      isStudentEnrolledInTeacherCourse(currentUser.id, s, courses, enrollments)
    );
  }

  // Close mobile drawer on route changes
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileDrawerOpen]);

  useEffect(() => {
    if (zoomMenuOpen) {
      setCustomZoomInput(zoomLevel.toString());
    }
  }, [zoomMenuOpen, zoomLevel]);

  const handleRoleQuickSwitch = (role: "trainee" | "trainer" | "admin") => {
    if (currentUser?.role !== "admin") return;

    let path = "/admin/dashboard";
    if (role === "trainee") {
      path = "/trainee/dashboard";
    } else if (role === "trainer") {
      path = "/trainer/dashboard";
    }

    setRoleMenuOpen(false);
    setMobileDrawerOpen(false);
    addToast({
      title: "Viewing " + role.toUpperCase() + " Workspace",
      message: `Navigated to ${role} portal with Administrator supervisory rights.`,
      type: "info"
    });
    navigate(path);
  };

  const traineeLinks = [
    { to: "/trainee/dashboard", label: "Learning Dashboard", icon: BookOpen },
    { to: "/trainee/live-classes", label: "Live Meet Classes", icon: Video },
    { to: "/trainee/courses", label: "Course Catalog", icon: Library },
    { to: "/trainee/library", label: "Study Library", icon: FolderOpen },
    { to: "/trainee/assessments", label: "MCQ Assessments", icon: Shield },
    { to: "/trainee/certificates", label: "My Certificates", icon: Award },
    { to: "/trainee/feedback", label: "Course Feedback", icon: FileText },
    { to: "/trainee/profile", label: "Professional Profile", icon: UserCheck }
  ];

  const trainerLinks = [
    { to: "/trainer/dashboard", label: "Trainer Console", icon: Users },
    { to: "/trainer/live-classes", label: "Live Meet Classes", icon: Video },
    { to: "/trainer/courses", label: "Manage Courses", icon: BookOpen },
    { to: "/trainer/library", label: "Trainer Library", icon: Library },
    { to: "/trainer/questionnaires", label: "Create Assessments", icon: FileText },
    { to: "/trainer/reports", label: "Trainee Gradebook", icon: BarChart3 },
    { to: "/trainer/profile", label: "Trainer Portfolio", icon: UserCheck }
  ];

  const adminLinks = [
    { to: "/admin/dashboard", label: "Executive Dashboard", icon: BarChart3 },
    { to: "/admin/users", label: "User Governance", icon: Users },
    { to: "/admin/courses", label: "Course Verification", icon: BookOpen },
    { to: "/admin/competency", label: "Competency Mapping", icon: Brain },
    { to: "/admin/notifications", label: "Announcements", icon: Bell },
    { to: "/admin/reports", label: "Organization Reports", icon: FolderLock },
    { to: "/admin/profile", label: "Admin Profile & Settings", icon: UserCheck }
  ];

  const isTraineeSection = location.pathname.startsWith("/trainee");
  const isTrainerSection = location.pathname.startsWith("/trainer");

  const navLinks = isTraineeSection
    ? traineeLinks
    : isTrainerSection
    ? trainerLinks
    : currentUser?.role === "trainee"
    ? traineeLinks
    : currentUser?.role === "trainer"
    ? trainerLinks
    : adminLinks;

  const isRajTiwari =
    currentUser?.email?.toLowerCase() === "tiwariraj052005@gmail.com" ||
    (currentUser?.id === "u-trainer-official" && !currentUser?.email?.toLowerCase().includes("harry")) ||
    currentUser?.id === "trainer-mto8vdlt-rpmv8";
  const userDisplayName = currentUser ? (isRajTiwari ? "Raj Tiwari" : currentUser.name) : "";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-black/85 backdrop-blur-2xl transition-all">
      <div className="w-full px-3 sm:px-6 lg:px-8 h-15 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3.5 group shrink-0 min-w-0">
          <img
            src="/logo.png"
            alt="Capacity Connect"
            className="w-9 h-9 sm:w-14 sm:h-14 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_22px_rgba(41,151,255,0.6)] shrink-0"
          />
          <div className="shrink min-w-0">
            <span className="text-xs sm:text-base font-black text-white tracking-tight truncate block">
              CAPACITY CONNECT
            </span>
            <p className="text-[10.5px] text-slate-400 -mt-0.5 hidden md:block whitespace-nowrap truncate">
              Digital Capacity Building & Learning Management Portal
            </p>
          </div>
        </Link>

        {/* Right Tools - Desktop & Mobile Action Area */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Data Saver Mode Pill (Desktop & Tablet) */}
          <button
            onClick={toggleDataSaverMode}
            className={"hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition whitespace-nowrap shrink-0 cursor-pointer " + (dataSaverMode ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" : "bg-white/[0.04] border-white/10 text-slate-400 hover:text-white")}
            title="Toggle Low Bandwidth Data-Saver"
          >
            {dataSaverMode ? <WifiOff className="w-3 h-3 text-emerald-400" /> : <Wifi className="w-3 h-3" />}
            <span className="text-[10px] whitespace-nowrap">{dataSaverMode ? "Data-Saver On" : "Data-Saver"}</span>
          </button>

          {/* Live Meet Navigation / Active Indicator */}
          {currentUser && (
            activeLiveClass ? (
              <button
                onClick={() => {
                  launchGoogleMeet(activeLiveClass.id, currentUser?.id, currentUser?.name, true);
                  addToast({
                    title: "Opening Google Meet Room",
                    message: `Redirecting to "${activeLiveClass.title}" with ${activeLiveClass.trainerName}. Attendance certified.`,
                    type: "success"
                  });
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-xs text-rose-300 transition whitespace-nowrap shrink-0 cursor-pointer animate-pulse"
                title={`Click to Join Live Class: ${activeLiveClass.title} (No Code Needed)`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-[10px] font-bold text-white whitespace-nowrap">🔴 Live</span>
              </button>
            ) : (
              <Link
                to={currentUser.role === "trainer" ? "/trainer/live-classes" : currentUser.role === "trainee" ? "/trainee/live-classes" : "/admin/dashboard"}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-slate-300 hover:text-white transition whitespace-nowrap shrink-0 cursor-pointer"
                title="Google Meet Live Classes & Lectures"
              >
                <Video className="w-3.5 h-3.5 text-[#2997ff]" />
                <span className="text-[10px] font-semibold whitespace-nowrap">Live Meet</span>
              </Link>
            )
          )}

          {/* Display Zoom Controller (Desktop & Tablet) */}
          <div className="relative hidden md:block">
            <div className="flex items-center rounded-full bg-white/[0.04] border border-white/10 p-0.5 whitespace-nowrap shrink-0">
              <button
                type="button"
                onClick={decreaseZoom}
                disabled={zoomLevel <= ZOOM_LEVELS[0]}
                className={"p-1 rounded-full transition cursor-pointer " + (zoomLevel <= ZOOM_LEVELS[0] ? "text-slate-600 cursor-not-allowed opacity-50" : "text-slate-400 hover:text-white hover:bg-white/10")}
                title="Zoom Out (A-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              
              <button
                type="button"
                onClick={() => setZoomMenuOpen(!zoomMenuOpen)}
                className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-300 hover:text-[#2997ff] transition cursor-pointer"
                title="Click to select Zoom Scale"
              >
                {zoomLevel}%
              </button>

              <button
                type="button"
                onClick={increaseZoom}
                disabled={zoomLevel >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
                className={"p-1 rounded-full transition cursor-pointer " + (zoomLevel >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1] ? "text-slate-600 cursor-not-allowed opacity-50" : "text-slate-400 hover:text-white hover:bg-white/10")}
                title="Zoom In (A+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {zoomMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-panel border border-white/15 p-1.5 shadow-2xl z-50 space-y-0.5 text-xs animate-fadeIn">
                <div className="flex items-center justify-between px-2.5 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Display Zoom</span>
                  <button
                    onClick={() => {
                      resetZoom();
                      setZoomMenuOpen(false);
                    }}
                    className="text-[#2997ff] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> Reset
                  </button>
                </div>
                {ZOOM_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setZoomLevel(lvl);
                      setZoomMenuOpen(false);
                    }}
                    className={"w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between transition cursor-pointer " + (zoomLevel === lvl ? "bg-[#0071e3] text-white font-semibold shadow-sm" : "text-slate-300 hover:bg-white/10")}
                  >
                    <span className="text-xs whitespace-nowrap">{lvl}% {lvl === 100 ? "(Default)" : ""}</span>
                    {zoomLevel === lvl && <span className="text-xs font-bold text-white">✓</span>}
                  </button>
                ))}

                <div className="pt-2 mt-1.5 border-t border-white/10 px-2 py-1.5">
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <span>Custom Zoom</span>
                    <span className="text-[8.5px] font-normal text-slate-500 font-mono">70% - 160%</span>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const val = parseInt(customZoomInput, 10);
                      if (!isNaN(val)) {
                        setZoomLevel(val);
                        setZoomMenuOpen(false);
                      }
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min={70}
                        max={160}
                        step={1}
                        value={customZoomInput}
                        onChange={(e) => setCustomZoomInput(e.target.value)}
                        className="w-full bg-black/60 border border-white/20 focus:border-[#2997ff] rounded-lg px-2 py-1 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none transition"
                        placeholder={zoomLevel.toString()}
                      />
                      <span className="absolute right-2 top-1 text-[10px] text-slate-400 font-mono pointer-events-none">%</span>
                    </div>
                    <button
                      type="submit"
                      className="px-2.5 py-1 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-white text-[10px] font-bold transition cursor-pointer shrink-0 shadow-sm"
                    >
                      Apply
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Desktop User Profile / Role Switcher */}
          {currentUser ? (
            <div className="relative hidden lg:block">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#2997ff] text-white flex items-center justify-center font-bold text-[10px]">
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-semibold text-white truncate max-w-[100px] leading-tight">{userDisplayName}</p>
                  <p className="text-[9px] text-slate-400 capitalize -mt-0.5">{currentUser.role}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel border border-white/15 p-2 shadow-2xl z-50 space-y-1 text-xs animate-fadeIn">
                  <div className="px-2 py-1.5 border-b border-white/10">
                    <p className="text-xs font-bold text-white truncate">{userDisplayName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                  </div>

                  {currentUser.role === "admin" ? (
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-slate-400 px-2 pt-1 uppercase tracking-wider">Switch Role</p>
                      <button
                        onClick={() => handleRoleQuickSwitch("trainee")}
                        className="w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between cursor-pointer text-slate-300 hover:bg-white/10"
                      >
                        <span>Trainee Learning Suite</span>
                      </button>
                      <button
                        onClick={() => handleRoleQuickSwitch("trainer")}
                        className="w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between cursor-pointer text-slate-300 hover:bg-white/10"
                      >
                        <span>Trainer Console</span>
                      </button>
                      <button
                        onClick={() => handleRoleQuickSwitch("admin")}
                        className="w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between cursor-pointer bg-[#0071e3]/20 text-[#2997ff]"
                      >
                        <span>Executive Dashboard</span>
                        <span className="text-[9px] text-[#2997ff] font-bold">Active</span>
                      </button>
                    </div>
                  ) : (
                    <div className="py-1">
                      <Link
                        to={currentUser.role === "trainee" ? "/trainee/profile" : "/trainer/profile"}
                        onClick={() => setRoleMenuOpen(false)}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-slate-300 hover:bg-white/10 flex items-center justify-between cursor-pointer"
                      >
                        <span>{currentUser.role === "trainee" ? "My Learning Profile" : "My Trainer Portfolio"}</span>
                        <span className="text-[9px] text-[#2997ff] font-medium capitalize">{currentUser.role}</span>
                      </Link>
                    </div>
                  )}

                  <div className="pt-1 border-t border-white/10">
                    <button
                      onClick={() => {
                        logout();
                        setRoleMenuOpen(false);
                        navigate("/");
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Link to="/login" className="apple-btn-primary text-xs px-4 py-1.5 whitespace-nowrap shrink-0 font-semibold shadow-md">
                Sign In
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button (Phones & Tablets < lg) */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 hover:text-white transition flex items-center justify-center cursor-pointer min-w-[40px] min-h-[40px]"
            aria-label="Toggle Mobile Menu"
            title="Menu & Navigation"
          >
            {mobileDrawerOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Off-Canvas Slide-Over Mobile Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fadeIn">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Mobile Drawer Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#0a0a0e] border-l border-white/15 shadow-2xl flex flex-col z-50 safe-bottom animate-slideInRight">
            {/* Mobile Header Bar */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Capacity Connect" className="w-8 h-8 object-contain drop-shadow-[0_0_12px_rgba(41,151,255,0.6)]" />
                <span className="text-sm font-black text-white tracking-tight">CAPACITY CONNECT</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile User Profile Box (if logged in) */}
            {currentUser ? (
              <div className="p-4 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#2997ff] text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {userDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{userDisplayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[#0071e3]/20 border border-[#2997ff]/40 text-[9px] font-semibold text-[#2997ff] capitalize">
                      {currentUser.role} Workspace
                    </span>
                  </div>
                </div>

                {/* Admin Quick Switcher on Mobile */}
                {currentUser.role === "admin" && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Switch Portal</p>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => handleRoleQuickSwitch("trainee")}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold transition text-center cursor-pointer ${isTraineeSection ? "bg-[#0071e3] text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                      >
                        Trainee
                      </button>
                      <button
                        onClick={() => handleRoleQuickSwitch("trainer")}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold transition text-center cursor-pointer ${isTrainerSection ? "bg-[#0071e3] text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                      >
                        Trainer
                      </button>
                      <button
                        onClick={() => handleRoleQuickSwitch("admin")}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold transition text-center cursor-pointer ${!isTraineeSection && !isTrainerSection ? "bg-[#0071e3] text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                      >
                        Admin
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="apple-btn-primary flex-1 py-2.5 text-xs text-center font-bold shadow-md"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="apple-btn-secondary flex-1 py-2.5 text-xs text-center font-semibold"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Scrollable Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 touch-scroll">
              {currentUser ? (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                    {isTraineeSection ? "Trainee Navigation" : isTrainerSection ? "Trainer Navigation" : "Admin Navigation"}
                  </p>
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={({ isActive }) =>
                        "flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition " +
                        (isActive
                          ? "bg-[#0071e3] text-white shadow-md shadow-blue-500/20 font-bold"
                          : "text-slate-300 hover:text-white hover:bg-white/[0.06]")
                      }
                    >
                      <link.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{link.label}</span>
                    </NavLink>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                    Quick Navigation
                  </p>
                  <Link
                    to="/"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.06]"
                  >
                    <Home className="w-4 h-4 text-[#2997ff]" />
                    <span>Home Portal</span>
                  </Link>
                  <Link
                    to="/courses"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.06]"
                  >
                    <Library className="w-4 h-4 text-emerald-400" />
                    <span>Browse Courses</span>
                  </Link>
                </div>
              )}

              {/* Mobile Quick Setting Utilities */}
              <div className="pt-4 border-t border-white/10 space-y-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Settings & Network</p>

                {/* Mobile Data Saver Toggle */}
                <button
                  onClick={toggleDataSaverMode}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-medium text-slate-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {dataSaverMode ? <WifiOff className="w-4 h-4 text-emerald-400" /> : <Wifi className="w-4 h-4 text-slate-400" />}
                    <span>Low Bandwidth Data-Saver</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dataSaverMode ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-slate-400"}`}>
                    {dataSaverMode ? "ON" : "OFF"}
                  </span>
                </button>
              </div>
            </div>

            {/* Mobile Footer / Sign Out */}
            {currentUser && (
              <div className="p-4 border-t border-white/10 bg-black/40">
                <button
                  onClick={() => {
                    logout();
                    setMobileDrawerOpen(false);
                    navigate("/");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Portal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
export default Header;

