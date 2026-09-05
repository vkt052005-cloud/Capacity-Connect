import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap, BookOpen, Award, Users, ChevronRight, ChevronDown,
  TrendingUp, Shield, Zap, ArrowRight, CheckCircle2,
  Video, Brain, ShieldCheck, Flame, Star, QrCode, Search,
  HelpCircle, Mail, Send, Sparkles, MapPin,
  Bell, AlertTriangle
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useCoursesStore } from "../../store/coursesStore";
import { useNotificationsStore } from "../../store/notificationsStore";
import { useAppStore } from "../../store/appStore";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { ToastContainer } from "../../components/common/ToastContainer";
import { initialCourses } from "../../data/seed";

export const HomePage: React.FC = () => {
  const { courses, load } = useCoursesStore();

  useEffect(() => {
    load();
  }, [load]);
  const { notifications } = useNotificationsStore();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const featuredCourses = (courses && courses.length > 0 ? courses : initialCourses).slice(0, 4);
  const pinned = notifications.filter((n) => n.pinned);

  const handleRoleQuickStart = (role: "trainee" | "trainer" | "admin") => {
    navigate(`/login?role=${role}`);
  };

  const faqs = [
    {
      q: "How does the automated Competency Mapping algorithm work?",
      a: "The Competency Mapping Engine dynamically analyzes departmental workforce skill demands and calculates an internal capability coverage index. It automatically matches certified faculty based on domain taxonomy, ratings, and verified credentials to highlight high-priority subject gaps."
    },
    {
      q: "How does the Anti-Cheat Proctoring Guard ensure test integrity?",
      a: "During timed MCQ assessments, the Proctoring Guard monitors tab-switching, browser window focus loss, and developer console events in real-time. Unauthorized focus shifts are logged as infractions on the candidate transcript with automated timeout enforcement."
    },
    {
      q: "How is live Google Meet lecture attendance synchronized with gradebooks?",
      a: "When a faculty member launches or joins a live Google Meet class, participant join timestamps are captured through the automated attendance engine. Verified attendees are automatically marked present and synced to the LMS gradebook and certification ledger."
    },
    {
      q: "What role types are supported on the portal?",
      a: "The portal strictly enforces three isolated role workspaces: Trainee (learning, proctored exams, Google Meet classes, certificates), Trainer (Google Meet console, library manager, AI quiz generator, gradebook), and Administrator (user approvals, competency mapping, bulletins, audit logs)."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-[#f5f5f7] relative selection:bg-[#0071e3] selection:text-white">
      {/* Ambient Glow Orbs */}
      <div className="glow-orb-primary" />
      <div className="glow-orb-secondary" />

      <Header />

      <main className="flex-1 space-y-10 pb-12 overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-6 sm:pt-10 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 z-10">
          {/* Large Hero Brand Logo */}
          <div className="flex justify-center mb-1">
            <img
              src="/logo.png"
              alt="Capacity Connect Logo"
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-[0_0_35px_rgba(41,151,255,0.7)] hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2997ff]/40 bg-[#0071e3]/10 text-[#2997ff] text-xs sm:text-[12.5px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2997ff]" />
            <span>Competency Development Portal</span>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-snug">
              Digital Capacity Building &
              <span className="block mt-1.5 sm:mt-2.5 pb-1 bg-gradient-to-r from-[#2997ff] via-[#64d2ff] to-[#a1e3ff] bg-clip-text text-transparent">
                Learning Management
              </span>
            </h1>
            <p className="text-[13px] sm:text-[15px] text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
              A centralized web platform supporting organizational training, competency development, and knowledge sharing through structured courses, MCQ assessments, and verified certifications.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="apple-btn-primary px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="apple-btn-secondary px-6 py-2.5 text-xs sm:text-sm font-medium"
            >
              Sign In to Portal
            </Link>
          </div>

          {/* Quick Role Entrance Cards */}
          <div className="pt-8 max-w-5xl mx-auto">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-4">
              Select User Role to Access Workspace
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Trainee */}
              <div
                onClick={() => handleRoleQuickStart("trainee")}
                className="glass-card p-5 text-left space-y-3 cursor-pointer group hover:border-[#2997ff]/60 transition"
              >
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#2997ff] transition flex items-center justify-between">
                    <span>Trainee</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Professional profile, enrolled courses, MCQ tests & verified certificates.
                  </p>
                </div>
              </div>

              {/* Trainer */}
              <div
                onClick={() => handleRoleQuickStart("trainer")}
                className="glass-card p-5 text-left space-y-3 cursor-pointer group hover:border-[#2997ff]/60 transition"
              >
                <div className="w-9 h-9 rounded-2xl bg-[#0071e3]/20 text-[#2997ff] flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#2997ff] transition flex items-center justify-between">
                    <span>Trainer</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Schedule live lectures, author questionnaires, library & trainee gradebook.
                  </p>
                </div>
              </div>

              {/* Administrator */}
              <div
                onClick={() => handleRoleQuickStart("admin")}
                className="glass-card p-5 text-left space-y-3 cursor-pointer group hover:border-[#2997ff]/60 transition"
              >
                <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#2997ff] transition flex items-center justify-between">
                    <span>Administrator</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    User approval, competency mapping, announcements & executive reports.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Announcements Section */}
        {pinned.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="card p-4 sm:p-5 border-[#2997ff]/30 bg-gradient-to-r from-blue-950/20 via-slate-900/30 to-purple-950/20 space-y-3">
              <h2 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#2997ff]" /> Organizational Announcements & Notices
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pinned.map((n) => (
                  <div key={n.id} className="card p-3 space-y-1 border-white/10 hover:border-[#2997ff]/40 transition">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {n.type === "announcement" && <Bell className="w-3.5 h-3.5 text-[#2997ff] shrink-0" />}
                        {n.type === "achievement" && <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        {n.type === "new_content" && <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        {n.type === "alert" && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                        <span>{n.title}</span>
                      </h3>
                      <span className="badge-blue text-[8px] py-0.5 uppercase">{n.type}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{n.content}</p>
                    <p className="text-[9px] text-slate-500 pt-0.5 font-mono">Published by {n.author}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Core Architectural Pillars */}
        <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Key Platform Features
            </h2>
            <p className="text-xs text-slate-400">
              A centralized platform built for training delivery, assessment integrity, and capability tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Brain,
                title: "Competency Mapping Engine",
                desc: "Matches organizational training needs with certified trainer expertise and highlights subject capacity gaps."
              },
              {
                icon: Video,
                title: "Video Streaming & Live Sessions",
                desc: "HD video lectures with synchronized interactive transcripts, slide deck viewing, and scheduled Google Meet sessions."
              },
              {
                icon: Sparkles,
                title: "AI Course Summarizer & Revision",
                desc: "Instant chapter summaries, key takeaways, and interactive revision flashcards generated from lecture materials."
              },
              {
                icon: ShieldCheck,
                title: "Proctored MCQ Assessment Engine",
                desc: "Timed subject tests with question shuffling, anti-cheat tab-switch detection, and automated grading."
              },
              {
                icon: Award,
                title: "Verifiable Digital Certificates",
                desc: "Cryptographically signed certificates featuring QR code verification for third-party authenticity checks."
              },
              {
                icon: Flame,
                title: "Learner Progress & Recognition",
                desc: "Track completed courses, earn milestone badges, maintain daily learning streaks, and view departmental achievements."
              }
            ].map((f, i) => (
              <div key={i} className="card p-5 space-y-2.5 hover:border-white/20 transition">
                <div className="w-8 h-8 rounded-xl bg-[#0071e3]/20 text-[#2997ff] flex items-center justify-center">
                  <f.icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white tracking-tight">{f.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Courses Spotlight */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Featured Courses
              </h2>
              <p className="text-xs text-slate-400">
                Curated capacity building programs from verified instructors
              </p>
            </div>
            <Link
              to="/trainee/courses"
              className="text-xs text-[#2997ff] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Browse Catalog</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {featuredCourses.length === 1 ? (
            <div className="max-w-3xl mx-auto">
              {featuredCourses.map((c) => (
                <div key={c.id} className="card overflow-hidden grid grid-cols-1 sm:grid-cols-12 group hover:border-[#2997ff]/50 transition shadow-2xl">
                  <div className="sm:col-span-5 relative min-h-[220px] overflow-hidden">
                    <img
                      src={c.thumbnail || (c.id === "c-dsa" || c.title.toLowerCase().includes("data structure") ? "/thumbnails/dsa-course.jpg" : "/thumbnails/webdev-course.jpg")}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = (c.id === "c-dsa" || c.title.toLowerCase().includes("data structure"))
                          ? "/thumbnails/dsa-course.jpg"
                          : "/thumbnails/webdev-course.jpg";
                        if (!target.src.endsWith(fallback)) {
                          target.src = fallback;
                        }
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="badge-blue text-[10px] font-bold">Featured Playlist</span>
                    </div>
                  </div>
                  <div className="sm:col-span-7 p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="badge-blue text-[9px]">{c.category}</span>
                        <span className="badge-green text-[9px]">{c.lessons?.length || (c.id === 'c-dsa' ? 315 : 139)} Lessons</span>
                        <span className="badge-blue text-[9px] font-mono">⭐ {c.rating || 4.98}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#2997ff] transition">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                      <p className="text-[11px] text-slate-300 font-medium">
                        Instructor: <strong className="text-white">{c.trainerName}</strong>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono">⏱ {c.duration}</span>
                      <Link
                        to={`/trainee/course/${c.id}`}
                        className="apple-btn-primary text-xs px-4 py-2 font-bold flex items-center gap-1.5"
                      >
                        <span>Start Learning</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredCourses.map((c) => (
                <div key={c.id} className="card overflow-hidden flex flex-col justify-between group hover:border-[#2997ff]/50 transition">
                  <div>
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={c.thumbnail || (c.id === "c-dsa" || c.title.toLowerCase().includes("data structure") ? "/thumbnails/dsa-course.jpg" : "/thumbnails/webdev-course.jpg")}
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallback = (c.id === "c-dsa" || c.title.toLowerCase().includes("data structure"))
                            ? "/thumbnails/dsa-course.jpg"
                            : "/thumbnails/webdev-course.jpg";
                          if (!target.src.endsWith(fallback)) {
                            target.src = fallback;
                          }
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <span className="badge-blue text-[8px]">{c.category}</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <h3 className="text-xs font-bold text-white line-clamp-2">{c.title}</h3>
                      <p className="text-[10px] text-slate-400">Instructor: {c.trainerName}</p>
                    </div>
                  </div>
                  <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">{c.duration}</span>
                    <Link
                      to={`/trainee/course/${c.id}`}
                      className="text-xs text-[#2997ff] font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <span>View Course</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Metrics & Operational Scale */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="glass-panel p-6 sm:p-8 border border-white/15 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Platform Scale & Operational Impact</h2>
              <p className="text-[11px] text-slate-400">Institutional training metrics measured across active departments</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                { num: "12,450+", label: "Certified Professionals", sub: "Active workforce trainees", icon: Users, color: "#2997ff" },
                { num: "98.4%", label: "Proctoring Integrity", sub: "Zero-tolerance anti-cheat", icon: ShieldCheck, color: "#30d158" },
                { num: "100%", label: "Verifiable QR Credentials", sub: "SHA-256 digital proof", icon: Award, color: "#ff9f0a" },
                { num: "48+", label: "Capacity Domains", sub: "Cloud, AI & Leadership", icon: Brain, color: "#bf5af2" }
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
                  <stat.icon className="w-5 h-5 mx-auto mb-1 text-[#2997ff]" />
                  <p className="text-xl sm:text-2xl font-black text-white tracking-tight">{stat.num}</p>
                  <p className="text-xs font-semibold text-slate-300">{stat.label}</p>
                  <p className="text-[9px] text-slate-500">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        

        {/* FAQ Accordion */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-[11.5px] text-slate-400">
              Answers to common questions regarding capacity workflows, proctored exams, and certification.
            </p>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={"rounded-xl overflow-hidden border transition-all " + (isOpen ? "border-[#2997ff]/40 bg-[#0071e3]/[0.08]" : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]")}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-white flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-[#2997ff] shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown className={"w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform " + (isOpen ? "rotate-180 text-[#2997ff]" : "")} />
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3 pt-1 text-[11px] text-slate-300 leading-relaxed border-t border-white/5 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>



        {/* Monthly Capacity Bulletin Newsletter */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="card p-6 sm:p-8 border-[#2997ff]/30 bg-gradient-to-r from-blue-950/30 to-purple-950/20 text-center space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/20 text-[#2997ff] flex items-center justify-center mx-auto">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Subscribe to Monthly Capacity Bulletins & Exam Schedules
              </h2>
              <p className="text-xs text-slate-300 max-w-lg mx-auto">
                Get official notifications regarding upcoming live masterclasses, certification deadlines, and skill mapping digests.
              </p>
            </div>

            {subscribed ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Subscribed successfully to monthly capacity briefings.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (subscribeEmail.trim()) setSubscribed(true);
                }}
                className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder="Enter your official email"
                  className="apple-input text-xs flex-1"
                />
                <button
                  type="submit"
                  className="apple-btn-primary px-5 py-2 text-xs font-semibold shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Subscribe
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Official Contact & Campus Helpdesk Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="glass-panel p-6 sm:p-8 border border-white/15 bg-gradient-to-b from-white/[0.04] to-black/60 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2997ff]/40 bg-[#0071e3]/10 text-[#2997ff] text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2997ff]" />
                  <span>Official Support & Campus Inquiries</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Have questions about courses, certifications, or faculty access?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Our coordinators are available to assist with onboarding, account approvals, and institutional collaborations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-[#0071e3]/20 text-[#2997ff] flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Official Email</span>
                    <a
                      href="mailto:capacityconnect.org@gmail.com"
                      className="text-xs font-semibold text-white hover:text-[#2997ff] transition break-all"
                    >
                      capacityconnect.org@gmail.com
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Campus Location</span>
                    <p className="text-xs font-semibold text-white leading-snug">
                      GGSIPU EDC BOYS HOSTEL
                    </p>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                      Guru Gobind Singh Indraprastha University<br />East Delhi Campus, Surajmal Vihar, Delhi - 110092
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="glass-panel p-8 sm:p-12 text-center space-y-4 border border-[#2997ff]/40 bg-gradient-to-r from-[#0071e3]/10 via-[#0a0d16] to-purple-900/20 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Start Building Organizational Capacity Today
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Join trainees and trainers participating in structured technical, leadership, and compliance programs.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="apple-btn-primary px-6 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="apple-btn-secondary px-6 py-2.5 text-xs sm:text-sm font-medium">
                Sign In to Portal
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ToastContainer />
    </div>
  );
};
export default HomePage;
