import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  gradientBorder?: boolean;
  noPadding?: boolean;
  style?: React.CSSProperties;
}

export default function Card({ children, className = '', gradientBorder = false, noPadding = false, style }: CardProps) {
  return (
    <div className={`glass-card overflow-hidden relative ${gradientBorder ? 'pt-1' : ''} ${className}`} style={style}>
      {gradientBorder && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan via-sky-accent to-indigo-500" />
      )}
      <div className={`${noPadding ? '' : 'p-6'}`}>
        {children}
      </div>
    </div>
  );
}
