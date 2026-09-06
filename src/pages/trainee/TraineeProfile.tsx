import React, { useState } from "react";
import {
  User, Mail, Phone, Building2, Briefcase, Award,
  Save, Sparkles, CheckCircle2, Plus, Trash2
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { DigitalIdCard } from "../../components/common/DigitalIdCard";

import { useCoursesStore } from "../../store/coursesStore";
import { Link } from "react-router-dom";

export const TraineeProfile: React.FC = () => {
  const { currentUser, updateProfile } = useAuthStore();
  const { certificates } = useCoursesStore();
  const { addToast } = useAppStore();

  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.traineeProfile?.phone || "");
  const [department, setDepartment] = useState(currentUser?.traineeProfile?.department || "");
  const [designation, setDesignation] = useState(currentUser?.traineeProfile?.designation || "");
  const [bio, setBio] = useState(currentUser?.traineeProfile?.bio || "");
  const [skills, setSkills] = useState((currentUser?.traineeProfile?.skills || []).join(", "));
  const [qualifications, setQualifications] = useState((currentUser?.traineeProfile?.qualifications || []).join("\n"));
  const [experience, setExperience] = useState((currentUser?.traineeProfile?.experience || []).join("\n"));
  const [interests, setInterests] = useState((currentUser?.traineeProfile?.interests || []).join(", "));

  const myCertificates = certificates.filter((c) => c.traineeId === currentUser?.id);

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
        qualifications: qualifications.split("\n").map((q) => q.trim()).filter(Boolean),
        experience: experience.split("\n").map((e) => e.trim()).filter(Boolean),
        interests: interests.split(",").map((i) => i.trim()).filter(Boolean),
      }
    });

    addToast({
      title: "Profile Updated",
      message: "Professional qualifications, work experience, and competencies saved.",
      type: "success"
    });
  };

  return (
    <DashboardLayout
      pageTitle="Professional Trainee Profile & Digital ID"
      breadcrumbs={[
        { label: "Trainee Dashboard", to: "/trainee/dashboard" },
        { label: "Profile & Smart ID" }
      ]}
    >
      <div className="max-w-3xl space-y-6">
        {currentUser && (
          <DigitalIdCard
            user={{
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              role: "trainee",
              department: department || currentUser.traineeProfile?.department,
              designation: designation || currentUser.traineeProfile?.designation
            }}
          />
        )}

        <form onSubmit={handleSave} className="space-y-6">
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
          <h3 className="text-base font-bold text-white tracking-tight">Competencies, Experience & Interests</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Technical & Functional Skills (Comma-separated for Competency Matching)
            </label>
            <input
              type="text"
              className="apple-input text-xs"
              placeholder="e.g. React.js, Python, PostgreSQL, System Design, Data Structures"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Areas of Interest & Learning Goals (Comma-separated)
            </label>
            <input
              type="text"
              className="apple-input text-xs"
              placeholder="e.g. Cloud Infrastructure, Distributed Systems, AI Engineering, Cyber Security"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Work Experience & Employment History (One role per line)
            </label>
            <textarea
              rows={3}
              className="apple-input text-xs font-mono"
              placeholder="e.g. Graduate Engineering Trainee – Capacity Connect Portal (2024–Present)&#10;Software Development Intern – Technical Services Cell (2023–2024)"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Degrees & Educational Qualifications (One per line)
            </label>
            <textarea
              rows={3}
              className="apple-input text-xs font-mono"
              placeholder="e.g. B.Tech in Computer Science & Engineering – First Class Distinction (2022–2026)&#10;Higher Secondary Certificate – Science & Mathematics (94%)"
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
            />
          </div>

          <button type="submit" className="apple-btn-primary text-xs px-6 py-2.5 font-bold cursor-pointer">
            <Save className="w-4 h-4" /> Save Professional Profile
          </button>
        </div>
      </form>

      {/* ─── Verified Certificates & Credentials Gallery ─────────────────────────── */}
      <div className="glass-panel p-6 border border-white/15 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Verified Digital Certificates ({myCertificates.length})
            </h3>
          </div>
          <Link
            to="/trainee/certificates"
            className="text-xs font-semibold text-[#2997ff] hover:underline flex items-center gap-1"
          >
            Manage Certificates &rarr;
          </Link>
        </div>

        {myCertificates.length === 0 ? (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center space-y-1">
            <p className="text-xs text-slate-400">No certificates earned yet.</p>
            <p className="text-[11px] text-slate-500">
              Complete enrolled courses and achieve passing marks on subject-wise MCQ assessments to earn official verifiable credentials.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myCertificates.map((cert) => (
              <div
                key={cert.id}
                className="card p-3.5 space-y-2 border-white/10 hover:border-[#2997ff]/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="badge-green text-[9px]">OFFICIALLY CERTIFIED</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(cert.issuedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate">{cert.courseTitle}</h4>
                  <p className="text-[10px] text-slate-400">Instructor: {cert.trainerName}</p>
                </div>
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-white/5">
                  <span className="font-mono truncate max-w-[140px] text-slate-500">
                    ID: {cert.certificateHash?.substring(0, 14)}...
                  </span>
                  <Link
                    to="/trainee/certificates"
                    className="text-[#2997ff] hover:underline font-semibold"
                  >
                    View Credential
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </DashboardLayout>
);
};
