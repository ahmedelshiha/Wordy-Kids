import React from 'react';

export const Progress = ({ value, className, ...props }) => {
  return (
    <div
      className={`relative h-2 w-full overflow-hidden rounded-full bg-primary/20 ${className}`}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
};


