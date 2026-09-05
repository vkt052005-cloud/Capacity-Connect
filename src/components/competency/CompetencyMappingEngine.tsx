import React, { useState } from "react";
import {
  Shield, Brain, Users, TrendingUp, Sparkles, Filter,
  CheckCircle2, AlertCircle, ArrowRight, BarChart3
} from "lucide-react";
import { SubjectCompetency } from "../../types";
import { initialCompetencyMatrix } from "../../data/seed";
import { useAppStore } from "../../store/appStore";

export const CompetencyMappingEngine: React.FC = () => {
  const [competencies, setCompetencies] = useState<SubjectCompetency[]>(initialCompetencyMatrix);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSubject, setSelectedSubject] = useState<SubjectCompetency | null>(initialCompetencyMatrix[0]);
  const { addToast } = useAppStore();

  const categories = ["All", "Technical", "AI & Data", "Leadership", "Compliance"];

  const filtered = selectedCategory === "All"
    ? competencies
    : competencies.filter((c) => c.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 border border-white/15 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#0c0f1d] via-[#101426] to-[#090b14]">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/20 border border-[#2997ff]/30 text-[#2997ff] text-[11px] font-semibold">
            <Brain className="w-3.5 h-3.5" />
            <span>Automated Skill-to-Trainer Matching & Gap Visualizer</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Organizational Competency Mapping Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Algorithmic alignment of enterprise workforce skill demands against certified trainer proficiencies, real-time feedback ratings, and capacity shortages.
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={"px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap cursor-pointer " + (selectedCategory === cat ? "bg-[#0071e3] text-white shadow-lg shadow-blue-500/30" : "bg-white/[0.05] text-slate-400 hover:text-white border border-white/10")}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Competency Cards & Gap Visualizer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {filtered.map((item) => {
              const isSelected = selectedSubject?.subject === item.subject;
              return (
                <div
                  key={item.subject}
                  onClick={() => setSelectedSubject(item)}
                  className={"card p-4 cursor-pointer transition-all " + (isSelected ? "border-[#2997ff] shadow-[0_0_25px_rgba(0,113,227,0.25)] bg-[#121626]" : "hover:border-white/20")}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white tracking-tight">{item.subject}</h4>
                        <span className="badge-blue text-[9px] py-0.5">{item.category}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Matched Faculty: {item.suitableTrainers.map((t) => t.name).join(", ")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={"badge text-[9px] " + (item.priority === "Critical" ? "badge-red" : item.priority === "High" ? "badge-yellow" : "badge-green")}>
                        {item.priority} Priority Gap
                      </span>
                    </div>
                  </div>

                  {/* Demand vs Capacity Meter */}
                  <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Org Workforce Demand</span>
                        <strong className="text-white font-mono">{item.organizationalDemandScore}%</strong>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                          style={{ width: item.organizationalDemandScore + "%" }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Internal Trainer Capacity</span>
                        <strong className="text-white font-mono">{item.internalCapacityScore}%</strong>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#0071e3] to-[#2997ff] rounded-full"
                          style={{ width: item.internalCapacityScore + "%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right col: Selected Subject Faculty Match Details */}
        {selectedSubject && (
          <div className="card p-5 space-y-4 h-fit">
            <div className="border-b border-white/10 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2997ff]">
                Recommended Match Recommendation
              </span>
              <h3 className="text-base font-bold text-white tracking-tight mt-1">
                {selectedSubject.subject}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Gap Delta: <span className="text-amber-400 font-bold">+{selectedSubject.gapScore}%</span> • Priority: <span className="text-white font-semibold">{selectedSubject.priority}</span>
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300">Top-Matched Certified Trainers</h4>
              {selectedSubject.suitableTrainers.map((trainer) => (
                <div key={trainer.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">{trainer.name}</h5>
                      <p className="text-[10px] text-slate-400">{trainer.experienceYears} Years Enterprise Exp • Rating: {trainer.rating}</p>
                    </div>
                    <span className="badge-green text-[10px] font-bold">{trainer.matchPercentage}% Match</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {trainer.competencies.map((c) => (
                      <span key={c} className="badge-gray text-[9px]">{c}</span>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      addToast({
                        title: "Trainer Assigned to Competency Gap",
                        message: "Automated schedule dispatch sent to " + trainer.name,
                        type: "success"
                      })
                    }
                    className="apple-btn-primary w-full py-2 text-xs font-semibold mt-2"
                  >
                    Assign & Schedule Training Cohort
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
