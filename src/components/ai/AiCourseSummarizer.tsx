import React, { useState } from "react";
import { Sparkles, Brain, BookOpen, Layers, CheckCircle2, RotateCw } from "lucide-react";
import { Flashcard } from "../../types";

interface AiCourseSummarizerProps {
  summary?: string;
  keyTakeaways?: string[];
  flashcards?: Flashcard[];
  courseTitle: string;
}

export const AiCourseSummarizer: React.FC<AiCourseSummarizerProps> = ({
  summary,
  keyTakeaways = [],
  flashcards = [],
  courseTitle
}) => {
  const [activeTab, setActiveTab] = useState<"summary" | "flashcards">("summary");
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="card space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">AI Course Summarizer & Revision Cards</h3>
            <p className="text-[11px] text-slate-400">Generative synthesis extracted from lecture transcripts and slides</p>
          </div>
        </div>

        <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab("summary")}
            className={"px-3 py-1 rounded-lg font-semibold transition " + (activeTab === "summary" ? "bg-[#0071e3] text-white" : "text-slate-400 hover:text-white")}
          >
            Key Takeaways
          </button>
          <button
            onClick={() => setActiveTab("flashcards")}
            className={"px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 " + (activeTab === "flashcards" ? "bg-[#0071e3] text-white" : "text-slate-400 hover:text-white")}
          >
            <Layers className="w-3.5 h-3.5" />
            Revision Cards ({flashcards.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "summary" ? (
        <div className="space-y-4 animate-fadeIn">
          {summary && (
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-slate-200 leading-relaxed">
              <strong className="text-purple-300 block mb-1">Executive Summary:</strong>
              {summary}
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2997ff]" /> Core Learning Takeaways
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {keyTakeaways.map((takeaway, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-200 leading-relaxed">{takeaway}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 animate-fadeIn">
          <p className="text-xs text-slate-400">Click any card to flip and test your knowledge before taking the assessment.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {flashcards.map((card) => {
              const isFlipped = !!flippedCards[card.id];
              return (
                <div
                  key={card.id}
                  onClick={() => toggleFlip(card.id)}
                  className="relative min-h-[140px] rounded-2xl glass-panel border border-white/10 p-4 cursor-pointer hover:border-[#2997ff]/50 transition-all group flex flex-col justify-between select-none"
                  style={{ background: isFlipped ? "rgba(0, 113, 227, 0.15)" : "rgba(18, 18, 24, 0.7)" }}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="badge-blue text-[9px]">{card.category || "Concept"}</span>
                    <span className="flex items-center gap-1 group-hover:text-white transition">
                      <RotateCw className="w-3 h-3" /> {isFlipped ? "Answer" : "Question"}
                    </span>
                  </div>

                  <div className="my-2">
                    <p className={"text-xs leading-relaxed " + (isFlipped ? "text-emerald-300 font-medium" : "text-white font-semibold")}>
                      {isFlipped ? card.back : card.front}
                    </p>
                  </div>

                  <div className="text-[10px] text-slate-500 text-right">
                    {isFlipped ? "✓ Answer Revealed" : "Tap to flip →"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
