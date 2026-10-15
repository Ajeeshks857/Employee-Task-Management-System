import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from './StatCard';
import DashboardSkeleton from './DashboardSkeleton';
import {
  Users,
  UserCheck,
  UserX,
  CalendarOff,
  CheckSquare,
  ListTodo,
  Clock,
  CheckCircle2,
  Ban,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Briefcase,
} from 'lucide-react';

const DashboardView = ({ showNotification }) => {
  const [data, setData] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Dashboard | Roots Media Marketing';
    fetchMetrics(true);
  }, []);

  const fetchMetrics = async (isInitial = false) => {
    try {
      if (isInitial) {
        setInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      const res = await api.getDashboardMetrics();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      showNotification(err.message, 'error');
    } finally {
      setInitialLoading(false);
      setIsRefreshing(false);
    }
  };

  if (initialLoading) {
    return <DashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-fade-in">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-lg mx-auto shadow-sm">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Unable to load dashboard</h2>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
          <button
            onClick={fetchMetrics}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2 bg-[#83282f] hover:bg-[#6e2127] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { employees, tasks, employeeWorkload } = data;

  // Percentage calculations
  const empTotal = employees.total || 1;
  const activePct = Math.round((employees.active / empTotal) * 100);
  const inactivePct = Math.round((employees.inactive / empTotal) * 100);
  const onLeavePct = Math.round((employees.onLeave / empTotal) * 100);

  const taskTotal = tasks.total || 1;
  const todoPct = Math.round((tasks.todo / taskTotal) * 100);
  const inProgressPct = Math.round((tasks.inProgress / taskTotal) * 100);
  const completedPct = Math.round((tasks.completed / taskTotal) * 100);
  const cancelledPct = Math.round((tasks.cancelled / taskTotal) * 100);
  const overduePct = Math.round((tasks.overdue / taskTotal) * 100);

  // Helper for initials
  const getInitials = (name) => {
    if (!name) return 'EM';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Dashboard Overview
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d2b68a]/20 text-[#8a6d3b] border border-[#d2b68a]/40">
              Live Metrics
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time workforce capacity, task pipeline health, and workload distribution.
          </p>
        </div>

        <button
          onClick={() => fetchMetrics(false)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 active:scale-95 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          title="Refresh dashboard metrics"
        >
          <RotateCcw
            className={`w-3.5 h-3.5 transition-transform ${
              isRefreshing ? 'animate-spin text-[#83282f]' : 'text-gray-500'
            }`}
          />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Subtle top indicator bar when refreshing */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-[#83282f] animate-pulse z-50" />
      )}

      {/* Main Content with smooth in-place transition without jumping */}
      <div
        className={`space-y-8 transition-opacity duration-200 ${
          isRefreshing ? 'opacity-70 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Section 1: Employee Metrics */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-600" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Workforce Analytics
              </h2>
            </div>
            <Link
              to="/employees"
              className="text-xs font-semibold text-[#83282f] hover:text-[#6e2127] inline-flex items-center gap-1 hover:underline"
            >
              View all employees <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total Employees"
              value={employees.total}
              icon={Users}
              iconBg="bg-slate-100 text-slate-700"
              subtext="Registered workforce"
            />
            <StatCard
              label="Active"
              value={employees.active}
              icon={UserCheck}
              iconBg="bg-emerald-50 text-emerald-700"
              textColor="text-emerald-600"
              badge={`${activePct}%`}
              badgeType="success"
              subtext="Operational capacity"
            />
            <StatCard
              label="Inactive"
              value={employees.inactive}
              icon={UserX}
              iconBg="bg-slate-100 text-slate-600"
              textColor="text-slate-700"
              badge={`${inactivePct}%`}
              badgeType="neutral"
              subtext="Restricted assignment"
            />
            <StatCard
              label="On Leave"
              value={employees.onLeave}
              icon={CalendarOff}
              iconBg="bg-amber-50 text-amber-700"
              textColor="text-amber-600"
              badge={`${onLeavePct}%`}
              badgeType="warning"
              subtext="Scheduled leave window"
            />
          </div>
        </section>

        {/* Section 2: Task Metrics */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-gray-600" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Task Pipeline Status
              </h2>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-[#83282f] hover:text-[#6e2127] inline-flex items-center gap-1 hover:underline"
            >
              View all tasks <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              label="Total Tasks"
              value={tasks.total}
              icon={CheckSquare}
              iconBg="bg-slate-100 text-slate-700"
              subtext="All pipeline tasks"
            />
            <StatCard
              label="Todo"
              value={tasks.todo}
              icon={ListTodo}
              iconBg="bg-indigo-50 text-indigo-700"
              textColor="text-indigo-600"
              badge={`${todoPct}%`}
              badgeType="info"
              subtext="Queued to start"
            />
            <StatCard
              label="In Progress"
              value={tasks.inProgress}
              icon={Clock}
              iconBg="bg-blue-50 text-blue-700"
              textColor="text-blue-600"
              badge={`${inProgressPct}%`}
              badgeType="info"
              subtext="Underway"
            />
            <StatCard
              label="Completed"
              value={tasks.completed}
              icon={CheckCircle2}
              iconBg="bg-emerald-50 text-emerald-700"
              textColor="text-emerald-600"
              badge={`${completedPct}%`}
              badgeType="success"
              subtext="Finished"
            />
            <StatCard
              label="Cancelled"
              value={tasks.cancelled}
              icon={Ban}
              iconBg="bg-gray-100 text-gray-500"
              textColor="text-gray-500"
              badge={`${cancelledPct}%`}
              badgeType="neutral"
              subtext="Terminated"
            />
            <StatCard
              label="Overdue"
              value={tasks.overdue}
              icon={AlertTriangle}
              iconBg="bg-rose-50 text-rose-700"
              textColor="text-rose-600"
              badge="Alert"
              badgeType="danger"
              subtext="Passed due date"
            />
          </div>
        </section>

        {/* Section 3: Employee Workload Table */}
        <section className="bg-white rounded-xl border border-gray-200/90 shadow-sm overflow-hidden">
          {/* Table Card Header */}
          <div className="bg-[#121214] px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-5 bg-[#d2b68a] rounded-sm"></span>
              <div>
                <h3 className="font-bold text-base tracking-wide text-white">
                  Employee Workload & Capacity Distribution
                </h3>
                <p className="text-xs text-gray-400 font-normal mt-0.5">
                  Calculated on server (Active Tasks = Todo + In Progress) • Max capacity is 3 tasks
                </p>
              </div>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#1a1b1e] text-[#d2b68a] border border-gray-800 self-start sm:self-auto">
              {employeeWorkload.length} Active Assignees
            </span>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80 text-gray-600 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5 text-left">Employee</th>
                  <th className="px-4 py-2.5 text-left">Department</th>
                  <th className="px-4 py-2.5 text-left">Capacity Meter</th>
                  <th className="px-4 py-2.5 text-right">Active Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {employeeWorkload.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      No active tasks currently assigned to any employee.
                    </td>
                  </tr>
                ) : (
                  employeeWorkload.map((emp) => {
                    const capacityRatio = Math.min(3, emp.activeTasks) / 3;
                    const isMax = emp.activeTasks >= 3;

                    return (
                      <tr
                        key={emp._id}
                        className="hover:bg-gray-50/80 transition-colors group h-11"
                      >
                        {/* Employee Name & Avatar */}
                        <td className="px-4 py-2">
                          <Link
                            to={`/employees/${emp.slug || emp.employeeId || emp._id}`}
                            className="flex items-center gap-2.5 group-hover:text-[#83282f] transition-colors"
                          >
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                              {getInitials(emp.fullName)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-[#83282f] transition-colors text-xs leading-tight">
                                {emp.fullName}
                              </div>
                              <div className="text-[11px] text-gray-400 font-mono leading-tight">
                                {emp.employeeId}
                              </div>
                            </div>
                          </Link>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-2 text-gray-600">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                            {emp.department}
                          </span>
                        </td>

                        {/* Capacity Meter */}
                        <td className="px-4 py-2">
                          <div className="max-w-xs space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              {isMax ? (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  Max Capacity (3/3)
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Available ({emp.activeTasks}/3)
                                </span>
                              )}
                              <span className="text-gray-400 font-semibold text-[10px]">
                                {Math.round(capacityRatio * 100)}%
                              </span>
                            </div>

                            {/* 3-segment visual meter */}
                            <div className="grid grid-cols-3 gap-1">
                              {[1, 2, 3].map((slot) => {
                                const filled = emp.activeTasks >= slot;
                                const slotColor = isMax
                                  ? 'bg-rose-500'
                                  : filled
                                    ? 'bg-emerald-500'
                                    : 'bg-gray-100';

                                return (
                                  <div
                                    key={slot}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${slotColor}`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </td>

                        {/* Active Tasks Count */}
                        <td className="px-4 py-2 text-right">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${
                              isMax ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {emp.activeTasks}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardView;
