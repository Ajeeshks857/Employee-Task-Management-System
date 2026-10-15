import React from 'react';

const StatusBadge = ({ status, isOverdue = false }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Completed':
        return 'badge-status-completed';
      case 'In Progress':
        return 'badge-status-in-progress';
      case 'Todo':
        return 'badge-status-todo';
      case 'Cancelled':
        return 'badge-status-cancelled';
      case 'Active':
        return 'badge-status-active';
      case 'Inactive':
        return 'badge-status-inactive';
      case 'On Leave':
        return 'badge-status-on-leave';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className={`px-2.5 py-0.5 rounded text-xs font-semibold tracking-wide shadow-xs ${getBadgeStyle()}`}
      >
        {status}
      </span>
      {isOverdue && (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white shadow-xs">
          Overdue
        </span>
      )}
    </div>
  );
};

export default StatusBadge;
