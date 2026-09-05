import React, { useState } from "react";
import { FolderOpen, Upload, FileText, Presentation, Video, CheckCircle2, Trash2 } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCoursesStore } from "../../store/coursesStore";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";

export const TrainerLibrary: React.FC = () => {
  const { courses, addResource } = useCoursesStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();

  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || "c6");
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceType, setResourceType] = useState<"presentation" | "pdf" | "video">("presentation");
  const [version, setVersion] = useState("v2.5");

  const course = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const resources = course?.resources || [];

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle.trim()) return;

    addResource({
      id: "res-" + Date.now(),
      courseId: selectedCourseId,
      title: resourceTitle,
      type: resourceType,
      url: "#" + resourceType,
      size: (Math.random() * 15 + 2).toFixed(1) + " MB",
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser?.name || "Faculty Trainer",
      version,
      summary: "Newly uploaded learning resource for " + (course?.title || "course")
    });

    setResourceTitle("");
    addToast({
      title: "Content Uploaded & Indexed",
      message: "Resource available for trainee slide engine & AI summarizer.",
      type: "success"
    });
  };

  return (
    <DashboardLayout
      pageTitle="Trainer Library & Content Repository"
      breadcrumbs={[
        { label: "Trainer Dashboard", to: "/trainer/dashboard" },
        { label: "Content Library" }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="card p-6 space-y-4 h-fit">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Upload className="w-4 h-4 text-[#2997ff]" />
            <h3 className="text-sm font-bold text-white">Upload New Learning Material</h3>
          </div>

          <form onSubmit={handleUpload} className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Course</label>
              <select
                className="apple-input text-xs"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Resource Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Master Slides & Architecture Blueprints"
                className="apple-input text-xs"
                value={resourceTitle}
                onChange={(e) => setResourceTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Format Type</label>
                <select
                  className="apple-input text-xs"
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value as any)}
                >
                  <option value="presentation">Slide Deck (.PPTX)</option>
                  <option value="pdf">Document Guide (.PDF)</option>
                  <option value="video">Recorded Lecture (.MP4)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Version Tag</label>
                <input
                  type="text"
                  className="apple-input text-xs"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="apple-btn-primary w-full py-2.5 text-xs font-bold mt-2">
              Upload & Process
            </button>
          </form>
        </div>

        {/* Existing Content Repository */}
        <div className="lg:col-span-2 card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">{course?.title}</h3>
              <p className="text-xs text-slate-400">Library Assets ({resources.length})</p>
            </div>
          </div>

          <div className="space-y-3">
            {resources.map((r) => (
              <div key={r.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0071e3]/20 text-[#2997ff] flex items-center justify-center">
                    {r.type === "presentation" ? <Presentation className="w-4 h-4" /> : r.type === "video" ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{r.title}</h4>
                    <p className="text-[10px] text-slate-400">
                      {r.type.toUpperCase()} • {r.size || "12.4 MB"} • Version {r.version || "v2.0"}
                    </p>
                  </div>
                </div>

                <span className="badge-green text-[9px]">INDEXED ACTIVE</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default TrainerLibrary;
