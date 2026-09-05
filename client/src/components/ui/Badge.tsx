import React from 'react';

type BadgeColor = 'cyan' | 'green' | 'amber' | 'red' | 'violet' | 'slate';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
  icon?: React.ReactNode;
}

export default function Badge({ children, color = 'cyan', className = '', icon }: BadgeProps) {
  const colorStyles = {
    cyan: 'bg-cyan/10 text-cyan border-cyan/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    slate: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorStyles[color]} ${className}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
}
