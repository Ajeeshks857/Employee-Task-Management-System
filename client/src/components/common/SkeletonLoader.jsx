import React from 'react';

const SkeletonLoader = ({ lines = 3, className = '', lineClassName = 'h-3.5', gap = 'gap-2' }) => {
  return (
    <div className={`flex flex-col ${gap} w-full ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => {
        // Last line shorter width
        const isLast = idx === lines - 1;
        const widthStyle = isLast && lines > 1 ? { width: '48%' } : { width: '100%' };

        return (
          <div
            key={idx}
            style={widthStyle}
            className={`${lineClassName} rounded-full shimmer-loader shadow-2xs`}
          />
        );
      })}
    </div>
  );
};

export default SkeletonLoader;
