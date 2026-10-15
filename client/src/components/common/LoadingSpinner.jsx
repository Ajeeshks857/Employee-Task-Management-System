import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
