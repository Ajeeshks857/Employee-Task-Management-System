import React, { useEffect, useState } from 'react';

const StatCard = ({
  label,
  value = 0,
  icon: Icon,
  iconBg = 'bg-gray-100 text-gray-700',
  textColor = 'text-gray-900',
  badge,
  badgeType = 'neutral',
  subtext,
}) => {
  // Running count-up animation using requestAnimationFrame
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const end = Number(value) || 0;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }

    let startTimestamp = null;
    const duration = 700; // ms
    let animationFrame;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Cubic ease-out
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(easeOut * end));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(end);
      }
    };

    animationFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [value]);

  const badgeStyles = {
    neutral: 'bg-gray-100 text-gray-600 border-gray-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    gold: 'bg-[#d2b68a]/15 text-[#8a6d3b] border-[#d2b68a]/40',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200/90 px-3 py-2.5 shadow-2xs hover:border-gray-300 hover:shadow-xs transition-all duration-150 flex flex-col justify-between">
      {/* Top Header Row: Label + Icon */}
      <div className="flex items-center justify-between gap-1.5 mb-1">
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-gray-500 font-sans truncate">
          {label}
        </span>
        {Icon && (
          <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Main Metric Row: Animated Count + Badge */}
      <div className="flex items-baseline justify-between gap-1.5 mt-0.5">
        <div className={`text-xl sm:text-2xl font-bold tracking-tight leading-none ${textColor}`}>
          {displayValue}
        </div>
        {badge && (
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border leading-none ${
              badgeStyles[badgeType] || badgeStyles.neutral
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Subtext */}
      {subtext && (
        <div className="mt-1 text-[10px] text-gray-400 font-medium truncate leading-tight">
          {subtext}
        </div>
      )}
    </div>
  );
};

export default StatCard;
