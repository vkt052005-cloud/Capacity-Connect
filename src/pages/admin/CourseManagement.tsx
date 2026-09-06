import React, { useState } from "react";
import { BookOpen, CheckCircle2, Shield, Trash2, Star, MessageSquare, Filter } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCoursesStore } from "../../store/coursesStore";
import { formatCourseDuration } from "../../utils/courseDuration";

export const CourseManagement: React.FC = () => {
  const { courses, deleteCourse, feedbacks, deleteFeedback } = useCoursesStore();
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all");

  const filteredFeedbacks =
    selectedCourseFilter === "all"
      ? feedbacks
      : feedbacks.filter((f) => f.courseId === selectedCourseFilter);

  const avgPlatformRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
      : "5.0";

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
                      onClick={() => deleteCourse(c.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg cursor-pointer transition"
                      title="Archive Course"
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
    </DashboardLayout>
  );
};
export default CourseManagement;
