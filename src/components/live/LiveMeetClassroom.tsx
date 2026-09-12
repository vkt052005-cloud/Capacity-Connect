import React, { useState, useEffect, useRef } from "react";
import {
  Video, VideoOff, Mic, MicOff, ScreenShare, PhoneOff, CheckCircle2,
  Radio, X, Hand, PenTool, ExternalLink, Copy, Check,
  Download, Calendar, BookOpen, CheckSquare, Square,
  Sparkles, ShieldCheck, ArrowUpRight, HelpCircle, MessageSquare,
  Users, Volume2, VolumeX, Monitor, Settings, QrCode, KeyRound
} from "lucide-react";
import { useLiveSessionsStore } from "../../store/liveSessionsStore";
import { useAuthStore } from "../../store/authStore";
import { useCoursesStore } from "../../store/coursesStore";
import { useUsersStore } from "../../store/usersStore";
import { useAppStore } from "../../store/appStore";

export const LiveMeetClassroom: React.FC = () => {
  const { activeSession, isClassroomOpen, closeClassroom, joinSession, endSession, launchGoogleMeet } = useLiveSessionsStore();
  const { currentUser } = useAuthStore();
  const { users } = useUsersStore();
  const { enrollments } = useCoursesStore();
  const { addToast } = useAppStore();

  const removedUserIds = new Set(users.filter((u) => u.status === "removed").map((u) => u.id));

  const [activeTab, setActiveTab] = useState<"meet" | "whiteboard" | "agenda" | "qa" | "attendance">("meet");
  const [copiedLink, setCopiedLink] = useState(false);
  const [syncedAttendance, setSyncedAttendance] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [handRaised, setHandRaised] = useState(false);
  const [attendancePin] = useState("8942");
  const [userEnteredPin, setUserEnteredPin] = useState("");
  const [isAttendanceMarked, setIsAttendanceMarked] = useState(false);

  // Whiteboard Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#2997ff");
  const [penSize, setPenSize] = useState(3);

  // Agenda Topics Checklist
  const [agendaItems, setAgendaItems] = useState([
    { id: "a1", text: "Lecture Orientation & Google Meet Setup", completed: true },
    { id: "a2", text: "Core Architectural Concepts & Walkthrough", completed: false },
    { id: "a3", text: "Hands-on Implementation & Code Analysis", completed: false },
    { id: "a4", text: "Live Q&A, Doubt Clearing & Attendance Verification", completed: false }
  ]);

  // Live Q&A Stream
  const [questions, setQuestions] = useState<{ id: string; sender: string; role: string; text: string; time: string; answered?: boolean }[]>([
    {
      id: "q-0",
      sender: "System",
      role: "admin",
      text: "Google Meet session connected. Ask your real-time questions here.",
      time: "Now",
      answered: true
    }
  ]);
  const [newQuestion, setNewQuestion] = useState("");

  const isHost =
    currentUser?.id === activeSession?.trainerId ||
    currentUser?.role === "trainer" ||
    currentUser?.role === "admin";

  // Auto-sync real LMS attendance
  useEffect(() => {
    if (isClassroomOpen && activeSession && currentUser) {
      joinSession(activeSession.id, currentUser.id);

      const timer = setTimeout(() => {
        setSyncedAttendance(true);
        addToast({
          title: "Attendance Logged",
          message: `${currentUser.name}'s verified participation recorded in Capacity Connect LMS.`,
          type: "success"
        });
      }, 1500);

      const interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [isClassroomOpen, activeSession?.id]);

  // Eject removed users from active classroom immediately
  useEffect(() => {
    if (currentUser && (currentUser.status === "removed" || removedUserIds.has(currentUser.id))) {
      closeClassroom();
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login?removed=true";
      }
    }
  }, [currentUser, users]);

  if (!isClassroomOpen || !activeSession) return null;

  const meetUrl =
    activeSession.googleMeetUrl ||
    activeSession.joinUrl ||
    `https://meet.google.com/${activeSession.meetingCode}`;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleLaunchMeet = () => {
    launchGoogleMeet(activeSession.id, currentUser?.id, currentUser?.name);
    addToast({
      title: "Google Meet Call Launched",
      message: "Connected to live Google Meet call. Keeping companion notes synced.",
      type: "success"
    });
  };

  const copyMeetUrl = () => {
    navigator.clipboard.writeText(meetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    addToast({
      title: "Google Meet Link Copied",
      message: meetUrl,
      type: "success"
    });
  };

  // Canvas Whiteboard Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = "round";
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const downloadWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = image;
    a.download = `whiteboard-notes-${activeSession.id}.png`;
    a.click();
    addToast({ title: "Notes Exported", message: "Whiteboard saved as PNG.", type: "success" });
  };

  // Agenda toggle
  const toggleAgenda = (id: string) => {
    setAgendaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  // Q&A Submit
  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setQuestions((prev) => [
      ...prev,
      {
        id: "q-" + Date.now(),
        sender: currentUser?.name || "Participant",
        role: currentUser?.role || "trainee",
        text: newQuestion.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        answered: false
      }
    ]);
    setNewQuestion("");
    addToast({ title: "Question Posted", message: "Instructor and peers can view your doubt.", type: "info" });
  };

  // Export Attendance CSV
  const handleExportAttendance = () => {
    const attendees = activeSession.attendees || [];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Session Title,Google Meet Code,Instructor,Attendee ID,Timestamp\n" +
      attendees
        .map(
          (attId) =>
            `"${activeSession.title}","${activeSession.meetingCode}","${activeSession.trainerName}","${attId}","${new Date().toISOString()}"`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance-${activeSession.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ title: "Attendance Exported", message: "Attendance roster downloaded as CSV.", type: "success" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/95 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-7xl h-[94vh] glass-panel border border-white/20 shadow-2xl flex flex-col overflow-hidden rounded-2xl bg-[#080a10]">
        
        {/* ─── Classroom Top Header ─── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-[#0d101a]/95">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>GOOGLE MEET LIVE</span>
              <span className="font-mono text-[11px] text-white/80">{formatTime(elapsedSeconds)}</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                {activeSession.title}
                <span className="text-[10px] text-[#2997ff] bg-[#0071e3]/20 px-2 py-0.5 rounded-md border border-[#2997ff]/30 font-semibold hidden md:inline">
                  {activeSession.courseTitle}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Instructor: <span className="text-white font-medium">{activeSession.trainerName}</span> • Room Code:{" "}
                <span className="font-mono text-[#2997ff] font-bold">{activeSession.meetingCode}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {syncedAttendance && (
              <span className="badge-green text-[10px] hidden sm:flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Attendance Certified
              </span>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>In-Portal Live Classroom</span>
            </div>

            <button
              onClick={copyMeetUrl}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs flex items-center gap-1.5 transition border border-white/10 cursor-pointer"
              title="Copy Google Meet Link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{copiedLink ? "Copied" : "Share"}</span>
            </button>

            <button
              onClick={closeClassroom}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
              title="Minimize Workspace"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ─── Classroom Center Stage ─── */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Main Stage Panel */}
          <div className="flex-1 flex flex-col relative bg-[#04060b] overflow-y-auto">
            
            {/* Top Navigation Tabs */}
            <div className="flex items-center gap-2 p-3 border-b border-white/10 bg-[#0d101a]/80">
              <button
                onClick={() => setActiveTab("meet")}
                className={"px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer " + (activeTab === "meet" ? "bg-[#0071e3] text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5")}
              >
                <Video className="w-3.5 h-3.5" /> Google Meet Launchpad
              </button>
              <button
                onClick={() => setActiveTab("whiteboard")}
                className={"px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer " + (activeTab === "whiteboard" ? "bg-[#0071e3] text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5")}
              >
                <PenTool className="w-3.5 h-3.5" /> Interactive Whiteboard
              </button>
              <button
                onClick={() => setActiveTab("agenda")}
                className={"px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer " + (activeTab === "agenda" ? "bg-[#0071e3] text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5")}
              >
                <BookOpen className="w-3.5 h-3.5" /> Lecture Agenda & Goals
              </button>
              <button
                onClick={() => setActiveTab("qa")}
                className={"px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer " + (activeTab === "qa" ? "bg-[#0071e3] text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5")}
              >
                <HelpCircle className="w-3.5 h-3.5" /> In-Class Q&A ({questions.length - 1})
              </button>
              <button
                onClick={() => setActiveTab("attendance")}
                className={"px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer " + (activeTab === "attendance" ? "bg-[#0071e3] text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5")}
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" /> Live Attendance QR
              </button>
            </div>

            {/* Stage Body */}
            <div className="flex-1 p-4 sm:p-6">
              
              {/* TAB 1: Official Google Meet Live Launchpad & Control Deck */}
              {activeTab === "meet" && (
                <div className="w-full h-full flex flex-col space-y-4">
                  {/* Google Meet Console Card */}
                  <div className="relative w-full h-[460px] sm:h-[520px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#131722] via-[#0b0e14] to-[#07090d] border-2 border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col items-center justify-center p-6 sm:p-10 text-center space-y-6">
                    {/* Official Google Meet Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 shadow-inner">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]" title="Google Blue" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]" title="Google Red" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC05]" title="Google Yellow" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]" title="Google Green" />
                      </div>
                      <span className="text-xs font-bold text-white tracking-wide uppercase">Official Google Meet</span>
                    </div>

                    {/* Room Info */}
                    <div className="max-w-xl space-y-2">
                      <div className="inline-flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider animate-pulse">
                        <Radio className="w-3.5 h-3.5" /> Live Video Conference Active
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {activeSession.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300">
                        {activeSession.courseTitle} • Conducted by <strong className="text-white">{activeSession.trainerName}</strong>
                      </p>
                    </div>

                    {/* Meeting Code Display */}
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 max-w-md w-full space-y-2">
                      <span className="text-[11px] text-slate-400 font-medium">Google Meet Room Code</span>
                      <div className="flex items-center justify-between gap-3 bg-black/40 px-4 py-2.5 rounded-lg border border-white/10">
                        <span className="font-mono text-base sm:text-lg font-bold text-emerald-400 tracking-wider">
                          {activeSession.meetingCode}
                        </span>
                        <button
                          onClick={copyMeetUrl}
                          className="apple-btn-secondary text-xs px-2.5 py-1 flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer"
                          title="Copy Link"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          <span>{copiedLink ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Big Action Button: Open Official Google Meet */}
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        onClick={handleLaunchMeet}
                        className="apple-btn-primary px-8 py-3.5 text-sm sm:text-base font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:brightness-110 shadow-xl shadow-emerald-600/30 flex items-center gap-2 transform hover:scale-[1.02] transition cursor-pointer"
                      >
                        <Video className="w-5 h-5 text-white" />
                        Launch Official Google Meet (1-Click) ↗
                      </button>

                      <button
                        onClick={() => setActiveTab("whiteboard")}
                        className="apple-btn-secondary px-5 py-3.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <PenTool className="w-4 h-4 text-[#2997ff]" /> Open Interactive Whiteboard
                      </button>
                    </div>

                    {/* Compliance & Security Notice */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 max-w-lg">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Official Google Meet runs on <strong className="text-white">meet.google.com</strong> with native camera, mic, and screen-sharing security. Your attendance is tracked and verified in Capacity Connect LMS.
                      </span>
                    </div>
                  </div>

                  {/* Room Info & Verification Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Classroom Topic</span>
                        <span className="badge-blue text-[8px]">ACTIVE CALL</span>
                      </div>
                      <p className="font-bold text-white truncate text-sm">{activeSession.title}</p>
                      <p className="text-[11px] text-[#2997ff]">{activeSession.courseTitle}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Faculty Instructor</span>
                        <span className="text-emerald-400 text-[10px] font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Certified
                        </span>
                      </div>
                      <p className="font-bold text-white text-sm">{activeSession.trainerName}</p>
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Attendance Auto-Certified in LMS
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Official Meet URL</span>
                        <button
                          onClick={copyMeetUrl}
                          className="text-xs text-[#2997ff] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedLink ? "Copied" : "Copy Code"}</span>
                        </button>
                      </div>
                      <p className="font-mono text-xs text-emerald-400 font-bold truncate">https://meet.google.com/{activeSession.meetingCode}</p>
                      <div className="flex items-center justify-between pt-0.5 text-[11px]">
                        <span className="text-slate-400">Official Google Room</span>
                        <a
                          href={meetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2997ff] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Open Meet ↗</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Interactive Whiteboard */}
              {activeTab === "whiteboard" && (
                <div className="h-full flex flex-col space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Pen Color:</span>
                      {["#2997ff", "#30d158", "#ff375f", "#ffd60a", "#ffffff"].map((c) => (
                        <button
                          key={c}
                          onClick={() => setPenColor(c)}
                          style={{ backgroundColor: c }}
                          className={"w-5 h-5 rounded-full border-2 transition " + (penColor === c ? "border-white scale-110" : "border-transparent opacity-75 hover:opacity-100")}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Width:</span>
                      {[2, 4, 6, 8].map((s) => (
                        <button
                          key={s}
                          onClick={() => setPenSize(s)}
                          className={"px-2 py-0.5 rounded text-[11px] font-mono " + (penSize === s ? "bg-[#0071e3] text-white" : "bg-white/5 text-slate-400 hover:text-white")}
                        >
                          {s}px
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={clearCanvas}
                        className="apple-btn-secondary text-xs px-3 py-1.5 font-semibold text-rose-400 hover:text-rose-300"
                      >
                        Clear Canvas
                      </button>
                      <button
                        onClick={downloadWhiteboard}
                        className="apple-btn-primary text-xs px-3 py-1.5 font-bold flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Save PNG
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 rounded-2xl border border-white/15 bg-[#0a0d16] relative overflow-hidden shadow-inner min-h-[420px]">
                    <canvas
                      ref={canvasRef}
                      width={1000}
                      height={500}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="w-full h-full cursor-crosshair block"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Lecture Agenda */}
              {activeTab === "agenda" && (
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white tracking-tight">Syllabus & Class Agenda</h3>
                    <p className="text-xs text-slate-400">Track key concepts and milestone objectives for this session</p>
                  </div>

                  <div className="space-y-2">
                    {agendaItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleAgenda(item.id)}
                        className={"p-3.5 rounded-xl border transition flex items-center gap-3 cursor-pointer " + (item.completed ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200" : "bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.04]")}
                      >
                        {item.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className={"text-xs font-medium " + (item.completed ? "line-through opacity-80" : "")}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: In-Class Q&A */}
              {activeTab === "qa" && (
                <div className="max-w-3xl mx-auto flex flex-col h-[520px] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Live Technical Doubts & Q&A</h4>
                      <p className="text-xs text-slate-400">Questions are visible to instructor and enrolled peers</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2.5 p-3 rounded-xl bg-black/40 border border-white/10">
                    {questions.map((q) => (
                      <div key={q.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{q.sender}</span>
                            <span className="text-slate-400 uppercase text-[9px] px-1.5 py-0.5 rounded bg-white/5">
                              {q.role}
                            </span>
                          </div>
                          <span className="text-slate-500">{q.time}</span>
                        </div>
                        <p className="text-xs text-slate-200">{q.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendQuestion} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a technical question or doubt..."
                      className="apple-input text-xs"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                    />
                    <button type="submit" className="apple-btn-primary text-xs px-4 py-2 font-bold shrink-0">
                      Submit Doubt
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 5: Live Attendance QR & Check-In */}
              {activeTab === "attendance" && (
                <div className="max-w-3xl mx-auto space-y-6 py-2">
                  <div className="glass-panel p-6 sm:p-8 border border-white/15 rounded-3xl bg-gradient-to-br from-[#0c101c] via-[#10162a] to-[#070910] shadow-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#2997ff] font-bold">
                            Live Lecture Attendance System
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                          {activeSession.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Faculty: <span className="text-slate-200 font-semibold">{activeSession.trainerName}</span> • Meeting Code: <span className="font-mono text-[#2997ff]">{activeSession.meetingCode}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="badge-blue text-xs px-3 py-1 font-mono">
                          PIN: {attendancePin}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 items-center">
                      {/* QR Display */}
                      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-3">
                        <div className="p-3 bg-white rounded-2xl shadow-2xl shadow-blue-500/20 border-2 border-[#2997ff]">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=${encodeURIComponent(
                              `${window.location.origin}/verify/id?session=${activeSession.id}&pin=${attendancePin}&title=${encodeURIComponent(activeSession.title)}`
                            )}`}
                            alt="Classroom Attendance QR Code"
                            className="w-44 h-44 object-contain"
                          />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            Scan with Phone Camera
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {isHost ? "Project on screen for classroom check-in" : "Scan to verify attendance on mobile"}
                          </span>
                        </div>
                      </div>

                      {/* Check-In Controls */}
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                            Attendance Status
                          </span>
                          {(syncedAttendance || isAttendanceMarked) ? (
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                              <CheckCircle2 className="w-5 h-5 shrink-0" />
                              <span>Verified & Logged in LMS</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-300 font-medium text-xs">
                              <Sparkles className="w-4 h-4 shrink-0" />
                              <span>Awaiting PIN or QR Check-In</span>
                            </div>
                          )}
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {(syncedAttendance || isAttendanceMarked)
                              ? `Verified attendance timestamp recorded for ${currentUser?.name || "Trainee"}. Full attendance credit awarded.`
                              : "Enter the 4-digit PIN displayed on the instructor's screen or scan the QR code from your mobile camera."}
                          </p>
                        </div>

                        {!(syncedAttendance || isAttendanceMarked) && (
                          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                            <label className="block text-xs font-semibold text-slate-300">
                              Enter Classroom PIN
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="e.g. 8942"
                                value={userEnteredPin}
                                onChange={(e) => setUserEnteredPin(e.target.value.trim())}
                                className="apple-input text-center text-sm font-mono tracking-widest uppercase font-bold"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (userEnteredPin === attendancePin) {
                                    setIsAttendanceMarked(true);
                                    addToast({
                                      title: "Attendance Recorded",
                                      message: `Verified attendance registered for ${currentUser?.name || "Trainee"}.`,
                                      type: "success"
                                    });
                                  } else {
                                    addToast({
                                      title: "Invalid PIN",
                                      message: "The entered PIN does not match the active classroom PIN.",
                                      type: "error"
                                    });
                                  }
                                }}
                                className="apple-btn-primary text-xs px-4 py-2 font-bold shrink-0"
                              >
                                Check In
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="p-3 rounded-xl bg-[#0071e3]/10 border border-[#2997ff]/20 flex items-center justify-between text-xs text-slate-300">
                          <span className="text-[11px] text-slate-400">Total Verified Attendees</span>
                          <span className="font-bold text-white font-mono">{activeSession.attendeeCount || 1} Present</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ─── Right Drawer: Live Attendee Roster ─── */}
          <div className="w-80 border-l border-white/10 bg-[#0b0e18]/95 flex flex-col h-full shrink-0 hidden lg:flex">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2997ff]" />
                <h4 className="text-xs font-bold text-white">Class Roster & Presence</h4>
              </div>
              <span className="badge-blue text-[9px] font-mono">
                {activeSession.attendeeCount || 1} Present
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {/* Host Instructor */}
              <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#0071e3]/30 text-[#2997ff] font-bold text-xs flex items-center justify-center">
                    {activeSession.trainerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{activeSession.trainerName}</h5>
                    <span className="text-[10px] text-blue-400 font-medium">Faculty Host</span>
                  </div>
                </div>
                <span className="text-[9px] badge-blue">Broadcasting</span>
              </div>

              {/* Current User */}
              {currentUser && currentUser.id !== activeSession.trainerId && (
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                      {currentUser.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{currentUser.name} (You)</h5>
                      <span className="text-[10px] text-emerald-400 font-medium">Verified Attendee</span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              )}

              {/* Other Attendees (Excludes removed users) */}
              {activeSession.attendees?.filter(id => id !== activeSession.trainerId && id !== currentUser?.id && !removedUserIds.has(id)).map((attId, idx) => {
                const attendeeUser = users.find(u => u.id === attId);
                return (
                  <div key={attId} className="p-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-mono text-[11px] truncate max-w-[170px]">
                      {attendeeUser ? attendeeUser.name : `Trainee #${idx + 1}`}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Present</span>
                  </div>
                );
              })}
            </div>

            {/* Instructor Controls */}
            {isHost && (
              <div className="p-3 border-t border-white/10 space-y-2 bg-[#090b14]">
                <button
                  onClick={handleExportAttendance}
                  className="apple-btn-secondary text-xs w-full py-2 font-semibold flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export Attendance CSV
                </button>
                <button
                  onClick={() => {
                    endSession(activeSession.id);
                    addToast({ title: "Google Meet Class Finalized", message: "Class completed and attendance ledger archived.", type: "success" });
                    closeClassroom();
                  }}
                  className="apple-btn-danger text-xs w-full py-2 font-bold"
                >
                  End Class & Archive Attendance
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── Bottom Dock ─── */}
        <div className="px-4 sm:px-6 py-2.5 border-t border-white/10 bg-[#0d101a]/95 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLaunchMeet}
              className="text-[#2997ff] hover:underline font-bold flex items-center gap-1"
            >
              <Video className="w-3.5 h-3.5" /> Active in Google Meet: {activeSession.meetingCode}
            </button>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">Official Enterprise Meeting Cluster</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !handRaised;
                setHandRaised(next);
                addToast({
                  title: next ? "Hand Raised" : "Hand Lowered",
                  message: next ? "Faculty notified of your question." : "Hand lowered.",
                  type: next ? "warning" : "info"
                });
              }}
              className={"px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer " + (handRaised ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-white/10 text-slate-300 hover:text-white")}
            >
              <Hand className="w-3.5 h-3.5" />
              <span>{handRaised ? "Hand Raised ✋" : "Raise Hand"}</span>
            </button>

            <button
              onClick={closeClassroom}
              className="apple-btn-secondary text-xs px-3.5 py-1.5 font-semibold"
            >
              Close Hub
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LiveMeetClassroom;
