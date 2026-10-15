import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

const CustomSelect = ({
  value,
  onChange,
  placeholder = 'Select...',
  options = [],
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options to { value, label }
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'object' ? opt : { value: opt, label: opt }
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close on click outside
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

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border bg-white transition-all duration-150 shadow-2xs focus:outline-none ${
          isOpen
            ? 'border-[#83282f] ring-2 ring-[#83282f]/10 shadow-xs'
            : value
              ? 'border-gray-300 text-gray-900 bg-gray-50/50'
              : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50/30'
        }`}
      >
        <span className="truncate">
          {selectedOption ? (
            <span className="font-semibold text-gray-900">{selectedOption.label}</span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e)}
              className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
              title="Clear selection"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-gray-700' : ''
            }`}
          />
        </div>
      </button>

      {/* Animated Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 mt-1.5 w-full min-w-[170px] bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 z-40 origin-top animate-fade-slide overflow-hidden max-h-60 overflow-y-auto"
        >
          {/* Default "All" / Clear option */}
          <button
            type="button"
            role="option"
            aria-selected={!value}
            onClick={() => handleSelect('')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm text-left transition-colors ${
              !value
                ? 'bg-[#83282f]/10 text-[#83282f] font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span>All {placeholder}</span>
            {!value && <Check className="w-3.5 h-3.5 text-[#83282f]" />}
          </button>

          <div className="h-px bg-gray-100 my-1" />

          {/* Options */}
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm text-left transition-colors ${
                  isSelected
                    ? 'bg-[#83282f]/10 text-[#83282f] font-bold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#83282f] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
