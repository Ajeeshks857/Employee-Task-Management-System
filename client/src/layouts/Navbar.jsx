import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare } from 'lucide-react';

const Navbar = () => {
  const navLinkClass = ({ isActive }) =>
    `px-3.5 py-1.5 rounded text-[15px] font-medium transition-all flex items-center gap-2 ${
      isActive
        ? 'bg-[#1f2328] text-[#d2b68a] font-semibold border-b-2 border-[#d2b68a]'
        : 'text-gray-300 hover:text-[#d2b68a] hover:bg-[#1a1b1e]'
    }`;

  return (
    <header className="bg-[#121214] text-white shadow-md border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Roots Media Brand & Navigation */}
        <div className="flex items-center gap-6 sm:gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="w-2.5 h-6 bg-[#d2b68a] rounded-sm group-hover:bg-[#e4cfb0] transition-colors"></span>
            <div className="flex flex-col">
              <span className="font-black text-base sm:text-lg tracking-wider text-white leading-none">
                ROOTS <span className="text-[#d2b68a]">MEDIA</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold leading-tight">
                Marketing
              </span>
            </div>
          </Link>

          <nav className="flex items-center space-x-1 sm:space-x-2">
            <NavLink to="/" className={navLinkClass}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/employees" className={navLinkClass}>
              <Users className="w-4 h-4" />
              <span>Employees</span>
            </NavLink>
            <NavLink to="/tasks" className={navLinkClass}>
              <CheckSquare className="w-4 h-4" />
              <span>Tasks</span>
            </NavLink>
          </nav>
        </div>

        {/* System Title Badge */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-300 bg-[#1a1b1e] px-3 py-1.5 rounded-full border border-gray-800">
          <span className="w-2 h-2 rounded-full bg-[#d2b68a] animate-pulse"></span>
          <span>Employee & Task Management System</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
