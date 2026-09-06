import React from "react";
import { User, Award, BookOpen, Star, ShieldCheck, Mail, Phone } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuthStore } from "../../store/authStore";
import { DigitalIdCard } from "../../components/common/DigitalIdCard";

export const TrainerProfile: React.FC = () => {
  const { currentUser } = useAuthStore();
  const profile = currentUser?.trainerProfile;

  const isRajTiwari =
    currentUser?.email?.toLowerCase() === "tiwariraj052005@gmail.com" ||
    currentUser?.id === "u-trainer-official" ||
    currentUser?.id === "trainer-mto8vdlt-rpmv8" ||
    Boolean(currentUser?.name?.toLowerCase().includes("harry")) ||
    Boolean(currentUser?.name?.toLowerCase().includes("khan"));

  const displayName = isRajTiwari ? "Raj Tiwari" : (currentUser?.name || "Faculty Trainer");
  const displayDesignation = isRajTiwari
    ? (profile?.designation || "Senior Technical Educator & Mentor")
    : (profile?.designation || "Trainer");
  const displayDepartment = isRajTiwari
    ? (profile?.department || "Computer Science & Engineering")
    : (profile?.department || "Academic Faculty");
  const displayBio = isRajTiwari
    ? (profile?.bio && !profile.bio.toLowerCase().includes("harry") && !profile.bio.toLowerCase().includes("khan")
        ? profile.bio
        : "Senior Technical Educator & Mentor specializing in Computer Science, Full-Stack Architecture, and Systems Engineering.")
    : (profile?.bio || "Certified Instructor dedicated to technical capacity building, curriculum development, and student mentorship.");

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const rawExpertise = profile?.expertise?.filter(Boolean) || [];
  const expertise = rawExpertise.length > 0
    ? rawExpertise
    : (isRajTiwari ? ["Full-Stack Architecture", "Python", "JavaScript", "C Programming"] : []);

  const rawCreds = profile?.verifiedCredentials?.filter(Boolean) || [];
  const sanitizedCreds = rawCreds.filter(c => !c.toLowerCase().includes("harry") && !c.toLowerCase().includes("khan"));
  const credentials = sanitizedCreds.length > 0
    ? sanitizedCreds
    : (isRajTiwari ? ["Senior Educator", "Verified LMS Faculty"] : []);

  return (
    <DashboardLayout
      pageTitle="Faculty Expertise & Smart ID Portfolio"
      breadcrumbs={[
        { label: "Trainer Dashboard", to: "/trainer/dashboard" },
        { label: "Faculty Smart ID" }
      ]}
    >
      <div className="max-w-3xl space-y-6">
        {currentUser && (
          <DigitalIdCard
            user={{
              id: currentUser.id,
              name: displayName,
              email: currentUser.email,
              role: "trainer",
              department: displayDepartment,
              designation: displayDesignation
            }}
          />
        )}
        <div className="glass-panel p-6 border border-white/15 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#0071e3] to-[#2997ff] flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-blue-500/30">
              {initials}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{displayName}</h3>
              <p className="text-xs text-[#2997ff]">{displayDesignation}</p>
              <p className="text-xs text-slate-400 mt-0.5">{displayDepartment}</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/10">
            {displayBio}
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
