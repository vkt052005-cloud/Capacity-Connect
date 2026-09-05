import React, { useState, useEffect } from "react";
import {
  Video, VideoOff, Mic, MicOff, ScreenShare, Users, MessageSquare,
  PhoneOff, Sparkles, CheckCircle2, Shield, Radio, X
} from "lucide-react";
import { useAppStore } from "../../store/appStore";
import { useAuthStore } from "../../store/authStore";

export const LiveSessionModal: React.FC = () => {
  const { zoomModalOpen, closeZoomModal, activeZoomSession, addToast } = useAppStore();
  const { currentUser } = useAuthStore();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: "Dr. Marcus Vance", text: "Welcome to today live lab session. Feel free to ask questions in the chat!", time: "16:30" },
    { sender: "Arjun Sharma", text: "Excited to review the Kafka partition failover setup.", time: "16:31" }
  ]);
  const [newMsg, setNewMsg] = useState("");
  const [syncedAttendance, setSyncedAttendance] = useState(false);

  useEffect(() => {
    if (zoomModalOpen && !syncedAttendance) {
      const timer = setTimeout(() => {
        setSyncedAttendance(true);
        addToast({
          title: "Attendance Synchronized",
          message: "Your live attendance has been recorded in the LMS database.",
          type: "success"
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [zoomModalOpen]);

  if (!zoomModalOpen || !activeZoomSession) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setMessages([
      ...messages,
      {
        sender: currentUser?.name || "Trainee",
        text: newMsg.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setNewMsg("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[85vh] glass-panel border border-white/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Meeting Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#0d0f16]/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center animate-pulse">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">{activeZoomSession.title}</h3>
                <span className="badge-red text-[9px] py-0.5">LIVE ZOOM MEETING</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Instructor: <span className="text-[#2997ff]">{activeZoomSession.trainerName}</span> • Meeting ID: {activeZoomSession.zoomMeetingId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {syncedAttendance && (
              <span className="badge-green text-[10px] hidden sm:flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Attendance Synced
              </span>
            )}
            <button
              onClick={closeZoomModal}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas & Main Stream */}
        <div className="flex-1 flex overflow-hidden relative bg-[#06070a]">
          {/* Main Presenter Video Tile */}
          <div className="flex-1 relative flex items-center justify-center p-4 bg-gradient-to-b from-[#090b12] to-[#040508]">
            <div className="relative w-full h-full max-w-3xl max-h-[500px] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900 group">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80"
                alt="Presenter Video"
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {/* Presenter Name Tag */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold">{activeZoomSession.trainerName} (Host - Screen Sharing)</span>
              </div>

              {/* Live Audio Waves simulation */}
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[10px] text-emerald-400 font-mono">
                <Mic className="w-3 h-3" />
                <span>HD Audio 48kHz</span>
              </div>
            </div>

            {/* Self floating PIP preview */}
            <div className="absolute bottom-6 right-6 w-36 sm:w-44 h-24 sm:h-28 rounded-xl overflow-hidden border-2 border-[#2997ff]/40 shadow-2xl bg-black/80 z-10 backdrop-blur-md">
              {videoOn ? (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center relative">
                  <span className="text-[10px] text-slate-300 font-medium">{currentUser?.name || "You"}</span>
                </div>
              ) : (
                <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-500">
                  <VideoOff className="w-5 h-5 mb-1" />
                  <span className="text-[9px]">Camera Muted</span>
                </div>
              )}
              <div className="absolute bottom-1 left-2 text-[9px] text-white font-semibold">You</div>
            </div>
          </div>

          {/* Chat / Attendees Sidebar */}
          {chatOpen && (
            <div className="w-72 sm:w-80 border-l border-white/10 bg-[#0c0e17]/95 flex flex-col h-full animate-fadeIn">
              <div className="p-3 border-b border-white/10 flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#2997ff]" /> In-Meeting Chat
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">{activeZoomSession.attendeeCount} Attendees</span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className="text-xs space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-200">{m.sender}</span>
                      <span>{m.time}</span>
                    </div>
                    <p className="text-slate-300 bg-white/[0.04] p-2 rounded-xl border border-white/5 leading-relaxed">
                      {m.text}
                    </p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  placeholder="Send a question..."
                  className="apple-input text-xs py-1.5"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                />
                <button type="submit" className="apple-btn-primary text-xs px-3 py-1.5">
                  Send
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Control Dock (Apple Style) */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#0d0f16]/95 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMicOn(!micOn)}
              className={"p-2.5 rounded-full transition cursor-pointer " + (micOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-rose-500/20 text-rose-400")}
            >
              {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setVideoOn(!videoOn)}
              className={"p-2.5 rounded-full transition cursor-pointer " + (videoOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-rose-500/20 text-rose-400")}
            >
              {videoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSharingScreen(!sharingScreen);
                addToast({
                  title: sharingScreen ? "Screen Share Stopped" : "Screen Share Started",
                  message: sharingScreen ? "Reverted to camera stream." : "Broadcasting 1080p display stream.",
                  type: "info"
                });
              }}
              className={"flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition cursor-pointer " + (sharingScreen ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-white/10 text-slate-200 hover:bg-white/20")}
            >
              <ScreenShare className="w-4 h-4" />
              <span className="hidden sm:inline">{sharingScreen ? "Sharing Display" : "Share Screen"}</span>
            </button>

            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={"flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition cursor-pointer " + (chatOpen ? "bg-[#0071e3]/30 text-[#2997ff] border border-[#2997ff]/40" : "bg-white/10 text-slate-200 hover:bg-white/20")}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </button>
          </div>

          <button
            onClick={closeZoomModal}
            className="apple-btn-danger text-xs px-4 py-2 flex items-center gap-1.5 font-bold"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
