import React, { useState } from "react";
import { BookOpen, CheckCircle2, Shield, Trash2, Star, MessageSquare, Filter, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCoursesStore } from "../../store/coursesStore";
import { useAppStore } from "../../store/appStore";
import { formatCourseDuration } from "../../utils/courseDuration";

export const CourseManagement: React.FC = () => {
  const { courses, deleteCourse, feedbacks, deleteFeedback, enrollments } = useCoursesStore();
  const { addToast } = useAppStore();
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all");

  // Permanent course deletion state
  const [courseToDelete, setCourseToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredFeedbacks =
    selectedCourseFilter === "all"
      ? feedbacks
      : feedbacks.filter((f) => f.courseId === selectedCourseFilter);

  const avgPlatformRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
      : "5.0";

  const handleConfirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      deleteCourse(courseToDelete.id);
      addToast({
        title: "Course Permanently Deleted",
        message: `"${courseToDelete.title}" and all associated videos, student records, and enrollments have been permanently removed.`,
        type: "success"
      });
      setCourseToDelete(null);
    } catch (e) {
      addToast({
        title: "Deletion Failed",
        message: "Unable to delete course. Please try again.",
        type: "error"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout
      pageTitle="Course Quality & Moderation Queue"
      breadcrumbs={[
        { label: "Admin Dashboard", to: "/admin/dashboard" },
        { label: "Course Management" }
      ]}
    >
      <div className="space-y-6">
        {/* Quality Rating Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-4 space-y-1">
            <span className="text-xs text-slate-400">Total Courses Published</span>
            <p className="text-2xl font-bold text-white">{courses.length}</p>
          </div>
          <div className="card p-4 space-y-1">
            <span className="text-xs text-slate-400">Total Student Ratings & Reviews</span>
            <p className="text-2xl font-bold text-[#2997ff]">{feedbacks.length}</p>
          </div>
          <div className="card p-4 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Platform Average Quality Score</span>
            </span>
            <p className="text-2xl font-bold text-amber-300">
              {avgPlatformRating} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
            </p>
          </div>
        </div>

        {/* Courses List */}
        <div className="card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Active Specializations & Modules ({courses.length})</h3>
              <p className="text-xs text-slate-400">Course catalogs with dynamic student quality ratings</p>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {courses.map((c) => {
              const courseFbs = feedbacks.filter((f) => f.courseId === c.id);
              const hasRatings = courseFbs.length > 0 || (c.totalRatings && c.totalRatings > 0);
              const courseAvg =
                courseFbs.length > 0
                  ? (courseFbs.reduce((acc, f) => acc + f.rating, 0) / courseFbs.length).toFixed(1)
                  : (c.totalRatings && c.totalRatings > 0 && c.rating)
                  ? c.rating.toFixed(1)
                  : null;

              return (
                <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{c.title}</h4>
                      <span className="badge-blue text-[9px]">{c.category}</span>
                      {hasRatings ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{courseAvg}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({courseFbs.length} reviews)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400 text-[10px]">
                          <Star className="w-3 h-3 text-slate-500" />
                          <span>No ratings yet</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">Faculty: {c.trainerName} • Level: {c.level} • Duration: {formatCourseDuration(c)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="badge-green text-[9px]">ACTIVE & PUBLISHED</span>
                    <button
                      onClick={() => setCourseToDelete(c)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg cursor-pointer transition"
                      title="Permanently Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Student Quality Ratings & Feedback Governance Audit Table */}
        <div className="card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Student Quality Ratings & Feedback Governance Audit ({filteredFeedbacks.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Full transparency log of all student reviews and quality scores across instructors and courses.
              </p>
            </div>

            {/* Course Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                className="apple-input text-xs py-1 px-2.5 max-w-xs"
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
              >
                <option value="all">All Courses ({feedbacks.length} reviews)</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="table-header">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Course</th>
                  <th className="py-2.5 px-3">Faculty / Trainer</th>
                  <th className="py-2.5 px-3">Rating</th>
                  <th className="py-2.5 px-3">Student Feedback & Suggestions</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-slate-400 italic">
                      No student ratings found matching this filter.
                    </td>
                  </tr>
                ) : (
                  filteredFeedbacks.map((fb) => (
                    <tr key={fb.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3">
                        <p className="font-bold text-white">{fb.traineeName}</p>
                        <p className="text-[10px] text-slate-400">ID: {fb.traineeId}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-medium">
                        {fb.courseTitle || courses.find((c) => c.id === fb.courseId)?.title || fb.courseId}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {fb.trainerName || courses.find((c) => c.id === fb.courseId)?.trainerName || "Faculty Instructor"}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= fb.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-white text-[11px]">{fb.rating}.0</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-300 max-w-md">
                        <p className="line-clamp-3 leading-relaxed">{fb.comment}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => deleteFeedback(fb.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                          title="Delete / Moderate Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Permanent Course Deletion Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-2xl animate-fadeIn overflow-y-auto">
          <div className="glass-panel p-6 sm:p-7 max-w-lg w-full border border-rose-500/30 shadow-2xl space-y-5 my-auto">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Permanently Delete Course?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This action cannot be undone. The course will be permanently removed from all student enrollments, faculty profiles, and cloud databases.
                </p>
              </div>
            </div>

            {/* Course Details Card */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate max-w-[280px]">
                  {courseToDelete.title}
                </span>
                <span className="badge-blue text-[9px]">{courseToDelete.category}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px] text-slate-400">
                <div>
                  <span className="block text-[10px] text-slate-500">Instructor</span>
                  <span className="font-semibold text-white truncate block">{courseToDelete.trainerName}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500">Active Students</span>
                  <span className="font-semibold text-white">
                    {enrollments.filter((e) => e.courseId === courseToDelete.id).length}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500">Reviews & Ratings</span>
                  <span className="font-semibold text-white">
                    {feedbacks.filter((f) => f.courseId === courseToDelete.id).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning Checklist */}
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200/90 space-y-1.5">
              <p className="font-semibold text-rose-300">The following will be permanently erased:</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-rose-300/80">
                <li>Course materials, video lessons, and transcripts</li>
                <li>All active student enrollments and completed certificates</li>
                <li>All student reviews, feedback, and quality ratings</li>
                <li>All associated quizzes, questionnaires, and student grade records</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                disabled={isDeleting}
                className="apple-btn-secondary text-xs px-4 py-2 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCourse}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? "Deleting Permanently..." : "Permanently Delete Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
export default CourseManagement;
