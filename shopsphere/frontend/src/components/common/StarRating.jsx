import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, maxStars = 5, interactive = false, onRate = null, size = 'sm' }) => {
  const [hovered, setHovered] = React.useState(0);

  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = interactive ? (hovered || rating) > i : rating > i;
        return (
          <Star
            key={i}
            className={`${sizes[size]} transition-colors ${
              filled ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-100'
            } ${interactive ? 'cursor-pointer hover:scale-110' : ''}`}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onRate && onRate(i + 1)}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
