import React from "react";
import { BarChart3, Download, Sparkles, Brain, TrendingUp, Shield } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAppStore } from "../../store/appStore";

export const AdminReports: React.FC = () => {
  const { addToast } = useAppStore();

  const handleExportCSV = () => {
    addToast({
      title: "Exporting Scheduled Digest",
      message: "Departmental competency CSV digest generated for HR administrators.",
      type: "success"
    });
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
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">Enterprise Skill Gap Report</h2>
            <p className="text-xs text-slate-400">Quarterly talent readiness, assessment distributions, and automated attendance sync summaries</p>
          </div>

          <button
            onClick={handleExportCSV}
            className="apple-btn-primary text-xs px-4 py-2 font-bold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV / PDF Digest
          </button>
        </div>

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
                Schedule 2 additional cohorts with Dr. Marcus Vance to close the 30% vector database readiness gap in Data Systems.
              </div>
              <div className="p-3 rounded-xl bg-[#0071e3]/10 border border-[#2997ff]/20">
                <strong className="text-[#2997ff] block mb-0.5">Compliance Notice: ISO 27001 Re-certification</strong>
                All 52 engineers enrolled in Zero-Trust Security have completed required proctored assessments.
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default AdminReports;
