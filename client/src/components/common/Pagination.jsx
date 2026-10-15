import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 250, 'All'];

const Pagination = ({ pagination, onPageChange, onLimitChange, itemName = 'tasks' }) => {
  if (!pagination || pagination.total === 0) return null;

  const { page, totalPages, total, limit } = pagination;

  const isAll = limit >= total || String(limit).toLowerCase() === 'all';
  const start = isAll ? 1 : (page - 1) * limit + 1;
  const end = isAll ? total : Math.min(page * limit, total);

  // Generate page numbers
  const pages = [];
  const maxButtons = 5;
  let startPage = Math.max(1, page - 2);
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-600">
        <div>
          Showing <span className="font-semibold text-gray-900">{start}</span>-
          <span className="font-semibold text-gray-900">{end}</span> of{' '}
          <span className="font-semibold text-gray-900">{total}</span> {itemName}
        </div>

        {onLimitChange && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 pl-2 border-l border-gray-200">
            <span>Show:</span>
            <select
              value={isAll ? 'All' : limit}
              onChange={(e) =>
                onLimitChange(e.target.value === 'All' ? 'all' : Number(e.target.value))
              }
              className="py-1 px-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#83282f] cursor-pointer"
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!isAll && totalPages > 1 && (
        <div className="inline-flex items-center -space-x-px text-xs rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-2.5 py-1.5 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`px-3 py-1.5 border border-gray-300 font-medium cursor-pointer ${
                p === page
                  ? 'bg-[#83282f] border-[#83282f] text-white z-10'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-2.5 py-1.5 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
