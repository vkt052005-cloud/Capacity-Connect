import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock, CheckCircle2, ShieldAlert, Award, AlertTriangle,
  ChevronLeft, ChevronRight, Bookmark, RotateCcw, CheckSquare
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { ProctoringGuard } from "../../components/assessment/ProctoringGuard";
import { CertificateModal } from "../../components/assessment/CertificateModal";
import { useAssessmentsStore } from "../../store/assessmentsStore";
import { useCoursesStore } from "../../store/coursesStore";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { Certificate } from "../../types";
import { sanitizeAssessmentForTrainee, verifyAnswerHash } from "../../utils/quizSecurity";

export const TakeAssessment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { assessments, submitAttempt } = useAssessmentsStore();
  const { completeCourse } = useCoursesStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();
  const navigate = useNavigate();

  const rawAssessment = assessments.find((a) => a.id === id);
  // Obfuscate & strip answer keys so DevTools and state cannot leak correctIndex
  const assessment = useMemo(
    () => (rawAssessment ? sanitizeAssessmentForTrainee(rawAssessment) : undefined),
    [rawAssessment]
  );
  const questions = assessment?.questions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(assessment?.durationMinutes ? assessment.durationMinutes * 60 : 900);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [issuedCert, setIssuedCert] = useState<Certificate | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [proctorLogs, setProctorLogs] = useState<string[]>([]);
  const [tabViolations, setTabViolations] = useState(0);

  // Synchronize timer when assessment loads
  useEffect(() => {
    if (assessment?.durationMinutes) {
      setTimeLeft(assessment.durationMinutes * 60);
    }
  }, [assessment?.durationMinutes]);

  // Timer countdown
  useEffect(() => {
    if (submitted || !assessment) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted]);

  const handleSelectOption = (optIndex: number) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: optIndex });
  };

  const toggleReview = () => {
    setMarkedForReview({ ...markedForReview, [currentIndex]: !markedForReview[currentIndex] });
  };

  const handleProctorViolation = (count: number, log: string) => {
    setTabViolations(count);
    setProctorLogs((prev) => [...prev, log]);
    if (count >= 3) {
      addToast({
        title: "Maximum Proctor Violations Reached",
        message: "Your assessment has been automatically submitted.",
        type: "error"
      });
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (submitted || !assessment) return;
    setSubmitted(true);

    let earnedScore = 0;
    let totalScore = 0;
    const answerArr: number[] = [];

    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      answerArr.push(selected !== undefined ? selected : -1);
      totalScore += q.points;
      if (verifyAnswerHash(q.id, selected, q.answerHash, q.correctIndex)) {
        earnedScore += q.points;
      }
    });

    const pct = totalScore > 0 ? Math.round((earnedScore / totalScore) * 100) : 0;
    const passed = pct >= assessment.passingScore;

    const traineeId = currentUser?.id || "u-trainee-1";
    const traineeName = currentUser?.name || "Vikash Tiwari";

    submitAttempt({
      assessmentId: assessment.id,
      traineeId,
      answers: answerArr,
      score: earnedScore,
      totalPoints: totalScore,
      percentage: pct,
      passed,
      submittedAt: new Date().toISOString(),
      timeTakenSeconds: (assessment.durationMinutes * 60) - timeLeft,
      tabSwitchCount: tabViolations,
      proctorLogs
    });

    if (passed) {
      const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
      const certHash = `CC-CERT-${randomSuffix}`;
      const gradeText = pct >= 90 ? `Distinction (${pct}%)` : `Passed (${pct}%)`;
      const origin = typeof window !== "undefined" ? window.location.origin : "https://capacityconnect.org";
      const verificationUrl = `${origin}/verify/id?cert=${encodeURIComponent(certHash)}&name=${encodeURIComponent(traineeName)}&course=${encodeURIComponent(assessment.courseTitle)}&grade=${encodeURIComponent(gradeText)}`;

      const newCert: Certificate = {
        id: "cert-" + Date.now(),
        traineeId,
        traineeName,
        courseId: assessment.courseId,
        courseTitle: assessment.courseTitle,
        trainerName: assessment.createdBy,
        issuedAt: new Date().toISOString(),
        certificateHash: certHash,
        grade: gradeText,
        verificationUrl
      };

      completeCourse(traineeId, assessment.courseId, gradeText, pct, newCert);
      setIssuedCert(newCert);
    }

    setResult({ score: earnedScore, total: totalScore, percentage: pct, passed });
  };

  if (!assessment) {
    return (
      <DashboardLayout
        pageTitle="Assessment Not Found"
        breadcrumbs={[
          { label: "Assessments", to: "/trainee/assessments" },
          { label: "Not Found" }
        ]}
      >
        <div className="max-w-md mx-auto my-16 p-8 glass-panel border border-white/15 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Assessment Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The requested assessment could not be located or may have been updated.
          </p>
          <button
            onClick={() => navigate("/trainee/assessments")}
            className="apple-btn-primary text-xs px-5 py-2.5 font-bold mx-auto flex items-center gap-2"
          >
            Return to Assessments
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isDeadlineExpired = Boolean(
    rawAssessment?.deadline && new Date(rawAssessment.deadline) < new Date()
  );

  if (isDeadlineExpired) {
    return (
      <DashboardLayout
        pageTitle="Assessment Submissions Closed"
        breadcrumbs={[
          { label: "Trainee Dashboard", to: "/trainee/dashboard" },
          { label: "Assessments", to: "/trainee/assessments" },
          { label: "Deadline Closed" }
        ]}
      >
        <div className="max-w-md mx-auto my-16 p-8 glass-panel border border-rose-500/30 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="badge-red text-[10px] uppercase font-bold tracking-wider">Submissions Closed</span>
            <h2 className="text-xl font-bold text-white">{rawAssessment?.title || "Assessment"}</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The submission deadline for this assessment was <strong>{new Date(rawAssessment!.deadline).toLocaleString()}</strong>.
            This evaluation is no longer accepting student attempts.
          </p>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 text-left space-y-1.5">
            <p>• Course: <span className="text-white font-medium">{rawAssessment?.courseTitle}</span></p>
            <p>• Faculty: <span className="text-white font-medium">{rawAssessment?.createdBy}</span></p>
            <p>• Status: <span className="text-rose-400 font-semibold">Deadline Expired</span></p>
          </div>
          <button
            onClick={() => navigate("/trainee/assessments")}
            className="apple-btn-primary text-xs px-5 py-2.5 font-bold mx-auto flex items-center gap-2 cursor-pointer"
          >
            Return to Active Assessments
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const currentQ = questions[currentIndex];

  return (
    <DashboardLayout
      pageTitle={assessment.title}
      breadcrumbs={[
        { label: "Assessments", to: "/trainee/assessments" },
        { label: assessment.title }
      ]}
    >
      <div className="space-y-6">
        {/* Proctoring Banner & Countdown Dock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2">
            <ProctoringGuard onViolation={handleProctorViolation} maxViolations={3} />
          </div>

          <div className="p-3 rounded-xl glass-panel border border-white/15 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Time Remaining:</span>
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-white">
              <Clock className="w-4 h-4 text-[#2997ff]" />
              <span>{(minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds)}</span>
            </div>
          </div>
        </div>

        {!submitted ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Main Question Box */}
            <div className="lg:col-span-3 card p-4 sm:p-8 space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 gap-2">
                <span className="badge-blue text-[10px]">
                  QUESTION {currentIndex + 1} OF {questions.length}
                </span>
                <button
                  onClick={toggleReview}
                  className={"flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer " + (markedForReview[currentIndex] ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-white/5 text-slate-400 hover:text-white")}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="text-[11px] sm:text-xs">{markedForReview[currentIndex] ? "Marked" : "Mark for Review"}</span>
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm sm:text-lg font-bold text-white tracking-tight leading-snug">
                  {currentQ?.text}
                </h3>

                <div className="grid grid-cols-1 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                  {currentQ?.options.map((opt, idx) => {
                    const isSelected = selectedAnswers[currentIndex] === idx;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(idx)}
                        className={"p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm cursor-pointer transition flex items-center justify-between min-h-[48px] " + (isSelected ? "bg-[#0071e3]/20 border-[#2997ff] text-white font-semibold shadow-lg shadow-blue-500/10" : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]")}
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <span className={"w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs shrink-0 " + (isSelected ? "bg-[#0071e3] text-white" : "bg-black/40 text-slate-400")}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#2997ff] shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Nav */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-2">
                <button
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="apple-btn-secondary text-xs px-3.5 sm:px-4 py-2.5 disabled:opacity-30 min-h-[40px]"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                {currentIndex === questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    className="apple-btn-success text-xs px-5 sm:px-6 py-2.5 font-bold min-h-[40px]"
                  >
                    Submit Assessment →
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    className="apple-btn-primary text-xs px-4 sm:px-5 py-2.5 font-semibold min-h-[40px]"
                  >
                    Next Question <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Question Jump Palette */}
            <div className="card p-5 space-y-4 h-fit">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Question Jump Palette
              </h4>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, idx) => {
                  const answered = selectedAnswers[idx] !== undefined;
                  const isCurrent = currentIndex === idx;
                  const isMarked = markedForReview[idx];

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={"h-9 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center relative " + (isCurrent ? "border-2 border-[#2997ff] text-white" : answered ? "bg-[#0071e3] text-white" : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/10")}
                    >
                      {idx + 1}
                      {isMarked && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-white/10 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#0071e3]" /> Answered ({Object.keys(selectedAnswers).length})
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-white/[0.04] border border-white/10" /> Unanswered ({questions.length - Object.keys(selectedAnswers).length})
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-400" /> Marked for Review ({Object.values(markedForReview).filter(Boolean).length})
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="apple-btn-primary w-full py-2.5 text-xs font-bold"
              >
                Submit Exam Now
              </button>
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="card max-w-xl mx-auto p-8 text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-2xl"
              style={{ background: result.passed ? "rgba(48, 209, 88, 0.2)" : "rgba(255, 69, 58, 0.2)" }}>
              {result.passed ? (
                <Award className="w-8 h-8 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-rose-400" />
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">
                {result.passed ? "Assessment Passed & Competency Certified!" : "Assessment Incomplete"}
              </h2>
              <p className="text-xs text-slate-300">
                You scored <strong className="text-white text-base">{result.percentage}%</strong> ({result.score} / {result.total} Points)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Passing Requirement</span>
                <p className="font-bold text-white mt-0.5">{assessment.passingScore}%</p>
              </div>
              <div>
                <span className="text-slate-400">Proctoring Strikes</span>
                <p className="font-bold text-emerald-400 mt-0.5">{tabViolations} Violations Logged</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {result.passed && issuedCert && (
                <button
                  onClick={() => setCertModalOpen(true)}
                  className="apple-btn-success text-xs px-6 py-2.5 font-bold"
                >
                  <Award className="w-4 h-4" /> View Verifiable Certificate
                </button>
              )}
              <button
                onClick={() => navigate("/trainee/dashboard")}
                className="apple-btn-secondary text-xs px-6 py-2.5"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      <CertificateModal
        certificate={issuedCert}
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
      />
    </DashboardLayout>
  );
};
