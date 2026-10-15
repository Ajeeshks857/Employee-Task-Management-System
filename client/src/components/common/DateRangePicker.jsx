import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, X, Clock, Check } from 'lucide-react';

const DateRangePicker = ({
  startDate = '',
  endDate = '',
  onChange,
  placeholder = 'Due: All Dates',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);
  const containerRef = useRef(null);

  useEffect(() => {
    setLocalStart(startDate);
    setLocalEnd(endDate);
  }, [startDate, endDate]);

  // Close on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const hasRange = Boolean(startDate || endDate);

  const getDisplayText = () => {
    if (startDate && endDate) {
      return `Due: ${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`;
    }
    if (startDate) {
      return `Due from ${formatDateLabel(startDate)}`;
    }
    if (endDate) {
      return `Due until ${formatDateLabel(endDate)}`;
    }
    return placeholder;
  };

  const handleApply = () => {
    onChange({ startDate: localStart, endDate: localEnd });
    setIsOpen(false);
  };

  const handleClear = (e) => {
    if (e) e.stopPropagation();
    setLocalStart('');
    setLocalEnd('');
    onChange({ startDate: '', endDate: '' });
    setIsOpen(false);
  };

  // Quick preset helper
  const applyPreset = (daysOffset, isFromToday = true) => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (daysOffset === 0) {
      // Today only
      setLocalStart(todayStr);
      setLocalEnd(todayStr);
      onChange({ startDate: todayStr, endDate: todayStr });
      setIsOpen(false);
      return;
    }

    if (daysOffset === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        .toISOString()
        .slice(0, 10);
      setLocalStart(firstDay);
      setLocalEnd(lastDay);
      onChange({ startDate: firstDay, endDate: lastDay });
      setIsOpen(false);
      return;
    }

    const targetDate = new Date();
    targetDate.setDate(today.getDate() + daysOffset);
    const targetStr = targetDate.toISOString().slice(0, 10);

    const start = isFromToday ? todayStr : targetStr;
    const end = isFromToday ? targetStr : todayStr;

    setLocalStart(start);
    setLocalEnd(end);
    onChange({ startDate: start, endDate: end });
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border bg-white transition-all duration-150 shadow-2xs focus:outline-none ${
          isOpen
            ? 'border-[#83282f] ring-2 ring-[#83282f]/10 shadow-xs'
            : hasRange
              ? 'border-gray-300 text-gray-900 bg-gray-50/50'
              : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50/30'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <Calendar
            className={`w-4 h-4 shrink-0 ${hasRange ? 'text-[#83282f]' : 'text-gray-400'}`}
          />
          <span
            className={`truncate ${hasRange ? 'font-semibold text-gray-900' : 'text-gray-500'}`}
          >
            {getDisplayText()}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {hasRange && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e)}
              className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
              title="Clear date filter"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-gray-700' : ''
            }`}
          />
        </div>
      </button>

      {/* Animated Popover Menu */}
      {isOpen && (
        <div
          role="dialog"
          className="absolute right-0 sm:left-0 mt-1.5 w-76 sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-40 origin-top animate-fade-slide overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 font-sans">
              Due Date Filter
            </span>
            {hasRange && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Presets */}
          <div className="py-3">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Quick Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset(0)}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => applyPreset(7)}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Next 7 Days
              </button>
              <button
                type="button"
                onClick={() => applyPreset(30)}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Next 30 Days
              </button>
              <button
                type="button"
                onClick={() => applyPreset('month')}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                This Month
              </button>
            </div>
          </div>

          <div className="h-px bg-gray-100 mb-3" />

          {/* Custom Date Inputs */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Custom Range
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={localStart}
                  onChange={(e) => setLocalStart(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#83282f] focus:border-[#83282f] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={localEnd}
                  onChange={(e) => setLocalEnd(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#83282f] focus:border-[#83282f] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 text-xs font-semibold bg-[#83282f] hover:bg-[#6e2127] text-white rounded-md shadow-xs transition-colors"
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
