import React from 'react';
import { Bell } from 'lucide-react';

export default function NoticeRibbon() {
  return (
    <div className="bg-gradient-to-r from-amber-900/40 via-amber-700/20 to-amber-900/40 border-b border-amber-500/20 overflow-hidden py-2 relative flex items-center">
      <div className="container mx-auto px-4 flex items-center relative z-10">
        <div className="flex items-center space-x-2 mr-4 shrink-0 bg-amber-900/50 px-2 py-1 rounded text-amber-400 text-xs font-bold border border-amber-500/30">
          <Bell className="w-3.5 h-3.5" />
          <span>Notice</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="animate-ticker inline-block text-sm text-amber-100/90 font-medium">
            Nominations active for Numerical Weather Prediction & Radar Meteorology Batch 2026 • Last date: Sept 15
          </div>
        </div>
      </div>
    </div>
  );
}
