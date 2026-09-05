import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, Filter, Play, CheckCircle2, ArrowRight } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCoursesStore } from "../../store/coursesStore";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";

export const CourseCatalog: React.FC = () => {
  const { courses, enrollments, enroll } = useCoursesStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const availableCategories = ["All", ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean)))];

  const filteredCourses = courses.filter((c) => {
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
      c.tags?.some((t) => t.toLowerCase().includes(term));

    return matchesCat && matchesSearch;
  });

  const traineeId = currentUser?.id || "u-trainee-1";

  const handleEnroll = (courseId: string) => {
    enroll(traineeId, courseId);
    addToast("Successfully enrolled in course!", "success");
  };

  return (
    <DashboardLayout
      pageTitle="Course & Curriculum Catalog"
      breadcrumbs={[{ label: "Home", to: "/" }, { label: "Courses" }]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses, tags, technologies..."
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
                className={"px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition " + (selectedCategory === cat ? "bg-[#0071e3] text-white" : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/10")}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((c) => {
            const isEnrolled = enrollments.some((e) => e.traineeId === traineeId && e.courseId === c.id);

            return (
              <div key={c.id} className="card overflow-hidden flex flex-col justify-between group hover:border-[#2997ff]/50 transition">
                <div>
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="badge-blue text-[8px]">{c.category}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-bold text-white line-clamp-2">{c.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                    <p className="text-[10px] text-slate-400">Instructor: {c.trainerName} • {c.duration}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-between">
                  <span className="badge-blue text-[8px]">{c.level}</span>
                  {isEnrolled ? (
                    <Link
                      to={`/trainee/course/${c.id}`}
                      className="apple-btn-primary text-xs px-3 py-1.5 font-semibold flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-white" /> Learn →
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleEnroll(c.id)}
                      className="apple-btn-secondary text-xs px-3 py-1.5 font-semibold cursor-pointer"
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};
export default CourseCatalog;
