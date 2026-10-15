import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';

const routeNameMap = {
  '': 'Dashboard',
  employees: 'Employees',
  tasks: 'Tasks',
  new: 'New',
  edit: 'Edit',
};

const BreadcrumbBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      // Safe fallback navigation
      if (pathname.startsWith('/employees')) {
        navigate('/employees');
      } else if (pathname.startsWith('/tasks')) {
        navigate('/tasks');
      } else {
        navigate('/');
      }
    }
  };

  // Generate breadcrumb items
  const pathSegments = pathname.split('/').filter(Boolean);

  const breadcrumbs = [{ label: 'Home', path: '/', isHome: true }];

  if (pathSegments.length === 0) {
    breadcrumbs.push({
      label: 'Dashboard',
      path: '/',
      isCurrent: true,
    });
  } else {
    let currentPath = '';
    pathSegments.forEach((segment, idx) => {
      currentPath += `/${segment}`;
      const isLast = idx === pathSegments.length - 1;

      let label = routeNameMap[segment];
      if (!label) {
        if (segment.match(/^[0-9a-fA-F]{24}$/)) {
          label = 'Details';
        } else if (segment.startsWith('emp-') || segment.startsWith('tsk-')) {
          const parts = segment.split('-');
          if (parts.length >= 2) {
            const prefix = `${parts[0].toUpperCase()}-${parts[1].toUpperCase()}`;
            const rest = parts
              .slice(2)
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');
            label = rest ? `${prefix}: ${rest}` : prefix;
          } else {
            label = segment.toUpperCase();
          }
        } else {
          label = segment.charAt(0).toUpperCase() + segment.slice(1);
        }
      }

      breadcrumbs.push({
        label,
        path: currentPath,
        isCurrent: isLast,
      });
    });
  }

  return (
    <div className="bg-white/95 backdrop-blur-xs border-b border-gray-200/80 px-4 sm:px-8 py-2.5 flex items-center justify-between sm:rounded-tl-[28px] sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 shadow-2xs transition-all active:scale-95 shrink-0 focus:outline-none focus:ring-1 focus:ring-[#83282f] cursor-pointer"
          title="Go back to previous page"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        {/* Divider */}
        <div className="h-4 w-px bg-gray-200 shrink-0" />

        {/* Breadcrumb Navigation Trail */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center space-x-1.5 text-xs text-gray-500 overflow-x-auto py-0.5"
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;

            return (
              <React.Fragment key={crumb.path + idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                {isLast ? (
                  <span className="font-medium text-gray-900 truncate" aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="hover:text-[#83282f] hover:underline flex items-center gap-1 transition-colors shrink-0 font-normal"
                  >
                    {crumb.isHome && <Home className="w-3.5 h-3.5 text-gray-400" />}
                    <span>{crumb.label}</span>
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Current page indicator pill */}
      <div className="hidden md:flex items-center gap-2">
        <span className="text-[11px] font-medium text-gray-400">Roots Media Portal</span>
      </div>
    </div>
  );
};

export default BreadcrumbBar;
