import React from "react";
import { BarChart3, Users, Award, TrendingUp, CheckCircle2, Star, MessageSquare } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAssessmentsStore } from "../../store/assessmentsStore";
import { useCoursesStore } from "../../store/coursesStore";
import { useUsersStore } from "../../store/usersStore";
import { useAuthStore } from "../../store/authStore";

export const TrainerReports: React.FC = () => {
  const { attempts, assessments } = useAssessmentsStore();
  const { courses, enrollments, certificates, feedbacks } = useCoursesStore();
  const { users } = useUsersStore();
  const { currentUser } = useAuthStore();

  const trainerId = currentUser?.id || "";
  const trainerCourses = courses.filter((c) => c.trainerId === trainerId || (currentUser?.name && c.trainerName === currentUser.name));
  const trainerCourseIds = new Set(trainerCourses.map((c) => c.id));

  // Real enrollments for this trainer's courses
  const trainerEnrollments = enrollments.filter((e) => trainerCourseIds.has(e.courseId));
  const uniqueTraineeIds = new Set(trainerEnrollments.map((e) => e.traineeId));

  // Real attempts on this trainer's course evaluations
  const trainerAssessments = assessments.filter(
    (a) => trainerCourseIds.has(a.courseId) || (currentUser?.name && a.createdBy === currentUser.name)
  );
  const trainerAssessmentIds = new Set(trainerAssessments.map((a) => a.id));
  const relevantAttempts = attempts.filter((att) => trainerAssessmentIds.has(att.assessmentId));

  const avgScore =
    relevantAttempts.length > 0
      ? (relevantAttempts.reduce((acc, a) => acc + a.percentage, 0) / relevantAttempts.length).toFixed(1)
      : "0.0";

  const issuedCerts = certificates.filter(
    (c) => trainerCourseIds.has(c.courseId) || (currentUser?.name && c.trainerName === currentUser.name)
  );

  // Student Quality Ratings & Feedback for this trainer's courses
  const relevantFeedbacks = feedbacks.filter(
    (f) =>
      trainerCourseIds.has(f.courseId) ||
      (f.trainerId && f.trainerId === trainerId) ||
      (currentUser?.name && f.trainerName === currentUser.name)
  );

  const avgStudentRating =
    relevantFeedbacks.length > 0
      ? (relevantFeedbacks.reduce((acc, f) => acc + f.rating, 0) / relevantFeedbacks.length).toFixed(1)
      : "5.0";

  return (
    <DashboardLayout
      pageTitle="Trainee Gradebook & Analytics"
      breadcrumbs={[
        { label: "Trainer Dashboard", to: "/trainer/dashboard" },
        { label: "Gradebook & Reports" }
      ]}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 space-y-1">
            <span className="text-xs text-slate-400">Total Enrolled Trainees</span>
            <p className="text-2xl font-bold text-white">{uniqueTraineeIds.size}</p>
          </div>
          <div className="card p-4 space-y-1">
            <span className="text-xs text-slate-400">Average Assessment Score</span>
            <p className="text-2xl font-bold text-emerald-400">{avgScore}%</p>
          </div>
          <div className="card p-4 space-y-1">
            <span className="text-xs text-slate-400">Certificates Issued</span>
            <p className="text-2xl font-bold text-[#2997ff]">{issuedCerts.length}</p>
          </div>
          <div className="card p-4 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Student Quality Rating</span>
            </span>
            <p className="text-2xl font-bold text-amber-300">
              {avgStudentRating} <span className="text-xs text-slate-400 font-normal">/ 5.0 ({relevantFeedbacks.length} reviews)</span>
            </p>
          </div>
        </div>

        {/* Student Quality Ratings & Feedback Roster */}
        <div className="card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Student Quality Ratings & Course Reviews ({relevantFeedbacks.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Authentic feedback and star ratings submitted directly by trainees enrolled in your courses.
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-semibold">
              Instructor Overall: {avgStudentRating} / 5.0
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="table-header">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Course</th>
                  <th className="py-2.5 px-3">Quality Rating</th>
                  <th className="py-2.5 px-3">Review & Suggestions</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {relevantFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400 italic">
                      No student ratings or reviews submitted yet for your courses.
                    </td>
                  </tr>
                ) : (
                  relevantFeedbacks.map((fb) => (
                    <tr key={fb.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3">
                        <p className="font-bold text-white">{fb.traineeName}</p>
                        <p className="text-[10px] text-slate-400">ID: {fb.traineeId}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-medium">
                        {fb.courseTitle || trainerCourses.find((c) => c.id === fb.courseId)?.title || fb.courseId}
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assessment Results & Verification Roster */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Assessment Results & Verification Roster</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="table-header">
                <tr>
                  <th className="py-2.5 px-3">Trainee</th>
                  <th className="py-2.5 px-3">Evaluation</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {relevantAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400 italic">
                      No trainee assessment submissions recorded yet for your courses.
                    </td>
                  </tr>
                ) : (
                  relevantAttempts.map((r) => {
                    const traineeUser = users.find((u) => u.id === r.traineeId);
                    return (
                      <tr key={r.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-3">
                          <p className="font-bold text-white">{traineeUser?.name || "Student"}</p>
                          <p className="text-[10px] text-slate-400">ID: {r.traineeId}</p>
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {trainerAssessments.find((a) => a.id === r.assessmentId)?.title || "Assessment"}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#2997ff]">{r.percentage}%</td>
                        <td className="py-3 px-3">
                          <span className={"badge text-[9px] " + (r.passed ? "badge-green" : "badge-red")}>
                            {r.passed ? "Passed" : "Retake Required"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{new Date(r.submittedAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default TrainerReports;
