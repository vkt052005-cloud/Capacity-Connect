import { getCourseThumbnail } from "../../utils/courseThumbnail";
import { formatCourseDuration } from "../../utils/courseDuration";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Search, Filter, Play, CheckCircle2, ArrowRight, Lock, Sparkles, GraduationCap } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCoursesStore } from "../../store/coursesStore";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { initialCourses } from "../../data/seed";

export const CourseCatalog: React.FC = () => {
  const { courses, enrollments, enroll, unenroll } = useCoursesStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const allCourses = courses && courses.length > 0 ? courses : initialCourses;

  const availableCategories = ["All", ...Array.from(new Set(allCourses.map((c) => c.category).filter(Boolean)))];

  const filteredCourses = allCourses.filter((c) => {
    const matchesCat =
      selectedCategory === "All" ||
      c.category === selectedCategory ||
      c.tags?.some((t) => t.toLowerCase() === selectedCategory.toLowerCase());

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      c.title.toLowerCase().includes(term) ||
      c.category.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term) ||
      c.trainerName?.toLowerCase().includes(term) ||
      c.tags?.some((t) => t.toLowerCase().includes(term));

    return matchesCat && matchesSearch;
  });

  const handleEnroll = (courseId: string) => {
    if (!currentUser) {
      addToast({
        title: "Login Required",
        message: "Please log in to watch this course and start learning.",
        type: "info"
      });
      navigate("/login", { state: { from: { pathname: `/trainee/course/${courseId}` } } });
      return;
    }
    enroll(currentUser.id, courseId);
    addToast({
      title: "Successfully Enrolled",
      message: "You have been enrolled in this course. You can now access all lectures.",
      type: "success"
    });
  };

  const handleUnenroll = (courseId: string, courseTitle: string) => {
    if (!currentUser) return;
    if (window.confirm(`Are you sure you want to unenroll from "${courseTitle}"?`)) {
      unenroll(currentUser.id, courseId);
      addToast({
        title: "Unenrolled from Course",
        message: `You have successfully unenrolled from ${courseTitle}.`,
        type: "info"
      });
    }
  };

  const handleWatchCourse = (courseId: string) => {
    if (!currentUser) {
      addToast({
        title: "Login Required to Watch",
        message: "Please log in to watch this course and access video lectures.",
        type: "info"
      });
      navigate("/login", { state: { from: { pathname: `/trainee/course/${courseId}` } } });
    } else {
      navigate(`/trainee/course/${courseId}`);
    }
  };

  return (
    <DashboardLayout
      pageTitle="Course & Curriculum Catalog"
      breadcrumbs={[{ label: "Home", to: "/" }, { label: "Course Catalog" }]}
    >
      <div className="space-y-6">
        {/* Open Catalog Banner for Unauthenticated Visitors */}
        {!currentUser && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-purple-950/30 border border-[#2997ff]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="badge-blue text-[9px] uppercase font-bold flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> Open Catalog
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {allCourses.length} Curriculums Available
                </span>
              </div>
              <h2 className="text-sm font-bold text-white">
                Browsing All Courses Uploaded by Verified Faculty
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                You can browse and inspect all course outlines and faculty profiles freely. To watch video lectures, track your syllabus progress, and earn verifiable certificates, please sign in.
              </p>
            </div>
            <Link
              to="/login"
              state={{ from: { pathname: "/trainee/courses" } }}
              className="apple-btn-primary text-xs px-5 py-2.5 font-bold shrink-0 shadow-lg flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Log In to Watch Courses</span>
            </Link>
          </div>
        )}

        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses, instructors, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="apple-input !pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={"px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition " + (selectedCategory === cat ? "bg-[#0071e3] text-white shadow-md" : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/10")}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Count Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <p>Showing <strong className="text-white font-mono">{filteredCourses.length}</strong> {filteredCourses.length === 1 ? "course" : "courses"}</p>
          {selectedCategory !== "All" && (
            <button
              onClick={() => setSelectedCategory("All")}
              className="text-[#2997ff] hover:underline cursor-pointer text-[11px]"
            >
              Clear filter ({selectedCategory})
            </button>
          )}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="p-12 text-center glass-panel border border-white/10 rounded-2xl space-y-3">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-white">No courses match your filter</p>
            <p className="text-xs text-slate-400">Try searching for a different keyword or selecting "All" categories.</p>
            <button
              onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}
              className="apple-btn-secondary text-xs px-4 py-2 mt-2 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((c) => {
              const isEnrolled = currentUser
                ? enrollments.some((e) => e.traineeId === currentUser.id && e.courseId === c.id)
                : false;

              return (
                <div
                  key={c.id}
                  className="card overflow-hidden flex flex-col justify-between group hover:border-[#2997ff]/50 transition shadow-lg"
                >
                  <div>
                    {/* Course Thumbnail */}
                    <div
                      onClick={() => handleWatchCourse(c.id)}
                      className="relative h-40 overflow-hidden cursor-pointer bg-slate-900"
                    >
                      <img
                        src={getCourseThumbnail(c)}
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallback = getCourseThumbnail(c);
                          if (!target.src.endsWith(fallback)) {
                            target.src = fallback;
                          }
                        }}
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <span className="badge-blue text-[8px]">{c.category}</span>
                      </div>
                      {!currentUser && (
                        <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[9px] text-slate-300 flex items-center gap-1 border border-white/10">
                          <Lock className="w-2.5 h-2.5 text-amber-400" />
                          <span>Login to watch</span>
                        </div>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="badge-green text-[8px]">
                          {c.lessons?.length || (c.id === 'c-dsa' ? 315 : (c.id === 'c6' ? 139 : 10))} Lessons
                        </span>
                        <span className="text-amber-400 font-mono">⭐ {c.rating || 4.9}</span>
                        <span className="text-slate-500 font-mono">• {formatCourseDuration(c)}</span>
                      </div>

                      <h3
                        onClick={() => handleWatchCourse(c.id)}
                        className="text-sm font-bold text-white line-clamp-2 cursor-pointer group-hover:text-[#2997ff] transition"
                      >
                        {c.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>

                      <p className="text-[11px] text-slate-300 pt-1">
                        Instructor: <strong className="text-white">{c.trainerName}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-between mt-2">
                    <span className="badge-blue text-[8px]">{c.level}</span>

                    {currentUser ? (
                      currentUser.role === "trainee" ? (
                        isEnrolled ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUnenroll(c.id, c.title)}
                              className="text-[11px] text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded-lg border border-white/10 hover:border-rose-500/30 transition cursor-pointer"
                              title="Unenroll from this course"
                            >
                              Unenroll
                            </button>
                            <Link
                              to={`/trainee/course/${c.id}`}
                              className="apple-btn-primary text-xs px-3.5 py-1.5 font-semibold flex items-center gap-1 shadow-md"
                            >
                              <Play className="w-3 h-3 fill-white" /> Learn →
                            </Link>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEnroll(c.id)}
                            className="apple-btn-secondary text-xs px-3.5 py-1.5 font-semibold cursor-pointer hover:border-white/30 transition"
                          >
                            Enroll Now
                          </button>
                        )
                      ) : (
                        <Link
                          to={`/trainee/course/${c.id}`}
                          className="apple-btn-secondary text-xs px-3.5 py-1.5 font-semibold flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" /> Preview Course
                        </Link>
                      )
                    ) : (
                      <button
                        onClick={() => handleWatchCourse(c.id)}
                        className="apple-btn-primary text-xs px-3.5 py-1.5 font-semibold flex items-center gap-1.5 cursor-pointer bg-[#0071e3] hover:bg-[#0077ed] shadow-md transition"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Log In to Watch</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
export default CourseCatalog;
