import React from "react";
import { User, Award, BookOpen, Star, ShieldCheck, Mail, Phone } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuthStore } from "../../store/authStore";

export const TrainerProfile: React.FC = () => {
  const { currentUser } = useAuthStore();
  const profile = currentUser?.trainerProfile;

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "TR";

  const expertise = profile?.expertise?.filter(Boolean) || [];
  const credentials = profile?.verifiedCredentials?.filter(Boolean) || [];

  return (
    <DashboardLayout
      pageTitle="Faculty Expertise & Credentials Portfolio"
      breadcrumbs={[
        { label: "Trainer Dashboard", to: "/trainer/dashboard" },
        { label: "Trainer Portfolio" }
      ]}
    >
      <div className="max-w-3xl space-y-6">
        <div className="glass-panel p-6 border border-white/15 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#0071e3] to-[#2997ff] flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-blue-500/30">
              {initials}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{currentUser?.name || "Faculty Trainer"}</h3>
              <p className="text-xs text-[#2997ff]">{profile?.designation || "Trainer"}</p>
              <p className="text-xs text-slate-400 mt-0.5">{profile?.department || "Academic Faculty"}</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/10">
            {profile?.bio || "Certified Instructor dedicated to technical capacity building, curriculum development, and student mentorship."}
          </p>
        </div>

        <div className="glass-panel p-6 border border-white/15 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Domain Competencies & Specializations</h4>
          {expertise.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No domain specializations listed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {expertise.map((e) => (
                <span key={e} className="badge-blue text-xs py-1 px-3">{e}</span>
              ))}
            </div>
          )}

          <h4 className="text-xs font-bold text-white uppercase tracking-wider pt-3">Verified Academic & Industry Credentials</h4>
          {credentials.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No credentials submitted yet.</p>
          ) : (
            <div className="space-y-2">
              {credentials.map((c) => (
                <div key={c} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5 text-xs text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
export default TrainerProfile;
