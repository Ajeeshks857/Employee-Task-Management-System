import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
      {/* Title Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 bg-gray-200 rounded-lg w-48 mb-2"></div>
          <div className="h-3.5 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded-lg w-28"></div>
      </div>

      {/* Row 1: Employee Metrics Skeleton Grid */}
      <div className="space-y-2.5">
        <div className="h-4 bg-gray-200 rounded w-40"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 px-3 py-2.5 shadow-2xs space-y-2"
            >
              <div className="flex justify-between items-center">
                <div className="h-2.5 bg-gray-200 rounded w-20"></div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
              <div className="h-2 bg-gray-100 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Task Metrics Skeleton Grid */}
      <div className="space-y-2.5">
        <div className="h-4 bg-gray-200 rounded w-36"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 px-3 py-2.5 shadow-2xs space-y-2"
            >
              <div className="flex justify-between items-center">
                <div className="h-2.5 bg-gray-200 rounded w-14"></div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-10"></div>
              <div className="h-2 bg-gray-100 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Workload Table Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#121214] px-6 py-4 flex justify-between items-center">
          <div className="h-4 bg-gray-700 rounded w-44"></div>
          <div className="h-3 bg-gray-800 rounded w-36"></div>
        </div>
        <div className="p-6 space-y-3.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center py-2 border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="h-3.5 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-3.5 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-28"></div>
              <div className="h-5 bg-gray-200 rounded w-7"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
