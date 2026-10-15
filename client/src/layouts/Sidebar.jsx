import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employees', label: 'Employees', icon: Users },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 bg-[#121214] text-white flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-gray-800 ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-18' : 'md:w-60'}`}
      >
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-800/80">
          <Link
            to="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 overflow-hidden group w-full"
          >
            {/* Logo Mark */}
            <div className="w-9 h-9 rounded-lg bg-[#d2b68a] flex items-center justify-center text-[#121214] font-black text-lg shrink-0 shadow-sm group-hover:bg-[#e4cfb0] transition-colors">
              R
            </div>

            {/* Brand Title (hidden when collapsed) */}
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 transition-opacity duration-200">
                <span className="font-medium text-sm tracking-wider text-white leading-none truncate">
                  ROOTS <span className="text-[#d2b68a]">MEDIA</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-gray-400 font-normal mt-0.5 leading-tight truncate">
                  Marketing
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Middle: Navigation Items */}
        <div className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[15px] font-medium border-l-[3px] transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#1f2328] text-[#d2b68a] border-[#d2b68a] shadow-xs'
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1a1b1e]'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom: Collapse Toggle & System Badge */}
        <div className="p-3 border-t border-gray-800/80 space-y-2">
          {!isCollapsed && (
            <div className="px-2 py-1.5 rounded-md bg-[#1a1b1e] border border-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-medium text-gray-400 truncate">
                MERN System Online
              </span>
            </div>
          )}

          {/* Desktop Collapse / Expand Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-full py-2 text-gray-400 hover:text-white hover:bg-[#1a1b1e] rounded-lg transition-colors text-xs font-medium gap-2"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
