import React, { useState } from "react";
import {
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Sparkles,
  Layers, FileText, CheckCircle2, Download, Presentation
} from "lucide-react";
import { SlideItem } from "../../types";
import { useAppStore } from "../../store/appStore";

interface SlideDeckViewerProps {
  slides: SlideItem[];
  title: string;
  version?: string;
}

export const SlideDeckViewer: React.FC<SlideDeckViewerProps> = ({
  slides = [],
  title,
  version = "v2.0"
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const { addToast } = useAppStore();

  if (slides.length === 0) {
    return (
      <div className="p-8 text-center glass-panel text-slate-400 text-xs">
        <Presentation className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        No presentation slides uploaded for this module.
      </div>
    );
  }

  const currentSlide = slides[currentSlideIndex];

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  return (
    <div className={"space-y-4 " + (isFullScreen ? "fixed inset-0 z-50 p-6 bg-black flex flex-col justify-between" : "")}>
      {/* Slide Canvas */}
      <div className="relative rounded-2xl glass-panel border border-white/15 overflow-hidden bg-gradient-to-b from-[#0e111a] to-[#08090e] shadow-2xl p-6 sm:p-10 min-h-[380px] flex flex-col justify-between">
        {/* Slide Top Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="badge-blue text-[10px]">SLIDE {currentSlide.slideNumber} / {slides.length}</span>
            <span className="text-xs font-semibold text-slate-300 truncate max-w-xs">{title}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono">{version}</span>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={"p-1.5 rounded-lg text-xs transition " + (showNotes ? "bg-[#0071e3] text-white" : "text-slate-400 hover:text-white bg-white/5")}
              title="Toggle Speaker Notes"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5 transition"
              title="Toggle Fullscreen Presentation"
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Slide Core Content */}
        <div className="my-auto space-y-5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
            {currentSlide.title}
          </h2>

          <div className="grid grid-cols-1 gap-2.5">
            {currentSlide.bullets.map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="w-2 h-2 rounded-full bg-[#2997ff] mt-1.5 shrink-0 shadow-sm shadow-blue-400" />
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">{bullet}</p>
              </div>
            ))}
          </div>

          {currentSlide.keyConcept && (
            <div className="p-3.5 rounded-xl bg-[#0071e3]/10 border border-[#2997ff]/30 text-xs text-slate-200 flex items-start gap-2.5 mt-4">
              <Sparkles className="w-4 h-4 text-[#2997ff] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Core Insight:</strong> {currentSlide.keyConcept}
              </div>
            </div>
          )}

          {showNotes && currentSlide.notes && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 mt-2">
              <strong>Instructor Notes:</strong> {currentSlide.notes}
            </div>
          )}
        </div>

        {/* Slide Bottom Controls */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-6">
          <button
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="apple-btn-secondary text-xs px-3 py-1.5 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {/* Slide dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={"h-2 rounded-full transition-all " + (currentSlideIndex === idx ? "w-6 bg-[#2997ff]" : "w-2 bg-white/20 hover:bg-white/40")}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentSlideIndex === slides.length - 1}
            className="apple-btn-primary text-xs px-3 py-1.5 disabled:opacity-30 cursor-pointer"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
