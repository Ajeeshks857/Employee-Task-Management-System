import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';

const EmployeeStatusDropdown = ({ employee, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 130 });
  const buttonRef = useRef(null);

  const ALL_STATUSES = ['Active', 'Inactive', 'On Leave'];
  const nextStatuses = ALL_STATUSES.filter((s) => s !== employee.status);

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: Math.max(130, rect.width),
      });
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updateCoords();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    const handleClickOutside = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        const portalEl = document.getElementById(`emp-status-portal-${employee._id}`);
        if (!portalEl || !portalEl.contains(e.target)) {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, employee._id]);

  const handleSelect = async (newStatus) => {
    setIsOpen(false);
    if (newStatus === employee.status) return;
    setLoading(true);
    try {
      await onStatusChange(employee._id, newStatus);
    } finally {
      setLoading(false);
    }
  };

  const getButtonBg = () => {
    switch (employee.status) {
      case 'Active':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs';
      case 'Inactive':
        return 'bg-slate-500 hover:bg-slate-600 text-white shadow-xs';
      case 'On Leave':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white shadow-xs';
    }
  };

  const getOptionDotColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500';
      case 'Inactive':
        return 'bg-slate-500';
      case 'On Leave':
        return 'bg-amber-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        disabled={loading}
        onClick={handleToggle}
        className={`inline-flex items-center justify-between gap-1.5 w-[96px] px-2.5 py-0.5 rounded text-xs font-semibold tracking-wide transition-all focus:outline-none cursor-pointer ${getButtonBg()}`}
        title={`Click to change status (Current: ${employee.status})`}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin mr-1" />
        ) : (
          <span>{employee.status}</span>
        )}
        <span className="text-[8px] leading-none select-none opacity-80">▼</span>
      </button>

      {isOpen &&
        createPortal(
          <div
            id={`emp-status-portal-${employee._id}`}
            style={{
              position: 'absolute',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              minWidth: `${coords.width}px`,
            }}
            className="rounded-lg shadow-xl bg-white border border-gray-200/90 z-[9999] py-1 text-xs animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
          >
            <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100">
              Change Status
            </div>
            {nextStatuses.map((statusOption) => (
              <button
                key={statusOption}
                type="button"
                onClick={() => handleSelect(statusOption)}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900 transition-colors block text-xs"
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${getOptionDotColor(statusOption)}`}
                />
                <span>{statusOption}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

export default EmployeeStatusDropdown;
