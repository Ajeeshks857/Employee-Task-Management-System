import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorBanner = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div
      className={`p-3 bg-[#fdf2f2] border border-[#f8b4b4] rounded text-xs text-[#9b1c1c] font-medium leading-relaxed animate-fade-in flex items-start gap-2.5 ${className}`}
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
      <span>{message}</span>
    </div>
  );
};

export default ErrorBanner;
