import React from 'react';

const PriorityBadge = ({ priority }) => {
  const getStyle = () => {
    switch (priority) {
      case 'Critical':
        return 'badge-priority-critical';
      case 'High':
        return 'badge-priority-high';
      case 'Medium':
        return 'badge-priority-medium';
      case 'Low':
        return 'badge-priority-low';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[68px] px-2.5 py-0.5 rounded text-xs font-medium border text-center select-none ${getStyle()}`}
    >
      {priority}
    </span>
  );
};

export default PriorityBadge;
