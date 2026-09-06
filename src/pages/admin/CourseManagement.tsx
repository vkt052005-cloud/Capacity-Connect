import React from "react";
import { BookOpen, CheckCircle2, Shield, Trash2 } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCoursesStore } from "../../store/coursesStore";
import { formatCourseDuration } from "../../utils/courseDuration";

export const CourseManagement: React.FC = () => {
  const { courses, deleteCourse } = useCoursesStore();

  return (
    <DashboardLayout
      pageTitle="Course Quality & Moderation Queue"
      breadcrumbs={[
        { label: "Admin Dashboard", to: "/admin/dashboard" },
        { label: "Course Management" }
      ]}
    >
      <div className="card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Active Specializations & Modules ({courses.length})</h3>
        <div className="divide-y divide-white/5">
          {courses.map((c) => (
            <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{c.title}</h4>
                  <span className="badge-blue text-[9px]">{c.category}</span>
                </div>
                <p className="text-xs text-slate-400">Faculty: {c.trainerName} • Level: {c.level} • Duration: {formatCourseDuration(c)}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="badge-green text-[9px]">ACTIVE & PUBLISHED</span>
                <button
                  onClick={() => deleteCourse(c.id)}
                  className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg"
                  title="Archive Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
export default CourseManagement;
