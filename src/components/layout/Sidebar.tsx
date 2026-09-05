import React from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  BookOpen, Award, Shield, Users, Video, BarChart3,
  CheckCircle2, Bell, Brain, Library, FileText, UserCheck,
  FolderLock
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export const Sidebar: React.FC = () => {
  const { currentUser } = useAuthStore();
  const location = useLocation();

  if (!currentUser) return null;

  const traineeLinks = [
    { to: "/trainee/dashboard", label: "Dashboard", icon: BookOpen },
    { to: "/trainee/live-classes", label: "Live Meet Classes", icon: Video },
    { to: "/trainee/courses", label: "Course Catalog", icon: Library },
    { to: "/trainee/assessments", label: "MCQ Assessments", icon: Shield },
    { to: "/trainee/certificates", label: "My Certificates", icon: Award },
    { to: "/trainee/feedback", label: "Course Feedback", icon: FileText },
    { to: "/trainee/profile", label: "Professional Profile", icon: UserCheck }
  ];

  const trainerLinks = [
    { to: "/trainer/dashboard", label: "Trainer Console", icon: Users },
    { to: "/trainer/live-classes", label: "Live Meet Classes", icon: Video },
    { to: "/trainer/courses", label: "Manage Courses", icon: BookOpen },
    { to: "/trainer/library", label: "Trainer Library", icon: Library },
    { to: "/trainer/questionnaires", label: "Create Assessments", icon: FileText },
    { to: "/trainer/reports", label: "Trainee Gradebook", icon: BarChart3 },
    { to: "/trainer/profile", label: "Trainer Portfolio", icon: UserCheck }
  ];

  const adminLinks = [
    { to: "/admin/dashboard", label: "Executive Dashboard", icon: BarChart3 },
    { to: "/admin/users", label: "User Governance", icon: Users },
    { to: "/admin/courses", label: "Course Verification", icon: BookOpen },
    { to: "/admin/competency", label: "Competency Mapping", icon: Brain },
    { to: "/admin/notifications", label: "Announcements", icon: Bell },
    { to: "/admin/reports", label: "Organization Reports", icon: FolderLock },
    { to: "/admin/profile", label: "Admin Profile & Settings", icon: UserCheck }
  ];

  const isTraineeSection = location.pathname.startsWith("/trainee");
  const isTrainerSection = location.pathname.startsWith("/trainer");

  const links = isTraineeSection
    ? traineeLinks
    : isTrainerSection
    ? trainerLinks
    : currentUser.role === "trainee"
    ? traineeLinks
    : currentUser.role === "trainer"
    ? trainerLinks
    : adminLinks;

  const sectionName = isTraineeSection
    ? "Trainee Learning Suite"
    : isTrainerSection
    ? "Trainer Management Console"
    : "Executive Administration";

  return (
    <aside className="w-64 border-r border-white/10 p-4 space-y-6 hidden lg:block bg-black/40 backdrop-blur-xl shrink-0">
      {currentUser.role === "admin" && (isTraineeSection || isTrainerSection) && (
        <div className="p-2.5 rounded-xl bg-[#0071e3]/15 border border-[#2997ff]/35 text-white text-xs space-y-1.5 animate-fadeIn">
          <div className="font-bold flex items-center gap-1.5 text-[#2997ff]">
            <span>🛡️ Administrator Oversight</span>
          </div>
          <p className="text-[10.5px] text-slate-300 leading-snug">
            Inspecting {sectionName} with global admin rights.
          </p>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2997ff] hover:underline pt-0.5"
          >
            ← Return to Admin Dashboard
          </Link>
        </div>
      )}

      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3">{sectionName}</p>
        <div className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition " +
                (isActive
                  ? "bg-[#0071e3] text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]")
              }
            >
              <link.icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
