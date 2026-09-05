import React, { useState } from "react";
import { Bot, Send, Sparkles, User, FileText, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

interface AiDoubtSolverChatProps {
  courseTitle: string;
}

export const AiDoubtSolverChat: React.FC<AiDoubtSolverChatProps> = ({ courseTitle }) => {
  const { currentUser } = useAuthStore();
  const [messages, setMessages] = useState<{ role: "assistant" | "user"; text: string; citation?: string }[]>([
    {
      role: "assistant",
      text: "Hello " + (currentUser?.name || "there") + "! I am your AI Teaching Assistant trained on the slides and lecture notes for " + courseTitle + ". What concept would you like me to clarify?",
      citation: "Slide Deck & Syllabus v2.4"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQ = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userQ }]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      let reply = "Based on Slide 2 and the lecture notes: In distributed architectures, Kafka partition offsets and transactional outbox tables guarantee that data writes and message publications stay consistent even during regional failovers.";
      let cite = "Slide 2: Event-Driven Topologies & Kafka Messaging";

      if (userQ.toLowerCase().includes("mesh") || userQ.toLowerCase().includes("mtls") || userQ.toLowerCase().includes("k8s") || userQ.toLowerCase().includes("kubernetes")) {
        reply = "According to Slide 3: Kubernetes Service Meshes like Istio utilize Envoy sidecars to enforce mTLS encryption, rate limiting, and traffic routing transparently without code changes.";
        cite = "Slide 3: Kubernetes Cluster Scheduling & Service Mesh";
      } else if (userQ.toLowerCase().includes("zero-trust") || userQ.toLowerCase().includes("security") || userQ.toLowerCase().includes("jwt")) {
        reply = "As explained on Slide 5: Zero-Trust principles require continuous authentication and least-privilege token verification for every microservice request, rather than relying on intranet perimeter trust.";
        cite = "Slide 5: Zero-Trust Security & API Gateway Hardening";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: reply,
          citation: cite
        }
      ]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="card flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#0071e3]/20 text-[#2997ff] flex items-center justify-center border border-[#2997ff]/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">AI Doubt Solver (24/7 Teaching Assistant)</h4>
            <p className="text-[10px] text-slate-400">RAG grounded in course slides & lecture transcripts</p>
          </div>
        </div>
        <span className="badge-green text-[9px] py-0.5 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Grounded
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 pr-1 my-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={"flex gap-2.5 text-xs " + (m.role === "user" ? "flex-row-reverse" : "flex-row")}
          >
            <div
              className={"w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 " + (m.role === "user" ? "bg-[#0071e3] text-white" : "bg-purple-500/20 text-purple-400 border border-purple-500/30")}
            >
              {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div className={"max-w-[85%] space-y-1 " + (m.role === "user" ? "items-end" : "items-start")}>
              <div
                className={"p-2.5 rounded-2xl leading-relaxed " + (m.role === "user" ? "bg-[#0071e3] text-white rounded-tr-sm" : "bg-white/[0.05] border border-white/10 text-slate-200 rounded-tl-sm")}
              >
                {m.text}
              </div>

              {m.citation && (
                <div className="flex items-center gap-1 text-[10px] text-[#2997ff] font-mono px-1">
                  <FileText className="w-3 h-3" />
                  <span>Grounding: {m.citation}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <Bot className="w-4 h-4 animate-bounce text-[#2997ff]" />
            Synthesizing grounded answer from course slides...
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-white/10">
        <input
          type="text"
          placeholder="Ask anything about the slides, code, or theory..."
          className="apple-input text-xs py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="apple-btn-primary px-3 py-2 text-xs disabled:opacity-40 cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
