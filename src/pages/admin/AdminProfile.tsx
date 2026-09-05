import React, { useState } from "react";
import {
  Shield, User, Mail, Lock, Building, Phone,
  CheckCircle2, Save, Key, AlertCircle, Sparkles
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";

export const AdminProfile: React.FC = () => {
  const { currentUser, updateProfile } = useAuthStore();
  const { addToast } = useAppStore();

  const [name, setName] = useState(currentUser?.name || "Dr. Rajeshwar Sharma");
  const [email, setEmail] = useState(currentUser?.email || "vkt052005@gmail.com");
  const [password, setPassword] = useState(currentUser?.password || "SRNNv@2005");
  const [department, setDepartment] = useState("National Capacity Building Commission");
  const [designation, setDesignation] = useState("Chief Director & Portal Administrator");
  const [phone, setPhone] = useState("+91 98110 54321");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      password
    });
    setIsSaved(true);
    addToast({
      title: "Admin Data Updated",
      message: "Administrator credentials and profile details have been saved successfully.",
      type: "success"
    });
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <DashboardLayout
      pageTitle="Administrator Profile & Security Settings"
      breadcrumbs={[
        { label: "Admin Dashboard", to: "/admin/dashboard" },
        { label: "Admin Profile" }
      ]}
    >
      <div className="max-w-4xl space-y-6">
        {/* Header Profile Card */}
        <div className="glass-panel p-6 border border-white/15 relative overflow-hidden bg-gradient-to-r from-[#0c0f1c] via-[#12182c] to-[#0a0d16]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-[#2997ff] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-500/25">
                {name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="badge-purple text-[9px] uppercase font-bold">ROOT ADMINISTRATOR</span>
                  <span className="badge-green text-[9px]">ACTIVE STATUS</span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">{name}</h2>
                <p className="text-xs text-slate-400">{designation} • {email}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300 space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-mono">Access Privileges</p>
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#2997ff]" /> Full Governance & RBAC Root
              </p>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSave} className="glass-card p-6 space-y-5">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white tracking-tight">Edit Administrator Credentials</h3>
            <p className="text-xs text-slate-400">Update account identity, contact information, and access password</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#2997ff]" /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="apple-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#2997ff]" /> Official Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="apple-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#2997ff]" /> Password
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="apple-input font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#2997ff]" /> Contact Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="apple-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#2997ff]" /> Department / Agency
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="apple-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#2997ff]" /> Designation
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="apple-input"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              Changes are immediately synchronized to local storage and active authentication sessions.
            </p>
            <button
              type="submit"
              className="apple-btn-primary text-xs px-5 py-2 font-bold flex items-center gap-2"
            >
              {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaved ? "Saved Changes!" : "Save Admin Data"}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
export default AdminProfile;
