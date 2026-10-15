import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

const alignMap = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const justifyMap = {
  left: 'justify-start',
  center: 'justify-center mx-auto',
  right: 'justify-end ml-auto',
};

const SortableHeader = ({
  label,
  field,
  currentSortBy,
  currentSortOrder,
  onSort,
  align = 'left',
  className = '',
}) => {
  const isActive = currentSortBy === field;
  const thAlignClass = alignMap[align] || 'text-left';
  const btnJustifyClass = justifyMap[align] || 'justify-start';

  return (
    <th
      className={`px-4 py-2.5 ${thAlignClass} text-xs font-medium whitespace-nowrap select-none ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1.5 py-0.5 rounded transition-colors group cursor-pointer focus:outline-none ${btnJustifyClass} ${
          isActive ? 'text-white font-semibold' : 'text-gray-300 hover:text-white'
        }`}
        title={`Sort by ${label} (${
          isActive ? (currentSortOrder === 'asc' ? 'Ascending' : 'Descending') : 'Click to sort'
        })`}
      >
        <span>{label}</span>
        <span className="inline-flex items-center">
          {isActive ? (
            currentSortOrder === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-[#d2b68a] stroke-[2.5]" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-[#d2b68a] stroke-[2.5]" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity" />
          )}
        </span>
      </button>
    </th>
  );
};

export default SortableHeader;
