import React, { useState, useRef } from "react";
import {
  FolderOpen,
  Upload,
  FileText,
  Presentation,
  Video,
  CheckCircle2,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Download,
  BookOpen,
  Search,
  Eye,
  X,
  FileUp,
  Paperclip,
  Check
} from "lucide-react";
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

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    name: string;
    size: string;
    dataUrl?: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const course = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const allResources = course?.resources || [];
  const resources = searchQuery.trim()
    ? allResources.filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : allResources;

  // Process selected file
  const processFile = (file: File) => {
    // Format size
    const sizeInMB = file.size / (1024 * 1024);
    const formattedSize = sizeInMB >= 1 ? `${sizeInMB.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;

    // Auto-detect format type
    const lowerName = file.name.toLowerCase();
    let detectedType: "presentation" | "pdf" | "video" = "pdf";
    if (lowerName.endsWith(".ppt") || lowerName.endsWith(".pptx")) {
      detectedType = "presentation";
    } else if (lowerName.endsWith(".mp4") || lowerName.endsWith(".mov") || lowerName.endsWith(".webm")) {
      detectedType = "video";
    } else if (lowerName.endsWith(".pdf")) {
      detectedType = "pdf";
    }

    setResourceType(detectedType);

    // Auto-suggest resource title if empty
    if (!resourceTitle.trim()) {
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, "") // strip extension
        .replace(/[-_]/g, " ") // replace dashes/underscores with spaces
        .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize words
      setResourceTitle(cleanTitle);
    }

    // Read file as Data URL for browser viewing/downloading if reasonably sized (< 50MB)
    if (file.size < 50 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedFile({
          file,
          name: file.name,
          size: formattedSize,
          dataUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile({
        file,
        name: file.name,
        size: formattedSize
      });
    }

    addToast({
      title: "File Attached",
      message: `"${file.name}" (${formattedSize}) is ready to upload.`,
      type: "info"
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleStudyOrDownload = (r: any) => {
    if (r.type === "presentation" && r.slides && r.slides.length > 0) {
      setPreviewResource(r);
      return;
    }

    // If there's an actual file data URL or blob, trigger real browser download
    if (r.fileData) {
      const a = document.createElement("a");
      a.href = r.fileData;
      a.download = r.fileName || `${r.title.replace(/\s+/g, "_")}.${r.type === "pdf" ? "pdf" : r.type === "presentation" ? "pptx" : "mp4"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      addToast({
        title: "Download Started",
        message: `Saved "${r.fileName || r.title}" to your downloads folder.`,
        type: "success"
      });
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
    if (!resourceTitle.trim()) {
      addToast({
        title: "Title Required",
        message: "Please provide a resource title or attach a study material file.",
        type: "error"
      });
      return;
    }

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

    const finalSize = selectedFile?.size || `${(Math.random() * 12 + 3).toFixed(1)} MB`;

    addResource({
      id: "res-" + Date.now(),
      courseId: selectedCourseId,
      title: resourceTitle.trim(),
      type: resourceType,
      url: selectedFile?.dataUrl || "#" + resourceType,
      size: finalSize,
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser?.name || "Faculty Trainer",
      version,
      summary: selectedFile
        ? `Uploaded study material file "${selectedFile.name}" for ${course?.title || "course"}.`
        : "Newly uploaded learning resource for " + (course?.title || "course"),
      slides: defaultSlides,
      fileName: selectedFile?.name,
      fileData: selectedFile?.dataUrl
    });

    setResourceTitle("");
    removeSelectedFile();

    addToast({
      title: "Content Uploaded & Published",
      message: "Study material is now accessible to trainees and faculty.",
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

              {/* Physical File Attachment Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Upload Study Material File (PDF, PPT, MP4, DOCX)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4,.zip,.txt"
                  className="hidden"
                />

                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-[#2997ff] bg-[#0071e3]/10"
                        : "border-white/15 bg-white/[0.02] hover:border-[#2997ff]/50 hover:bg-white/[0.04]"
                    }`}
                  >
                    <FileUp className="w-6 h-6 text-[#2997ff] mx-auto mb-1.5 animate-pulse" />
                    <p className="text-xs font-medium text-white">
                      Click to choose file or drag & drop here
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Supports PDF documents, PowerPoint slides (.pptx), lecture videos (.mp4), word docs (.docx)
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-[#2997ff]/40 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-[#0071e3]/20 text-[#2997ff] flex items-center justify-center shrink-0">
                        {resourceType === "presentation" ? (
                          <Presentation className="w-4 h-4" />
                        ) : resourceType === "video" ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-400">{selectedFile.size} • Attached</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer transition shrink-0"
                      title="Remove attached file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
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
                className="apple-btn-primary w-full py-2.5 text-xs font-bold mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {resourceType === "video" && !isVerifiedTrainer
                    ? "Video Upload Locked (Unverified)"
                    : selectedFile
                    ? `Upload "${selectedFile.name}"`
                    : "Upload & Process Material"}
                </span>
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
