import React from 'react';
import clsx from 'clsx';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  subtitle?: string;
  trend?: { value: number; positive: boolean };
}

const colorMap = {
  blue: 'bg-indigo-950/60 text-indigo-400 border-indigo-800/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]',
  green: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
  purple: 'bg-purple-950/60 text-purple-400 border-purple-800/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
  orange: 'bg-amber-950/60 text-amber-400 border-amber-800/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
  red: 'bg-rose-950/60 text-rose-400 border-rose-800/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
};

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon: Icon, color = 'blue', subtitle, trend }) => {
  return (
    <div className="card hover:border-[#2e375c] transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-[11px] text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={clsx('text-[11px] font-medium mt-1', trend.positive ? 'text-emerald-400' : 'text-rose-400')}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center border', colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
export default StatsCard;
