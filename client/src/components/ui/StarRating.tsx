import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ rating, max = 5, interactive = false, onChange, size = 'md' }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center space-x-1">
      {[...Array(max)].map((_, i) => {
        const value = i + 1;
        const isFilled = value <= (hover ?? rating);
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}`}
            onMouseEnter={() => interactive && setHover(value)}
            onMouseLeave={() => interactive && setHover(null)}
            onClick={() => interactive && onChange?.(value)}
          >
            <Star
              className={`${sizes[size]} ${isFilled ? 'fill-amber-400 text-amber-400' : 'fill-slate-800 text-slate-700'}`}
            />
          </button>
        );
      })}
    </div>
  );
}
