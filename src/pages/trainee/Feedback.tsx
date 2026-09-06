import React, { useState, useEffect, useMemo } from "react";
import { Star, Send, MessageSquare, CheckCircle2, Award, BookOpen, Clock, ShieldCheck, Trash2, AlertCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCoursesStore } from "../../store/coursesStore";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";

export const FeedbackPage: React.FC = () => {
  const { courses, enrollments, addFeedback, deleteFeedback, feedbacks } = useCoursesStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();
  const [searchParams] = useSearchParams();

  const traineeId = currentUser?.id || "";

  // Set of courses this student is actively enrolled in
  const enrolledCourseIds = useMemo(
    () => new Set(enrollments.filter((e) => e.traineeId === traineeId).map((e) => e.courseId)),
    [enrollments, traineeId]
  );

  // Filter courses: ONLY courses the student is enrolled in can be rated
  const enrolledCourses = useMemo(
    () => courses.filter((c) => enrolledCourseIds.has(c.id)),
    [courses, enrolledCourseIds]
  );

  const urlCourseId = searchParams.get("courseId");
  const isUrlCourseEnrolled = urlCourseId ? enrolledCourseIds.has(urlCourseId) : false;

  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    if (urlCourseId && enrolledCourseIds.has(urlCourseId)) return urlCourseId;
    return enrolledCourses[0]?.id || "";
  });

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Feedbacks given by this student
  const myFeedbacks = feedbacks.filter(
    (f) => f.traineeId === traineeId || (currentUser?.name && f.traineeName === currentUser.name)
  );

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || enrolledCourses[0];
  const existingFeedback = myFeedbacks.find((f) => f.courseId === selectedCourseId);

  // Align selected course when URL or enrolled courses change
  useEffect(() => {
    if (urlCourseId && enrolledCourseIds.has(urlCourseId)) {
      setSelectedCourseId(urlCourseId);
    } else if (enrolledCourses.length > 0 && !enrolledCourseIds.has(selectedCourseId)) {
      setSelectedCourseId(enrolledCourses[0].id);
    }
  }, [urlCourseId, enrolledCourses, enrolledCourseIds, selectedCourseId]);

  // Prepopulate existing review if already reviewed
  useEffect(() => {
    if (existingFeedback) {
      setRating(existingFeedback.rating);
      setComment(existingFeedback.comment);
    } else {
      setRating(5);
      setComment("");
    }
  }, [selectedCourseId, existingFeedback?.id]);

  const starLabels: Record<number, string> = {
    1: "1 / 5 — Needs Significant Improvement",
    2: "2 / 5 — Fair Quality",
    3: "3 / 5 — Good / Satisfactory",
    4: "4 / 5 — Very Good Quality",
    5: "5 / 5 — Excellent / Highly Recommended"
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    if (!enrolledCourseIds.has(selectedCourseId)) {
      addToast({
        title: "Enrollment Required",
        message: "You can only rate and review courses you are actively enrolled in.",
        type: "error"
      });
      return;
    }

    addFeedback({
      id: existingFeedback ? existingFeedback.id : "fb-" + Date.now(),
      traineeId: currentUser?.id || "u-trainee-1",
      traineeName: currentUser?.name || "Madhav Kumar",
      courseId: selectedCourseId,
      courseTitle: selectedCourse?.title || "Course",
      trainerId: selectedCourse?.trainerId,
      trainerName: selectedCourse?.trainerName,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    });

    setSubmitted(true);
    addToast({
      title: existingFeedback ? "Rating Updated" : "Course Rating Submitted",
      message: `Your rating (${rating}/5 stars) has been published for ${selectedCourse?.title}.`,
      type: "success"
    });
  };

  return (
    <DashboardLayout
      pageTitle="Course Quality Rating & Feedback"
      breadcrumbs={[
        { label: "Trainee Dashboard", to: "/trainee/dashboard" },
        { label: "Course Feedback" }
      ]}
    >
      <div className="max-w-3xl space-y-8">
        {/* Warning if user arrived via link for a course they are not enrolled in */}
        {urlCourseId && !isUrlCourseEnrolled && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                You cannot rate <strong>{courses.find((c) => c.id === urlCourseId)?.title || "this course"}</strong> because you are not enrolled in it. You can only rate courses you are actively enrolled in.
              </span>
            </div>
            <Link
              to={`/trainee/course/${urlCourseId}`}
              className="apple-btn-secondary text-xs px-3 py-1.5 shrink-0 font-semibold text-white inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" /> View & Enroll
            </Link>
          </div>
        )}

        {/* Rating Form Card or Enrollment Required Notice */}
        {enrolledCourses.length === 0 ? (
          <div className="glass-panel p-8 sm:p-12 border border-white/15 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#0071e3]/15 border border-[#2997ff]/35 text-[#2997ff] flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Enrollment Required to Rate Courses
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                To guarantee rating authenticity, trainees can only rate and review courses they are actively enrolled in. Browse the Course Catalog to enroll and start learning.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/trainee/courses"
                className="apple-btn-primary text-xs px-5 py-2.5 font-bold inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Browse Course Catalog
              </Link>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-6 sm:p-7 border border-white/15 shadow-2xl space-y-6">
            <div className="space-y-1 border-b border-white/10 pb-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {existingFeedback ? "Update Course Quality Rating" : "Submit Quality Rating & Course Feedback"}
                </h3>
                <span className="badge-blue text-[9px] font-semibold">
                  {enrolledCourses.length} Enrolled {enrolledCourses.length === 1 ? "Course" : "Courses"}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You can rate and evaluate courses you are currently enrolled in. Your authentic review directly influences the course score and helps fellow trainees.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-8 space-y-4 animate-fadeIn">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Quality Rating Successfully Recorded</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you! Your {rating}-star rating has been registered on <strong>{selectedCourse?.title}</strong> and is now visible on the teacher's dashboard and the administration portal.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setComment("");
                    }}
                    className="apple-btn-secondary text-xs px-4 py-2 cursor-pointer"
                  >
                    Rate Another Course
                  </button>
                  <Link
                    to={`/trainee/course/${selectedCourseId}`}
                    className="apple-btn-primary text-xs px-4 py-2 font-bold"
                  >
                    Return to Course
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Select Enrolled Course to Rate</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">✓ Verified Enrolled Only</span>
                  </label>
                  <select
                    className="apple-input text-xs"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                  >
                    {enrolledCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        ✓ {c.title} — Instructor: {c.trainerName}
                      </option>
                    ))}
                  </select>
                  {selectedCourse && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Faculty: <strong className="text-slate-200">{selectedCourse.trainerName}</strong> • Current Rating: <strong className="text-amber-400">{selectedCourse.totalRatings && selectedCourse.totalRatings > 0 ? `⭐ ${selectedCourse.rating?.toFixed(1)} (${selectedCourse.totalRatings} ratings)` : "Not rated yet"}</strong>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Overall Quality Rating
                  </label>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-slate-500 hover:text-amber-400 transition cursor-pointer transform hover:scale-110"
                          title={`${star} Star`}
                        >
                          <Star className={"w-7 h-7 " + (star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-600")} />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs font-bold text-amber-300 font-mono">
                      {starLabels[rating]}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Detailed Review & Constructive Suggestions
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your learning experience regarding lecture depth, slide clarity, code examples, and teacher responsiveness..."
                    className="apple-input text-xs leading-relaxed"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Sent directly to teacher & administration
                  </span>
                  <button
                    type="submit"
                    className="apple-btn-primary text-xs px-6 py-2.5 font-bold shadow-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> {existingFeedback ? "Update Review" : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* My Submitted Reviews */}
        <div className="glass-panel p-6 border border-white/15 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#2997ff]" />
              <span>My Submitted Ratings & Reviews ({myFeedbacks.length})</span>
            </h4>
            <span className="text-[11px] text-slate-400">Authenticated as {currentUser?.name}</span>
          </div>

          {myFeedbacks.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              You haven't submitted any course quality ratings yet. Select a course above to share your evaluation.
            </p>
          ) : (
            <div className="space-y-3">
              {myFeedbacks.map((fb) => (
                <div key={fb.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <p className="font-bold text-white">{fb.courseTitle}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold font-mono flex items-center gap-1">
                        {"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)} ({fb.rating}/5)
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => {
                          deleteFeedback(fb.id);
                          addToast({
                            title: "Review Removed",
                            message: "Your review has been deleted.",
                            type: "info"
                          });
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{fb.comment}"
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Instructor: {fb.trainerName || "Faculty Instructor"} • Status: Visible to Faculty & Admin
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
export default FeedbackPage;
