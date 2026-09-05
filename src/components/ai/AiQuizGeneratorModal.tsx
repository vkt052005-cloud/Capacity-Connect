import React, { useState } from "react";
import { Sparkles, Brain, CheckCircle2, X, Plus, Trash2 } from "lucide-react";
import { Question } from "../../types";
import { useAppStore } from "../../store/appStore";

interface AiQuizGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsGenerated: (questions: Question[]) => void;
  courseTitle: string;
}

export const AiQuizGeneratorModal: React.FC<AiQuizGeneratorModalProps> = ({
  isOpen,
  onClose,
  onQuestionsGenerated,
  courseTitle
}) => {
  const [prompt, setPrompt] = useState("");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [generatedList, setGeneratedList] = useState<Question[]>([]);
  const { addToast } = useAppStore();

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    setTimeout(() => {
      const sampleQuestions: Question[] = [
        {
          id: "gen-q1-" + Date.now(),
          text: "What architectural trade-off is fundamental when choosing eventual consistency over strong consistency?",
          options: [
            { id: "o1", text: "Higher availability and lower write latency across distributed nodes" },
            { id: "o2", text: "Guaranteed real-time serializability on every read" },
            { id: "o3", text: "Complete elimination of database storage indexes" },
            { id: "o4", text: "Zero network packets required between datacenters" }
          ],
          correctIndex: 0,
          points: 20,
          explanation: "Eventual consistency allows nodes to respond to writes immediately without waiting for cross-region consensus, trading instant read uniformity for higher uptime.",
          topic: "Distributed Systems"
        },
        {
          id: "gen-q2-" + Date.now(),
          text: "In Kubernetes, which component is responsible for assigning pods to healthy worker nodes based on resource constraints?",
          options: [
            { id: "o1", text: "kube-proxy" },
            { id: "o2", text: "kube-scheduler" },
            { id: "o3", text: "containerd" },
            { id: "o4", text: "etcd" }
          ],
          correctIndex: 1,
          points: 20,
          explanation: "The kube-scheduler watches for unassigned pods and filters/scores nodes to select the optimal host.",
          topic: "Kubernetes Core"
        },
        {
          id: "gen-q3-" + Date.now(),
          text: "How does the Transactional Outbox pattern prevent distributed data inconsistency?",
          options: [
            { id: "o1", text: "By writing event payloads to the database inside the same local ACID transaction as the business entity" },
            { id: "o2", text: "By disabling all database locks entirely" },
            { id: "o3", text: "By transmitting unencrypted HTTP payloads" },
            { id: "o4", text: "By forcing all microservices to share a single SQLite file" }
          ],
          correctIndex: 0,
          points: 20,
          explanation: "Atomic local writes ensure the message record exists whenever the entity state changes, enabling guaranteed at-least-once message delivery.",
          topic: "Resilience Design"
        }
      ];

      setGeneratedList(sampleQuestions);
      setGenerating(false);
      addToast({
        title: "AI Quiz Bank Generated",
        message: "Created balanced multi-tier MCQs with answer rationales.",
        type: "success"
      });
    }, 1200);
  };

  const handleApply = () => {
    onQuestionsGenerated(generatedList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fadeIn">
      <div className="relative max-w-2xl w-full glass-panel border border-white/20 shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0071e3]/20 text-[#2997ff] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">AI Quiz & Assessment Generator</h3>
              <p className="text-[11px] text-slate-400">Generate multi-tier MCQ banks from course syllabus or custom prompts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {generatedList.length === 0 ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Topic / Key Syllabus Notes
              </label>
              <textarea
                rows={3}
                required
                placeholder={"e.g. Distributed consensus, Kafka partitioning, Kubernetes mTLS security in " + courseTitle}
                className="apple-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Difficulty Tier</label>
                <select
                  className="apple-input text-xs"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Question Count</label>
                <input
                  type="number"
                  min={3}
                  max={10}
                  className="apple-input text-xs"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="apple-btn-primary w-full py-2.5 text-xs font-bold"
            >
              <Brain className="w-4 h-4" />
              {generating ? "Synthesizing Question Bank..." : "Generate AI Questions"}
            </button>
          </form>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="flex items-center justify-between text-xs text-slate-300 border-b border-white/10 pb-2">
              <span className="font-semibold text-[#2997ff]">Generated {generatedList.length} MCQ Questions</span>
              <button
                onClick={() => setGeneratedList([])}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                Regenerate
              </button>
            </div>

            {generatedList.map((q, idx) => (
              <div key={q.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Q{idx + 1}. {q.text}</span>
                  <span className="badge-blue text-[9px]">{q.topic}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={opt.id}
                      className={"p-1.5 rounded-lg border text-[11px] " + (oIdx === q.correctIndex ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 font-semibold" : "bg-black/30 border-white/5 text-slate-300")}
                    >
                      {String.fromCharCode(65 + oIdx)}. {opt.text}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-[10px] text-slate-400 italic">Rationale: {q.explanation}</p>
                )}
              </div>
            ))}

            <button
              onClick={handleApply}
              className="apple-btn-primary w-full py-2.5 text-xs font-bold mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Import All Questions to Assessment Creator
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
