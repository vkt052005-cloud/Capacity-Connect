import React from "react";
import { BarChart3, Users, Award, TrendingUp, CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAssessmentsStore } from "../../store/assessmentsStore";
import { useCoursesStore } from "../../store/coursesStore";
import { useUsersStore } from "../../store/usersStore";
import { useAuthStore } from "../../store/authStore";

export const TrainerReports: React.FC = () => {
  const { attempts, assessments } = useAssessmentsStore();
  const { courses, enrollments, certificates } = useCoursesStore();
  const { users } = useUsersStore();
  const { currentUser } = useAuthStore();

  const trainerId = currentUser?.id || "";
  const trainerCourses = courses.filter((c) => c.trainerId === trainerId);
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

  return (
    <DashboardLayout
      pageTitle="Trainee Gradebook & Analytics"
      breadcrumbs={[
        { label: "Trainer Dashboard", to: "/trainer/dashboard" },
        { label: "Gradebook & Reports" }
      ]}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        </div>

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
