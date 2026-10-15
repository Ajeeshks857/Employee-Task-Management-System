import React, { useState } from 'react';
import Sidebar from './Sidebar';
import BreadcrumbBar from './BreadcrumbBar';
import { Menu } from 'lucide-react';

const AppLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#121214] text-gray-900 flex overflow-x-hidden font-sans">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-[#121214]">
        <header className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-8 bg-[#121214] text-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block w-2 h-4 bg-[#d2b68a] rounded-xs"></span>
              <span className="text-sm font-bold tracking-wide text-gray-200">
                Roots Media Marketing
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-[#d2b68a] animate-pulse"></span>
            <span className="hidden sm:inline font-medium">Employee & Task Management</span>
          </div>
        </header>

        <main className="flex-1 bg-[#f4f5f7] sm:rounded-tl-[28px] overflow-y-scroll [scrollbar-gutter:stable] shadow-2xl relative flex flex-col">
          <BreadcrumbBar />
          <div className="flex-1 min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
