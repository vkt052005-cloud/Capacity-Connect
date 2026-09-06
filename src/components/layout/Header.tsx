import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wifi, WifiOff, LogOut, ShieldCheck, ChevronDown,
  ZoomIn, ZoomOut, RotateCcw, Video
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAppStore, ZOOM_LEVELS } from "../../store/appStore";
import { useLiveSessionsStore } from "../../store/liveSessionsStore";

export const Header: React.FC = () => {
  const { currentUser, logout, login } = useAuthStore();
  const {
    dataSaverMode, toggleDataSaverMode,
    addToast, zoomLevel, setZoomLevel,
    increaseZoom, decreaseZoom, resetZoom
  } = useAppStore();
  const { sessions, openClassroom, launchGoogleMeet } = useLiveSessionsStore();
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [customZoomInput, setCustomZoomInput] = useState("");
  const navigate = useNavigate();
  const activeLiveClass = sessions.find((s) => s.status === "live");

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
    addToast({
      title: "Viewing " + role.toUpperCase() + " Workspace",
      message: `Navigated to ${role} portal with Administrator supervisory rights.`,
      type: "info"
    });
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-black/80 backdrop-blur-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3.5 group shrink-0">
          <img
            src="/logo.png"
            alt="Capacity Connect"
            className="w-11 h-11 sm:w-14 sm:h-14 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_22px_rgba(41,151,255,0.6)] shrink-0"
          />
          <div className="shrink-0">
            <span className="text-sm sm:text-base font-black text-white tracking-tight whitespace-nowrap block">CAPACITY CONNECT</span>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden md:block whitespace-nowrap">Digital Capacity Building & Learning Management Portal</p>
          </div>
        </Link>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {/* Data Saver Mode Pill */}
          <button
            onClick={toggleDataSaverMode}
            className={"hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition whitespace-nowrap shrink-0 cursor-pointer " + (dataSaverMode ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" : "bg-white/[0.04] border-white/10 text-slate-400 hover:text-white")}
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
                  launchGoogleMeet(activeLiveClass.id, currentUser?.id, currentUser?.name);
                  addToast({
                    title: "Connecting to Google Meet",
                    message: `Joined "${activeLiveClass.title}". Attendance certified.`,
                    type: "success"
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-xs text-rose-300 transition whitespace-nowrap shrink-0 cursor-pointer animate-pulse"
                title={`Click to Join Live Class: ${activeLiveClass.title} (No Code Needed)`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-[10px] font-bold text-white">🔴 Live Class</span>
              </button>
            ) : (
              <Link
                to={currentUser.role === "trainer" ? "/trainer/live-classes" : currentUser.role === "trainee" ? "/trainee/live-classes" : "/admin/dashboard"}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-slate-300 hover:text-white transition whitespace-nowrap shrink-0 cursor-pointer"
                title="Google Meet Live Classes & Lectures"
              >
                <Video className="w-3.5 h-3.5 text-[#2997ff]" />
                <span className="text-[10px] font-semibold whitespace-nowrap">Live Meet</span>
              </Link>
            )
          )}

          {/* Display Zoom & Font Scale Controller */}
          <div className="relative">
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

                {/* Manual / Custom Zoom Input */}
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

          {/* User Auth Profile / Quick Role Picker */}
          {currentUser ? (() => {
            const isRajTiwari =
              currentUser.email?.toLowerCase() === "tiwariraj052005@gmail.com" ||
              (currentUser.id === "u-trainer-official" && !currentUser.email?.toLowerCase().includes("harry")) ||
              currentUser.id === "trainer-mto8vdlt-rpmv8";
            const userDisplayName = isRajTiwari ? "Raj Tiwari" : currentUser.name;

            return (
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#2997ff] text-white flex items-center justify-center font-bold text-[10px]">
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
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
            );
          })() : (
            <div className="flex items-center">
              <Link to="/login" className="apple-btn-primary text-xs px-4 py-1.5 whitespace-nowrap shrink-0 font-semibold shadow-md">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
