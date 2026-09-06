import React, { useState } from "react";
import { BarChart3, Download, Sparkles, Brain, TrendingUp, Shield, BarChart2, Users, Video, BookOpen } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAppStore } from "../../store/appStore";
import { useAttendanceStore } from "../../store/attendanceStore";
import { useCoursesStore } from "../../store/coursesStore";
import { useLiveSessionsStore } from "../../store/liveSessionsStore";

export const AdminReports: React.FC = () => {
  const { addToast } = useAppStore();
  const { getAllAttendanceSummary, sessionAttendance, lessonAttendance, getSessionAttendees } = useAttendanceStore();
  const { courses } = useCoursesStore();
  const { sessions } = useLiveSessionsStore();
  const [activeTab, setActiveTab] = useState<"competency" | "attendance">("attendance");

  const attendanceSummary = getAllAttendanceSummary();
  const totalSessionJoins = sessionAttendance.length;
  const totalLessonsWatched = lessonAttendance.filter((a) => a.status === "watched").length;
  const uniqueTrainees = new Set([
    ...sessionAttendance.map((a) => a.traineeId),
    ...lessonAttendance.map((a) => a.traineeId),
  ]).size;

  // Per-session attendance breakdown
  const sessionBreakdown = sessions.map((s) => ({
    session: s,
    attendees: getSessionAttendees(s.id),
  })).filter((s) => s.attendees.length > 0);

  const handleExportAttendanceCSV = () => {
    const rows = [
      ["Trainee Name", "Sessions Attended", "Lessons Watched (≥80%)"].join(","),
      ...attendanceSummary.map((a) =>
        [a.traineeName, a.sessionsAttended, a.lessonsWatched].join(",")
      ),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Attendance_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({ title: "Export Complete", message: "Attendance CSV downloaded.", type: "success" });
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Department", "Active Trainees", "Competency Index", "Avg Assessment Score", "Certifications Issued", "Compliance Status"].join(","),
      ["National Capacity Building", "142", "94.2%", "88.6%", "128", "Fully Compliant"].join(","),
      ["Meteorological Sciences & Analytics", "98", "91.8%", "84.2%", "85", "Fully Compliant"].join(","),
      ["Cloud & Cyber Infrastructure", "76", "88.5%", "82.0%", "64", "Fully Compliant"].join(","),
      ["Emergency Operations & Logistics", "112", "96.1%", "91.4%", "105", "Exceeds Benchmarks"].join(","),
      ["Public Administration & Policy", "64", "89.0%", "83.5%", "58", "Fully Compliant"].join(",")
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Capacity_Connect_Competency_Digest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({ title: "Export Complete", message: "Competency digest CSV downloaded.", type: "success" });
  };

  return (
    <DashboardLayout
      pageTitle="AI Skill Gap Analysis & Governance Reports"
      breadcrumbs={[
        { label: "Admin Dashboard", to: "/admin/dashboard" },
        { label: "Reports & Analytics" }
      ]}
    >
      <div className="space-y-6">
        <div className="glass-panel p-6 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#2997ff] font-bold">
              <Brain className="w-4 h-4" />
              <span>Predictive Organizational Competency Forecast</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">Enterprise Skill Gap & Attendance Report</h2>
            <p className="text-xs text-slate-400">Quarterly talent readiness, assessment distributions, and live attendance analytics</p>
          </div>
          <button
            onClick={activeTab === "attendance" ? handleExportAttendanceCSV : handleExportCSV}
            className="apple-btn-primary text-xs px-4 py-2 font-bold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Tab Switch */}
        <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`text-xs px-4 py-1.5 rounded-xl font-semibold transition-all ${activeTab === "attendance" ? "bg-[#2997ff] text-white shadow" : "text-slate-400 hover:text-white"}`}
          >
            <span className="flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5" /> Attendance Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab("competency")}
            className={`text-xs px-4 py-1.5 rounded-xl font-semibold transition-all ${activeTab === "competency" ? "bg-[#2997ff] text-white shadow" : "text-slate-400 hover:text-white"}`}
          >
            <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Competency Reports</span>
          </button>
        </div>

        {/* ATTENDANCE TAB */}
        {activeTab === "attendance" && (
          <div className="space-y-5">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Users, label: "Active Learners", value: uniqueTrainees, color: "text-[#2997ff]" },
                { icon: Video, label: "Session Joins", value: totalSessionJoins, color: "text-emerald-400" },
                { icon: BookOpen, label: "Lessons Watched", value: totalLessonsWatched, color: "text-amber-400" },
                { icon: BarChart2, label: "Total Sessions", value: sessions.length, color: "text-indigo-400" },
              ].map((s, i) => (
                <div key={i} className="glass-card p-3 text-center border border-white/10">
                  <div className={`flex items-center justify-center gap-1.5 font-black text-xl ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                    {s.value}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Per Trainee Table */}
            <div className="card p-5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2997ff]" /> Per-Trainee Attendance
              </h4>
              {attendanceSummary.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-white/10">
                        <th className="text-left pb-2 font-semibold">Trainee</th>
                        <th className="text-center pb-2 font-semibold">Sessions Attended</th>
                        <th className="text-center pb-2 font-semibold">Lessons Watched (≥80%)</th>
                        <th className="text-center pb-2 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {attendanceSummary.map((a) => (
                        <tr key={a.traineeId} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2 text-white font-medium">{a.traineeName}</td>
                          <td className="py-2 text-center text-emerald-400 font-bold">{a.sessionsAttended}</td>
                          <td className="py-2 text-center text-amber-400 font-bold">{a.lessonsWatched}</td>
                          <td className="py-2 text-center text-indigo-300 font-bold">{a.sessionsAttended + a.lessonsWatched}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No attendance records yet. Trainees must join live sessions or watch lessons to generate records.</p>
              )}
            </div>

            {/* Per Session Breakdown */}
            <div className="card p-5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-400" /> Per-Session Attendance
              </h4>
              {sessionBreakdown.length > 0 ? (
                <div className="space-y-2">
                  {sessionBreakdown.map(({ session, attendees }) => (
                    <div key={session.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white truncate max-w-[60%]">{session.title}</span>
                        <span className="text-xs font-bold text-emerald-400">{attendees.length} joined</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {attendees.map((a) => (
                          <span key={a.id} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300">
                            {a.traineeName}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">Session attendance data will appear here as trainees join live classes.</p>
              )}
            </div>
          </div>
        )}

        {/* COMPETENCY TAB */}
        {activeTab === "competency" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6 space-y-3">
              <h4 className="text-sm font-bold text-white">Departmental Competency Readiness</h4>
              <div className="space-y-3 pt-2 text-xs">
                {[
                  { dept: "Engineering & Cloud Architecture", pct: 92, status: "Optimal" },
                  { dept: "Data & Generative AI Systems", pct: 68, status: "Critical Shortage" },
                  { dept: "Cybersecurity Ops & Defense", pct: 88, status: "Compliant" },
                  { dept: "Executive Agile Leadership", pct: 81, status: "Moderate" }
                ].map((d, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-300 font-medium">{d.dept}</span>
                      <span className="text-white font-mono font-bold">{d.pct}% ({d.status})</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={"h-full rounded-full " + (d.pct >= 90 ? "bg-emerald-400" : d.pct >= 80 ? "bg-[#0071e3]" : "bg-amber-400")}
                        style={{ width: d.pct + "%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6 space-y-3">
              <h4 className="text-sm font-bold text-white">AI-Recommended Training Interventions</h4>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <strong className="text-amber-300 block mb-0.5">High Priority: Generative AI Upskilling</strong>
                  Schedule 2 additional cohorts with Raj Tiwari to close the 30% vector database readiness gap in Data Systems.
                </div>
                <div className="p-3 rounded-xl bg-[#0071e3]/10 border border-[#2997ff]/20">
                  <strong className="text-[#2997ff] block mb-0.5">Compliance Notice: ISO 27001 Re-certification</strong>
                  All 52 engineers enrolled in Zero-Trust Security have completed required proctored assessments.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
export default AdminReports;

