import React, { useState } from "react";
import { BookOpen, Plus, Edit, Trash2, CheckCircle2, Layers } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCoursesStore } from "../../store/coursesStore";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { CourseCategory } from "../../types";

export const TrainerCourses: React.FC = () => {
  const { courses, addCourse, deleteCourse } = useCoursesStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CourseCategory>("Technical");
  const [duration, setDuration] = useState("12 Hours • 4 Modules");
  const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");

  const trainerId = currentUser?.id || "";
  const myCourses = courses.filter((c) => c.trainerId === trainerId);

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addCourse({
      id: "c-" + Date.now(),
      title,
      description,
      category,
      duration,
      level,
      status: "active",
      trainerId,
      trainerName: currentUser?.name || "Faculty Trainer",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
      tags: [category, level, "Capacity Building"],
      resources: []
    });

    setShowAddModal(false);
    setTitle("");
    setDescription("");
    addToast({
      title: "Course Created Successfully",
      message: "New curriculum published to catalog.",
      type: "success"
    });
  };

  return (
    <DashboardLayout
      pageTitle="Course Curriculum Management"
      breadcrumbs={[
        { label: "Trainer Dashboard", to: "/trainer/dashboard" },
        { label: "Manage Courses" }
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Your Authored Courses</h3>
            <p className="text-xs text-slate-400">Design syllabus, upload slide decks, and attach video recordings</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="apple-btn-primary text-xs px-4 py-2 font-bold"
          >
            <Plus className="w-4 h-4" /> Create New Course
          </button>
        </div>

        {myCourses.length === 0 ? (
          <div className="card p-12 text-center space-y-3 border-dashed border-white/20">
            <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Courses Created Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You have not published any courses yet. Click "Create New Course" above to author your first curriculum.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((c) => (
              <div key={c.id} className="glass-card p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="badge-blue text-[9px]">{c.category}</span>
                    <span className="badge-gray text-[9px]">{c.level}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{c.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-3">{c.description}</p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">{c.duration}</span>
                  <button
                    onClick={() => deleteCourse(c.id)}
                    className="text-rose-400 hover:text-rose-300 transition p-1 cursor-pointer"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fadeIn">
          <div className="glass-panel p-6 max-w-md w-full border border-white/20 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus in Cloud Infrastructure"
                  className="apple-input text-xs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Overview of learning outcomes..."
                  className="apple-input text-xs"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    className="apple-input text-xs"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                  >
                    <option value="Technical">Technical</option>
                    <option value="AI & Data">AI & Data</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Compliance">Compliance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Level</label>
                  <select
                    className="apple-input text-xs"
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="apple-btn-primary flex-1 text-xs py-2 font-bold">
                  Publish Course
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="apple-btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
export default TrainerCourses;
