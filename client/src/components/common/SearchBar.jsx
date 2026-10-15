import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = 'Search...',
  buttonText = 'Search',
  className = '',
  showButton = true,
}) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className={`flex items-center gap-2 w-full ${className}`}
    >
      <div className="relative flex-1 min-w-0">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder}
          value={value || ''}
          onChange={onChange}
          className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#83282f]/20 focus:border-[#83282f] transition-all shadow-2xs"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Clear search"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {showButton && (
        <button
          type="submit"
          className="px-4 py-2 bg-[#83282f] hover:bg-[#6e2127] text-white rounded-lg text-sm font-semibold transition-colors shadow-xs shrink-0 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#83282f]/40"
        >
          <Search className="w-3.5 h-3.5 hidden sm:inline" />
          <span>{buttonText}</span>
        </button>
      )}
    </form>
  );
};

export default SearchBar;
