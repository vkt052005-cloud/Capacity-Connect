import React, { useState } from "react";
import { FolderOpen, Upload, FileText, Presentation, Video, CheckCircle2, Trash2, ShieldAlert, ShieldCheck, Lock, Download, BookOpen, Search, Eye, X } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { SlideDeckViewer } from "../../components/video/SlideDeckViewer";
import { useCoursesStore } from "../../store/coursesStore";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";

export const TrainerLibrary: React.FC = () => {
  const { courses, addResource, deleteResource } = useCoursesStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();

  const isTrainee = currentUser?.role === "trainee";
  const isVerifiedTrainer = Boolean(
    currentUser?.role === "admin" ||
    currentUser?.isVerifiedByAdmin ||
    currentUser?.trainerProfile?.isVerifiedByAdmin
  );

  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || "c6");
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceType, setResourceType] = useState<"presentation" | "pdf" | "video">("presentation");
  const [version, setVersion] = useState("v2.5");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewResource, setPreviewResource] = useState<any | null>(null);

  const course = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const allResources = course?.resources || [];
  const resources = searchQuery.trim()
    ? allResources.filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : allResources;

  const handleStudyOrDownload = (r: any) => {
    if (r.type === "presentation" && r.slides && r.slides.length > 0) {
      setPreviewResource(r);
      return;
    }

    addToast({
      title: "Downloading Material",
      message: `"${r.title}" (${r.type.toUpperCase()}) is opening. Ready for offline learning.`,
      type: "success"
    });
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle.trim()) return;

    if (resourceType === "video" && !isVerifiedTrainer) {
      addToast({
        title: "Video Upload Restricted",
        message: "Only teachers verified by an Administrator can upload and publish video lectures.",
        type: "error"
      });
      return;
    }

    // Default slides for newly created presentations so they are immediately interactive in SlideDeckViewer
    const defaultSlides = resourceType === "presentation" ? [
      {
        slideNumber: 1,
        title: `${resourceTitle} - Core Overview`,
        bullets: [
          `Key concepts and curriculum topics for ${course?.title || "this course"}`,
          "Architecture and modular implementation guidelines",
          "Best practices, security benchmarks, and development patterns",
          "Self-paced learning checkpoints and code exercises"
        ],
        keyConcept: "Mastering foundational patterns empowers engineers to build scalable and maintainable solutions."
      },
      {
        slideNumber: 2,
        title: "Technical Roadmap & Practical Applications",
        bullets: [
          "Hands-on implementation steps and tooling setup",
          "Verification standards and automated testing procedures",
          "Common pitfalls and performance optimization techniques",
          "Preparation notes for proctored modular certification assessments"
        ],
        keyConcept: "Consistent practice and review guarantee long-term retention and technical proficiency."
      }
    ] : undefined;

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
      summary: "Newly uploaded learning resource for " + (course?.title || "course"),
      slides: defaultSlides
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
      pageTitle={isTrainee ? "Learning Resource Library & Study Materials" : "Trainer Library & Content Repository"}
      breadcrumbs={
        isTrainee
          ? [
              { label: "Trainee Dashboard", to: "/trainee/dashboard" },
              { label: "Learning Library" }
            ]
          : [
              { label: "Trainer Dashboard", to: "/trainer/dashboard" },
              { label: "Content Library" }
            ]
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form - Only for Trainers & Admins */}
        {!isTrainee && (
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

              {resourceType === "video" && !isVerifiedTrainer && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    <strong>Video Upload Locked:</strong> Only teachers verified by an Administrator can publish video recordings. Go to <em>Manage Courses</em> to request verification.
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={resourceType === "video" && !isVerifiedTrainer}
                className="apple-btn-primary w-full py-2.5 text-xs font-bold mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {resourceType === "video" && !isVerifiedTrainer ? "Video Upload Locked (Unverified)" : "Upload & Process"}
              </button>
            </form>
          </div>
        )}

        {/* Existing Content Repository */}
        <div className={(isTrainee ? "lg:col-span-3" : "lg:col-span-2") + " card p-6 space-y-4"}>
          {/* Top Bar with Course Selector & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#2997ff]" />
                <h3 className="text-sm font-bold text-white">{course?.title}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Instructor: {course?.trainerName} • Verified Library Assets ({allResources.length})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                className="apple-input text-xs max-w-[220px]"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter materials..."
                  className="apple-input text-xs pl-7 pr-3 py-1.5 w-36 sm:w-44"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
              </div>
            </div>
          </div>

          {/* Resources List */}
          {resources.length === 0 ? (
            <div className="p-8 text-center space-y-2 rounded-xl bg-white/[0.02] border border-white/5">
              <FileText className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-300 font-medium">No learning materials found for this course.</p>
              <p className="text-[11px] text-slate-500">
                {isTrainee
                  ? "Your instructor will upload official presentation slides and PDF handbooks here."
                  : "Use the upload form to add slides, PDFs, or recorded lectures."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#2997ff]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0071e3]/20 text-[#2997ff] flex items-center justify-center shrink-0">
                      {r.type === "presentation" ? (
                        <Presentation className="w-5 h-5" />
                      ) : r.type === "video" ? (
                        <Video className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{r.title}</h4>
                        <span className="badge-blue text-[8px] py-0.5 uppercase">{r.type}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Size: {r.size || "12.4 MB"} • Version: {r.version || "v2.0"} • Faculty: {r.uploadedBy || course?.trainerName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="badge-green text-[9px]">OFFICIALLY INDEXED</span>
                    {r.type === "presentation" && r.slides && r.slides.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => handleStudyOrDownload(r)}
                        className="apple-btn-primary text-xs px-3 py-1.5 font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Interactive Slides ({r.slides.length})</span>
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleStudyOrDownload(r)}
                      className="apple-btn-secondary text-xs px-3 py-1.5 font-semibold flex items-center gap-1.5 cursor-pointer hover:text-[#2997ff]"
                    >
                      <Download className="w-3.5 h-3.5 text-[#2997ff]" />
                      <span>{isTrainee ? "Download / Study" : "View"}</span>
                    </button>
                    {!isTrainee && (
                      <button
                        type="button"
                        onClick={() => {
                          deleteResource(selectedCourseId, r.id);
                          addToast({
                            title: "Resource Removed",
                            message: `"${r.title}" has been deleted from this course library.`,
                            type: "info"
                          });
                        }}
                        className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 cursor-pointer transition"
                        title="Delete this learning material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Slide Deck Presentation Modal */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-4xl w-full glass-panel border border-white/20 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Presentation className="w-5 h-5 text-[#2997ff]" />
                <div>
                  <h3 className="text-sm font-bold text-white">{previewResource.title}</h3>
                  <p className="text-[11px] text-slate-400">
                    Interactive Slide Deck Viewer • {previewResource.version || "v2.0"} • {course?.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewResource(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5 cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <SlideDeckViewer
              slides={previewResource.slides || []}
              title={previewResource.title}
              version={previewResource.version}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
export default TrainerLibrary;
