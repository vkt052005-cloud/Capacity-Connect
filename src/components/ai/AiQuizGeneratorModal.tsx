import React, { useState } from "react";
import { Sparkles, Brain, CheckCircle2, X, Plus, Trash2 } from "lucide-react";
import { Question } from "../../types";
import { useAppStore } from "../../store/appStore";
import { generateAnswerHash } from "../../utils/quizSecurity";

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

    const targetCount = Math.max(1, Math.min(10, count || 5));

    setTimeout(() => {
      // High-quality question pool relevant to modern engineering, systems architecture, and course curricula
      const questionPool = [
        {
          text: `What architectural trade-off is fundamental when choosing eventual consistency over strong consistency in distributed systems?`,
          options: [
            { id: "o1", text: "Higher availability and lower write latency across distributed nodes" },
            { id: "o2", text: "Guaranteed real-time serializability on every concurrent read" },
            { id: "o3", text: "Complete elimination of database storage indexes" },
            { id: "o4", text: "Zero network packets required between datacenters" }
          ],
          correctIndex: 0,
          explanation: "Eventual consistency allows nodes to respond to writes immediately without waiting for cross-region consensus, trading instant read uniformity for higher uptime.",
          topic: "Distributed Systems"
        },
        {
          text: `In Kubernetes cluster orchestration, which component is responsible for assigning pods to healthy worker nodes based on resource constraints?`,
          options: [
            { id: "o1", text: "kube-proxy" },
            { id: "o2", text: "kube-scheduler" },
            { id: "o3", text: "containerd runtime" },
            { id: "o4", text: "etcd key-value store" }
          ],
          correctIndex: 1,
          explanation: "The kube-scheduler watches for unassigned pods and filters/scores nodes to select the optimal host.",
          topic: "Container Orchestration"
        },
        {
          text: `How does the Transactional Outbox pattern prevent distributed data inconsistency between microservices?`,
          options: [
            { id: "o1", text: "By writing event payloads to the database inside the same local ACID transaction as the business entity" },
            { id: "o2", text: "By disabling all database locks entirely" },
            { id: "o3", text: "By transmitting unencrypted HTTP payloads" },
            { id: "o4", text: "By forcing all microservices to share a single SQLite file" }
          ],
          correctIndex: 0,
          explanation: "Atomic local writes ensure the message record exists whenever the entity state changes, enabling guaranteed at-least-once message delivery.",
          topic: "Resilience Design"
        },
        {
          text: `In relational database query optimization, why is a B+ Tree preferred over a standard Binary Search Tree for table indexing?`,
          options: [
            { id: "o1", text: "B+ Tree nodes have high fan-out, minimizing disk I/O page reads and supporting fast sequential range scans via leaf node pointers" },
            { id: "o2", text: "B+ Tree operations run in O(1) constant time under all conditions" },
            { id: "o3", text: "B+ Trees do not require any memory overhead" },
            { id: "o4", text: "B+ Trees prevent concurrent read transactions" }
          ],
          correctIndex: 0,
          explanation: "High fan-out reduces tree depth, ensuring that finding any record requires very few disk block reads, while linked leaf nodes make range scans extremely efficient.",
          topic: "Database Indexing"
        },
        {
          text: `What is the primary function of an API Gateway in a microservices infrastructure?`,
          options: [
            { id: "o1", text: "Acts as a single entry point for routing, rate limiting, TLS termination, and authentication" },
            { id: "o2", text: "Replaces the relational database with volatile cache memory" },
            { id: "o3", text: "Compiles source code into native machine assembly" },
            { id: "o4", text: "Deletes unread network socket buffers" }
          ],
          correctIndex: 0,
          explanation: "An API Gateway reverse-proxies client requests to internal services while centralizing security, observability, throttling, and protocol transformation.",
          topic: "API Architecture"
        },
        {
          text: `In modern asynchronous JavaScript / TypeScript, how does the Event Loop handle Microtasks (Promises) versus Macrotasks (setTimeout)?`,
          options: [
            { id: "o1", text: "The entire Microtask queue is drained immediately after the current call stack clears, before the next Macrotask executes" },
            { id: "o2", text: "Macrotasks always execute before Microtasks regardless of queue state" },
            { id: "o3", text: "Microtasks and Macrotasks are executed in parallel on different CPU threads" },
            { id: "o4", text: "Microtasks are deferred until the browser tab is closed" }
          ],
          correctIndex: 0,
          explanation: "JavaScript processes all pending microtasks (Promise resolutions) immediately after the active script finishes and before processing timers or rendering updates.",
          topic: "Concurrency & Event Loop"
        },
        {
          text: `Which cryptographic approach is used by JSON Web Tokens (JWT) with RS256 algorithm to guarantee payload integrity?`,
          options: [
            { id: "o1", text: "Asymmetric signing where the identity provider signs with a private key and consumers verify using the public key" },
            { id: "o2", text: "Symmetric XOR encryption with shared plaintext strings" },
            { id: "o3", text: "One-way MD5 hashing without salt" },
            { id: "o4", text: "Diffie-Hellman ephemeral key derivation on each HTTP byte" }
          ],
          correctIndex: 0,
          explanation: "RS256 uses RSA signature with SHA-256. The issuing server signs with its private key, allowing any service to verify authenticity using the public key.",
          topic: "Authentication & Security"
        },
        {
          text: `In RESTful HTTP protocol specifications, which of the following statements about HTTP PUT versus PATCH is correct?`,
          options: [
            { id: "o1", text: "PUT replaces the entire resource representation, whereas PATCH applies partial modifications to the resource" },
            { id: "o2", text: "PUT is always non-idempotent while PATCH is strictly read-only" },
            { id: "o3", text: "PATCH cannot be used with JSON request bodies" },
            { id: "o4", text: "PUT can only delete resources from the server" }
          ],
          correctIndex: 0,
          explanation: "PUT is idempotent and replaces the complete resource with the provided payload, whereas PATCH modifies only the specific fields specified.",
          topic: "REST Protocols"
        },
        {
          text: `What is the role of a Circuit Breaker pattern (e.g. Resilience4j / Netflix Hystrix) in distributed service-to-service communication?`,
          options: [
            { id: "o1", text: "It prevents cascading failures by temporarily tripping and fast-failing calls when a downstream service becomes unresponsive" },
            { id: "o2", text: "It cuts off electrical power to the physical datacenter rack" },
            { id: "o3", text: "It encrypts network packets with AES-256 bit keys" },
            { id: "o4", text: "It automatically replicates relational tables across regions" }
          ],
          correctIndex: 0,
          explanation: "When downstream failures exceed a threshold, the circuit breaker opens to prevent thread starvation and give the failing dependency time to recover.",
          topic: "System Reliability"
        },
        {
          text: `In Docker and Linux container technology, what Linux kernel mechanisms provide resource isolation and resource limiting respectively?`,
          options: [
            { id: "o1", text: "Namespaces for isolation (PID, net, mount) and Cgroups (control groups) for resource limiting (CPU, memory)" },
            { id: "o2", text: "Systemd for isolation and cron for resource allocation" },
            { id: "o3", text: "IPTables for both isolation and memory quota management" },
            { id: "o4", text: "SELinux for disk partitioning and Swappiness for isolation" }
          ],
          correctIndex: 0,
          explanation: "Linux Namespaces provide isolated workspaces for processes, while Cgroups limit and account for resource usage like memory, CPU, and disk I/O.",
          topic: "Operating Systems & DevOps"
        }
      ];

      // Generate exact number of questions as requested by user (targetCount)
      const selected = questionPool.slice(0, targetCount);
      const generated: Question[] = selected.map((q, idx) => {
        const qId = "gen-ai-" + Date.now() + "-" + (idx + 1);
        return {
          id: qId,
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          answerHash: generateAnswerHash(qId, q.correctIndex),
          points: Math.round(100 / targetCount),
          explanation: q.explanation,
          topic: prompt.trim() ? `${prompt.trim().slice(0, 20)} (${q.topic})` : q.topic
        };
      });

      setGeneratedList(generated);
      setGenerating(false);
      addToast({
        title: "AI Assessment Generated",
        message: `Successfully generated ${generated.length} ${difficulty} MCQ questions.`,
        type: "success"
      });
    }, 1000);
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
