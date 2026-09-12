import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users, BookOpen, Award, Shield, Bell, BarChart3,
  TrendingUp, CheckCircle2, AlertTriangle, ArrowRight, Brain, Clock,
  RotateCw, Download
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useUsersStore } from "../../store/usersStore";
import { useCoursesStore } from "../../store/coursesStore";
import { useAssessmentsStore } from "../../store/assessmentsStore";
import { useAppStore } from "../../store/appStore";
import { useAuditStore } from "../../store/auditStore";

export const AdminDashboard: React.FC = () => {
  const { users, load: loadUsers, approveUser, rejectUser } = useUsersStore();
  const { courses, certificates, load: loadCourses } = useCoursesStore();
  const { attempts, load: loadAssessments } = useAssessmentsStore();
  const { logs: auditLogs, load: loadAuditLogs } = useAuditStore();
  const { addToast } = useAppStore();

  React.useEffect(() => {
    loadUsers();
    loadCourses();
    loadAssessments();
    loadAuditLogs();
  }, []);

  const pendingUsers = users.filter((u) => u.status === "pending");
  const activeMembersCount = users.filter((u) => u.status !== "removed").length;
  const removedUsersCount = users.filter((u) => u.status === "removed").length;

  // Calculate actual verified certificates issued in system
  const totalVerifiedCertificates = Math.max(
    certificates.length,
    users.reduce((acc, u) => acc + (u.traineeProfile?.certificates?.length || 0), 0)
  );

  // Dynamically calculate actual competency gaps from real trainee attempts
  const competencyGapsCount = attempts.filter((a) => !a.passed).length;

  const statCards = [
    {
      label: "Active Platform Members",
      value: activeMembersCount.toString(),
      icon: Users,
      color: "blue",
      change: `${users.filter(u => u.status === "active").length} Active • ${pendingUsers.length} Pending${removedUsersCount > 0 ? ` • ${removedUsersCount} Removed` : ""}`
    },
    {
      label: "Active Courses",
      value: courses.length.toString(),
      icon: BookOpen,
      color: "purple",
      change: `${courses.length} Specializations Active`
    },
    {
      label: "Verified Certificates",
      value: totalVerifiedCertificates.toString(),
      icon: Award,
      color: "green",
      change: totalVerifiedCertificates === 0 ? "0 Issued • Real-Time Ledger" : `${totalVerifiedCertificates} Verified Credentials`
    },
    {
      label: "Competency Gaps Identified",
      value: competencyGapsCount === 0 ? "0 Detected" : `${competencyGapsCount} Identified`,
      icon: Brain,
      color: competencyGapsCount === 0 ? "green" : "red",
      change: competencyGapsCount === 0 ? "Workforce Baseline Optimal" : `${competencyGapsCount} Assessment Re-evaluations Needed`
    }
  ];

  return (
    <DashboardLayout
      pageTitle="Executive Governance Dashboard"
      breadcrumbs={[{ label: "Home", to: "/" }, { label: "Admin Dashboard" }]}
    >
      <div className="space-y-6">
        {/* Executive Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <div key={i} className="glass-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{s.label}</span>
                <div className="w-8 h-8 rounded-xl bg-[#0071e3]/20 text-[#2997ff] flex items-center justify-center">
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-white tracking-tight">{s.value}</p>
              <p className="text-[10px] text-slate-400 font-mono">{s.change}</p>
            </div>
          ))}
        </div>

        {/* Pending Trainer & User Approvals */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Pending Faculty & Account Approvals</h3>
              <p className="text-xs text-slate-400">Review new instructor registrations before activating portal access</p>
            </div>
            <Link to="/admin/users" className="text-xs text-[#2997ff] hover:underline font-semibold">
              Manage Active Directory ({activeMembersCount}) →
            </Link>
          </div>

          <div className="space-y-3">
            {pendingUsers.length > 0 ? (
              pendingUsers.map((u) => (
                <div key={u.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{u.name}</h4>
                      <span className={"badge text-[9px] uppercase font-bold " + (u.role === "trainer" ? "badge-purple" : "badge-blue")}>
                        {u.role}
                      </span>
                      <span className="badge-yellow text-[9px] uppercase font-semibold">Pending Approval</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {u.email} {u.trainerProfile?.department ? `• Department: ${u.trainerProfile.department}` : u.traineeProfile?.department ? `• Department: ${u.traineeProfile.department}` : ""}
                    </p>
                    {u.trainerProfile?.experience && (
                      <p className="text-[9.5px] text-slate-400 mt-0.5">
                        Experience: {u.trainerProfile.experience}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        approveUser(u.id);
                        addToast({
                          title: u.role === "trainer" ? "Faculty Member Approved" : "User Account Approved",
                          message: `${u.name} has been activated and can now sign in.`,
                          type: "success"
                        });
                      }}
                      className="apple-btn-success text-xs px-3 py-1 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Approve {u.role === "trainer" ? "Trainer" : "User"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        rejectUser(u.id);
                        addToast({
                          title: "Registration Rejected",
                          message: `${u.name}'s application was rejected.`,
                          type: "error"
                        });
                      }}
                      className="apple-btn-danger text-xs px-3 py-1 font-medium cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">All pending trainer applications have been reviewed.</p>
            )}
          </div>
        </div>

        {/* Tamper-Evident Security Audit Logs */}
        <div className="card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Tamper-Evident Security & Authentication Logs</h3>
              <p className="text-xs text-slate-400">Continuous cryptographic trail of JWT sessions, QR logins, and proctored exam submissions</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadAuditLogs()}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition flex items-center gap-1.5 cursor-pointer border border-white/10"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Refresh Cloud</span>
              </button>
              {auditLogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const headers = "Timestamp,Actor,Role,Action,Target,Status,IP Address\n";
                    const rows = auditLogs.map(l => `"${l.timestamp}","${l.actor}","${l.role}","${l.action}","${l.target}","${l.status}","${l.ipAddress || ''}"`).join("\n");
                    const blob = new Blob([headers + rows], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `capacity-connect-audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
                    a.click();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-xs font-semibold text-white transition flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="table-header">
                <tr>
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Actor</th>
                  <th className="py-2 px-3">Action</th>
                  <th className="py-2 px-3">Target</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-3 text-center text-slate-500 font-sans">
                      <Shield className="w-6 h-6 mx-auto mb-2 text-slate-600 opacity-50" />
                      <p className="text-xs font-semibold text-slate-400">No security audit events recorded yet</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Real-time authentication sessions, approvals, and security events will automatically stream here as users access the platform.</p>
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                      <td className="py-2.5 px-3 text-white font-semibold">{log.actor}</td>
                      <td className="py-2.5 px-3 text-[#2997ff]">{log.action}</td>
                      <td className="py-2.5 px-3 text-slate-300">{log.target}</td>
                      <td className="py-2.5 px-3">
                        <span className={log.status === "FAILED" ? "badge-red text-[8px]" : log.status === "WARNING" ? "badge-amber text-[8px]" : "badge-green text-[8px]"}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default AdminDashboard;
