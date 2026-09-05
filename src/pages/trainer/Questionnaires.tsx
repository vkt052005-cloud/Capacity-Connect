import React, { useState } from "react";
import { CheckSquare, Sparkles, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { AiQuizGeneratorModal } from "../../components/ai/AiQuizGeneratorModal";
import { useAssessmentsStore } from "../../store/assessmentsStore";
import { useCoursesStore } from "../../store/coursesStore";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { Question } from "../../types";

export const Questionnaires: React.FC = () => {
  const { assessments, addAssessment } = useAssessmentsStore();
  const { courses } = useCoursesStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || "c1");
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [duration, setDuration] = useState(15);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<Question[]>([]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  const handleAddQuestion = () => {
    const newQ: Question = {
      id: "q-" + Date.now(),
      text: "New custom question prompt...",
      options: [
        { id: "o1", text: "Option A" },
        { id: "o2", text: "Option B" },
        { id: "o3", text: "Option C" },
        { id: "o4", text: "Option D" }
      ],
      correctIndex: 0,
      points: 20
    };
    setQuestions([...questions, newQ]);
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentTitle.trim() || questions.length === 0) {
      addToast({
        title: "Incomplete Assessment",
        message: "Please provide a title and at least one question.",
        type: "warning"
      });
      return;
    }

    addAssessment({
      courseId: selectedCourseId,
      courseTitle: selectedCourse?.title || "Cloud Architecture",
      title: assessmentTitle,
      description: "Subject-wise evaluation for " + (selectedCourse?.title || "course"),
      deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
      durationMinutes: duration,
      passingScore,
      createdBy: currentUser?.name || "Faculty Trainer",
      questions
    });

    setAssessmentTitle("");
    setQuestions([]);
    addToast({
      title: "Assessment Published",
      message: "Students can now attempt this timed proctored evaluation.",
      type: "success"
    });
  };

  return (
    <DashboardLayout
      pageTitle="Assessment & Questionnaire Authoring"
      breadcrumbs={[
        { label: "Trainer Dashboard", to: "/trainer/dashboard" },
        { label: "Create Assessments" }
      ]}
    >
      <div className="space-y-6">
        <div className="glass-panel p-6 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Create Proctored MCQ Assessment</h3>
            <p className="text-xs text-slate-400">Design timed evaluations or leverage generative AI to create question banks instantly</p>
          </div>

          <button
            onClick={() => setAiModalOpen(true)}
            className="apple-btn-primary text-xs px-4 py-2 font-bold flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> AI Quiz Generator
          </button>
        </div>

        <form onSubmit={handleSaveAssessment} className="card p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assessment Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Cloud Certification Midterm"
                className="apple-input text-xs"
                value={assessmentTitle}
                onChange={(e) => setAssessmentTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Min)</label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  className="apple-input text-xs"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pass %</label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  className="apple-input text-xs"
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="text-xs font-bold text-white">Questions in Assessment ({questions.length})</h4>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="text-xs text-[#2997ff] hover:underline font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Manual Question
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div key={q.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Question {qIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))}
                    className="text-rose-400 p-1 hover:text-rose-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  className="apple-input text-xs font-semibold"
                  value={q.text}
                  onChange={(e) => {
                    const next = [...questions];
                    next[qIdx].text = e.target.value;
                    setQuestions(next);
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oIdx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={"correct-" + q.id}
                        checked={q.correctIndex === oIdx}
                        onChange={() => {
                          const next = [...questions];
                          next[qIdx].correctIndex = oIdx;
                          setQuestions(next);
                        }}
                      />
                      <input
                        type="text"
                        className="apple-input text-xs py-1"
                        value={opt.text}
                        onChange={(e) => {
                          const next = [...questions];
                          next[qIdx].options[oIdx].text = e.target.value;
                          setQuestions(next);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="apple-btn-primary text-xs px-6 py-2.5 font-bold">
            <CheckCircle2 className="w-4 h-4" /> Save & Publish Assessment
          </button>
        </form>
      </div>

      <AiQuizGeneratorModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onQuestionsGenerated={(generated) => setQuestions([...questions, ...generated])}
        courseTitle={selectedCourse?.title || "Cloud Architecture"}
      />
    </DashboardLayout>
  );
};
export default Questionnaires;
