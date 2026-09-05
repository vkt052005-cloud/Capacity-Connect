import React, { useState } from "react";
import { Star, Send, MessageSquare, CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCoursesStore } from "../../store/coursesStore";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";

export const FeedbackPage: React.FC = () => {
  const { courses, addFeedback } = useCoursesStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();

  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || "c1");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const course = courses.find((c) => c.id === selectedCourseId);

    addFeedback({
      id: "fb-" + Date.now(),
      traineeId: currentUser?.id || "",
      traineeName: currentUser?.name || "Student",
      courseId: selectedCourseId,
      courseTitle: course?.title || "Course",
      rating,
      comment,
      createdAt: new Date().toISOString()
    });

    setSubmitted(true);
    addToast({
      title: "Course Feedback Submitted",
      message: "Thank you for helping us improve our learning materials.",
      type: "success"
    });
  };

  return (
    <DashboardLayout
      pageTitle="Course Quality & Feedback Review"
      breadcrumbs={[
        { label: "Trainee Dashboard", to: "/trainee/dashboard" },
        { label: "Course Feedback" }
      ]}
    >
      <div className="max-w-2xl space-y-6">
        <div className="glass-panel p-6 border border-white/15 shadow-2xl space-y-5">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-tight">Submit Feedback for Completed Module</h3>
            <p className="text-xs text-slate-400">Your ratings directly inform faculty competency mapping and curriculum revisions.</p>
          </div>

          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Feedback Successfully Recorded</h4>
              <p className="text-xs text-slate-400">Your response has been sent to the course trainer and admin review queue.</p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setComment("");
                }}
                className="apple-btn-secondary text-xs px-4 py-2 mt-2"
              >
                Submit Another Review
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Course</label>
                <select
                  className="apple-input text-xs"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title} ({c.trainerName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Overall Quality Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                    >
                      <Star className={"w-6 h-6 " + (star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-600")} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-white ml-2">{rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Detailed Review & Suggestions</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your experience regarding the video quality, slide clarity, and assessment difficulty..."
                  className="apple-input text-xs"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <button type="submit" className="apple-btn-primary text-xs px-6 py-2.5 font-bold">
                <Send className="w-3.5 h-3.5" /> Submit Review
              </button>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
