import React, { useState } from "react";
import {
  User, Mail, Phone, Building2, Briefcase, Award,
  Save, Sparkles, CheckCircle2, Plus, Trash2
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";

export const TraineeProfile: React.FC = () => {
  const { currentUser, updateProfile } = useAuthStore();
  const { addToast } = useAppStore();

  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.traineeProfile?.phone || "");
  const [department, setDepartment] = useState(currentUser?.traineeProfile?.department || "");
  const [designation, setDesignation] = useState(currentUser?.traineeProfile?.designation || "");
  const [bio, setBio] = useState(currentUser?.traineeProfile?.bio || "");
  const [skills, setSkills] = useState((currentUser?.traineeProfile?.skills || []).join(", "));
  const [qualifications, setQualifications] = useState((currentUser?.traineeProfile?.qualifications || []).join("\n"));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      traineeProfile: {
        ...(currentUser?.traineeProfile as any),
        phone,
        department,
        designation,
        bio,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        qualifications: qualifications.split("\n").map((q) => q.trim()).filter(Boolean)
      }
    });

    addToast({
      title: "Profile Updated",
      message: "Professional qualifications and competencies saved.",
      type: "success"
    });
  };

  return (
    <DashboardLayout
      pageTitle="Professional Trainee Profile"
      breadcrumbs={[
        { label: "Trainee Dashboard", to: "/trainee/dashboard" },
        { label: "Profile Builder" }
      ]}
    >
      <form onSubmit={handleSave} className="max-w-3xl space-y-6">
        <div className="glass-panel p-6 border border-white/15 space-y-5">
          <h3 className="text-base font-bold text-white tracking-tight">Personal & Organizational Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Legal Name</label>
              <input
                type="text"
                required
                className="apple-input text-xs"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Email (Locked)</label>
              <input
                type="email"
                disabled
                className="apple-input text-xs opacity-60 cursor-not-allowed"
                value={currentUser?.email || ""}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department</label>
              <input
                type="text"
                className="apple-input text-xs"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Role / Designation</label>
              <input
                type="text"
                className="apple-input text-xs"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Professional Bio</label>
            <textarea
              rows={3}
              className="apple-input text-xs"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>

        <div className="glass-panel p-6 border border-white/15 space-y-5">
          <h3 className="text-base font-bold text-white tracking-tight">Skills & Academic Qualifications</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Skill Tags (Comma-separated for Competency Matching)</label>
            <input
              type="text"
              className="apple-input text-xs"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Degrees & Certifications (One per line)</label>
            <textarea
              rows={3}
              className="apple-input text-xs font-mono"
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
            />
          </div>

          <button type="submit" className="apple-btn-primary text-xs px-6 py-2.5 font-bold">
            <Save className="w-4 h-4" /> Save Professional Profile
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};
