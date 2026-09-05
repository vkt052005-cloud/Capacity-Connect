import { getCourseThumbnail } from "../../utils/courseThumbnail";
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen } from 'lucide-react';
import type { Course, Enrollment } from '../../types';
import clsx from 'clsx';

interface CourseCardProps {
  course: Course;
  enrollment?: Enrollment;
  showEnrollButton?: boolean;
  onEnroll?: (courseId: string) => void;
  viewPath?: string;
}

const levelColors = {
  Beginner: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/50',
  Intermediate: 'bg-amber-950/70 text-amber-300 border-amber-800/50',
  Advanced: 'bg-rose-950/70 text-rose-300 border-rose-800/50',
};

const categoryColors: Record<string, string> = {
  Technical: 'bg-indigo-950/70 text-indigo-300 border-indigo-800/50',
  Leadership: 'bg-purple-950/70 text-purple-300 border-purple-800/50',
  Communication: 'bg-pink-950/70 text-pink-300 border-pink-800/50',
  Compliance: 'bg-amber-950/70 text-amber-300 border-amber-800/50',
  'Soft Skills': 'bg-teal-950/70 text-teal-300 border-teal-800/50',
  Domain: 'bg-blue-950/70 text-blue-300 border-blue-800/50',
};

export const CourseCard: React.FC<CourseCardProps> = ({
  course, enrollment, showEnrollButton, onEnroll, viewPath
}) => {
  return (
    <div className="bg-[#101424] rounded-2xl border border-[#1e2540] overflow-hidden hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all group flex flex-col">
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#12172b] to-[#1c2340]">
        {course.thumbnail || true ? (
          <img
            src={getCourseThumbnail(course)}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
            onError={e => {
              const target = e.currentTarget;
              const fallback = getCourseThumbnail(course);
              if (!target.src.endsWith(fallback)) {
                target.src = fallback;
              }
            }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101424] via-[#101424]/30 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={clsx('badge', categoryColors[course.category] || 'badge-blue')}>
            {course.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={clsx('badge', levelColors[course.level])}>{course.level}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-white line-clamp-2 leading-snug text-sm group-hover:text-indigo-300 transition-colors">
          {course.title}
        </h3>
        <p className="text-[11px] text-slate-400 mt-1">by {course.trainerName}</p>
        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{course.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {course.tags.slice(0, 3).map(tag => (
            <span key={tag} className="badge-gray text-[10px]">{tag}</span>
          ))}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-500" />{course.duration}</span>
          <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-slate-500" />{course.resources.length} resources</span>
        </div>

        {/* Progress bar */}
        {enrollment && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400">Progress</span>
              <span className="text-[11px] font-medium text-indigo-400">{enrollment.progress}%</span>
            </div>
            <div className="w-full bg-[#171d33] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 rounded-full transition-all shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                style={{ width: `${enrollment.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-4 flex gap-2">
          {viewPath && (
            <Link to={viewPath} className="flex-1 btn-primary text-center">
              {enrollment ? 'Continue' : 'View Course'}
            </Link>
          )}
          {showEnrollButton && !enrollment && onEnroll && (
            <button onClick={() => onEnroll(course.id)} className="flex-1 btn-primary">
              Enroll Now
            </button>
          )}
          {enrollment?.completedAt && (
            <span className="badge-green text-[11px] px-3 py-1.5 ml-auto flex items-center gap-1">
              ✓ Completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
