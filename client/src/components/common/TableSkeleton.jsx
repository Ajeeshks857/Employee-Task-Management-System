import React from 'react';

const TableSkeleton = ({ rows = 8, columns = 7 }) => {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#1f2328]">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-2.5">
                  <div className="h-3 bg-gray-700/80 rounded-full w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="h-11">
                {Array.from({ length: columns }).map((_, c) => (
                  <td key={c} className="px-4 py-2">
                    <div
                      className="h-3.5 rounded-full shimmer-loader shadow-2xs"
                      style={{
                        width: `${Math.max(35, ((c * 19 + r * 29) % 75) + 25)}%`,
                      }}
                    ></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableSkeleton;
