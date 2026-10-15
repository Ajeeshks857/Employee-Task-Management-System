import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';

const ActionMenu = ({ viewUrl, editUrl, canEdit = true, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, openUp: false });

  const calculatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 140;
    const menuHeight = 115;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight && rect.top > menuHeight;

    setPosition({
      top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: Math.max(12, rect.right - menuWidth),
      openUp,
    });
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen((prev) => !prev);
  };

  // Close on outside click, window resize, or scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (buttonRef.current && buttonRef.current.contains(e.target)) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setIsOpen(false);
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const menuDropdown = isOpen && (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
      className="w-36 bg-white rounded-lg shadow-2xl border border-gray-200 py-1 text-xs origin-top-right animate-fade-slide overflow-hidden font-sans"
      onClick={(e) => e.stopPropagation()}
    >
      {viewUrl && (
        <Link
          to={viewUrl}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium"
          onClick={() => setIsOpen(false)}
        >
          <Eye className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>View Details</span>
        </Link>
      )}

      {canEdit &&
        (onEdit || editUrl) &&
        (onEdit ? (
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
            className="flex items-center gap-2 w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium"
          >
            <Edit className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Edit</span>
          </button>
        ) : (
          <Link
            to={editUrl}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium"
            onClick={() => setIsOpen(false)}
          >
            <Edit className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Edit</span>
          </Link>
        ))}

      {onDelete && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            onDelete();
          }}
          className="flex items-center gap-2 w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors font-medium border-t border-gray-100"
        >
          <Trash2 className="w-3.5 h-3.5 shrink-0" />
          <span>Delete</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="inline-flex items-center justify-end">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`p-1.5 rounded-md transition-all ${
          isOpen
            ? 'bg-gray-200 text-gray-900 shadow-xs'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
        }`}
        title="More Actions"
        aria-label="More Actions"
        aria-expanded={isOpen}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && createPortal(menuDropdown, document.body)}
    </div>
  );
};

export default ActionMenu;
