import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import PriorityBadge from '../../components/common/PriorityBadge';
import StatusDropdown from '../../components/common/StatusDropdown';
import Pagination from '../../components/common/Pagination';
import TableSkeleton from '../../components/common/TableSkeleton';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';
import FilterSelect from '../../components/common/FilterSelect';
import ActionMenu from '../../components/common/ActionMenu';
import DateRangePicker from '../../components/common/DateRangePicker';
import SortableHeader from '../../components/common/SortableHeader';
import TaskFormDrawer from './TaskFormDrawer';
import { Plus, Download, X } from 'lucide-react';

const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Todo', 'In Progress', 'Completed', 'Cancelled'];

const TaskListView = ({ showNotification }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Task Form Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTaskId, setDrawerTaskId] = useState(null);

  const handleOpenAddDrawer = () => {
    setDrawerTaskId(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (id) => {
    setDrawerTaskId(id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setDrawerTaskId(null);
  }, []);

  // Read URL parameters
  const search = searchParams.get('search') || '';
  const department = searchParams.get('department') || '';
  const priority = searchParams.get('priority') || '';
  const status = searchParams.get('status') || '';
  const dueDateFrom = searchParams.get('dueDateFrom') || '';
  const dueDateTo = searchParams.get('dueDateTo') || '';
  const sortBy = searchParams.get('sortBy') || 'createdDate';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = searchParams.get('limit') || '10';

  // Search input state
  const [searchInput, setSearchInput] = useState(search);

  // Fetch tasks with all filters from backend
  const fetchTasks = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await api.getTasks({
        page,
        limit,
        search,
        department,
        priority,
        status,
        dueDateFrom,
        dueDateTo,
        sortBy,
        sortOrder,
      });
      setTasks(res.data);
      setPagination(res.pagination);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsFetching(false);
      setInitialLoading(false);
    }
  }, [
    page,
    limit,
    search,
    department,
    priority,
    status,
    dueDateFrom,
    dueDateTo,
    sortBy,
    sortOrder,
    showNotification,
  ]);

  useEffect(() => {
    document.title = 'Tasks | Roots Media Marketing';
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounced live search when user types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({ search: searchInput });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Update URL helper
  const updateParams = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        updated.set(k, v);
      } else {
        updated.delete(k);
      }
    });
    if (!('page' in newParams)) {
      updated.set('page', '1');
    }
    setSearchParams(updated);
  };

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    updateParams({ search: searchInput });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateParams({ search: '' });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      updateParams({
        sortBy: field,
        sortOrder: sortOrder === 'asc' ? 'desc' : 'asc',
      });
    } else {
      updateParams({
        sortBy: field,
        sortOrder: 'asc',
      });
    }
  };

  // Status transition handler via PUT /api/tasks/:id/status
  const handleStatusChange = async (taskId, newStatus) => {
    const previousTasks = [...tasks];
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t._id === taskId
          ? {
              ...t,
              status: newStatus,
              isOverdue:
                newStatus !== 'Completed' &&
                newStatus !== 'Cancelled' &&
                new Date(t.dueDate) < new Date(),
            }
          : t
      )
    );

    try {
      await api.updateTaskStatus(taskId, newStatus);
      showNotification(`Task status updated to ${newStatus}`, 'success');
      fetchTasks();
    } catch (err) {
      setTasks(previousTasks);
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteTask(deleteTarget._id);
      showNotification(res.message, 'success');
      setDeleteTarget(null);
      fetchTasks();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // CSV Export downloads all tasks matching current filters
  const handleExportCsv = () => {
    const exportUrl = api.getExportCsvUrl({
      search,
      department,
      priority,
      status,
      dueDateFrom,
      dueDateTo,
    });
    window.location.href = exportUrl;
  };

  const formatDateDisplay = (dateString, isOverdue) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const formatted = d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
    if (isOverdue) {
      return <span className="text-rose-600 font-bold">{formatted} (Overdue)</span>;
    }
    return formatted;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track tasks, assignments, priorities, and workflow statuses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleOpenAddDrawer} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
          <button type="button" onClick={handleExportCsv} className="btn-primary">
            <Download className="w-4 h-4" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-6 space-y-3">
        <div className="w-full">
          <SearchBar
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSubmit={handleSearchSubmit}
            onClear={handleClearSearch}
            placeholder="Search title or employee..."
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
          <FilterSelect
            value={department}
            onChange={(val) => updateParams({ department: val })}
            placeholder="Department"
            options={DEPARTMENTS}
          />

          <FilterSelect
            value={priority}
            onChange={(val) => updateParams({ priority: val })}
            placeholder="Priority"
            options={PRIORITIES}
          />

          <FilterSelect
            value={status}
            onChange={(val) => updateParams({ status: val })}
            placeholder="Status"
            options={STATUSES}
          />

          {/* Due date range filter with animated popover */}
          <div className="col-span-2 md:col-span-2 flex items-center gap-2">
            <DateRangePicker
              startDate={dueDateFrom}
              endDate={dueDateTo}
              onChange={({ startDate, endDate }) => {
                updateParams({
                  dueDateFrom: startDate,
                  dueDateTo: endDate,
                });
              }}
              placeholder="Due: All Dates"
            />
            {(search || department || priority || status || dueDateFrom || dueDateTo) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                title="Clear all filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Task Listing Table */}
      <div className="table-container-card">
        {/* Subtle top loading line when paginating without jumping */}
        {isFetching && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#83282f] animate-pulse z-10" />
        )}

        <div
          className={`transition-opacity duration-150 ${isFetching ? 'opacity-60' : 'opacity-100'}`}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#1f2328] text-white text-xs font-medium">
                <tr>
                  <SortableHeader
                    label="ID"
                    field="taskId"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                    className="w-24 text-left"
                  />
                  <SortableHeader
                    label="Title"
                    field="title"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                    className="min-w-[200px] text-left"
                  />
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 w-44 whitespace-nowrap">
                    Employee
                  </th>
                  <SortableHeader
                    label="Priority"
                    field="priority"
                    align="center"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                    className="w-28 text-center"
                  />
                  <SortableHeader
                    label="Status"
                    field="status"
                    align="center"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                    className="w-36 text-center"
                  />
                  <SortableHeader
                    label="Due Date"
                    field="dueDate"
                    align="center"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                    className="w-36 text-center"
                  />
                  <th className="w-20 px-4 py-2.5 text-center text-xs font-medium text-gray-300 whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {initialLoading ? (
                  Array.from({ length: 10 }).map((_, idx) => (
                    <tr key={idx} className="h-11">
                      <td className="px-4 py-2.5 w-24">
                        <div className="h-3.5 bg-gray-200 rounded shimmer-loader w-14"></div>
                      </td>
                      <td className="px-4 py-2.5 min-w-[200px]">
                        <div className="h-3.5 bg-gray-200 rounded shimmer-loader w-48"></div>
                      </td>
                      <td className="px-4 py-2.5 w-44">
                        <div className="h-3.5 bg-gray-200 rounded shimmer-loader w-28"></div>
                      </td>
                      <td className="px-4 py-2.5 w-28 text-center">
                        <div className="h-5 bg-gray-200 rounded shimmer-loader w-16 mx-auto"></div>
                      </td>
                      <td className="px-4 py-2.5 w-36 text-center">
                        <div className="h-6 bg-gray-200 rounded shimmer-loader w-24 mx-auto"></div>
                      </td>
                      <td className="px-4 py-2.5 w-36 text-center">
                        <div className="h-3.5 bg-gray-200 rounded shimmer-loader w-20 mx-auto"></div>
                      </td>
                      <td className="px-4 py-2.5 w-20 text-center">
                        <div className="h-4 bg-gray-200 rounded shimmer-loader w-5 mx-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-24 text-center text-gray-500">
                      <p className="text-base font-medium">No tasks found.</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Try adjusting your search keywords or filter criteria.
                      </p>
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => {
                    const employeeName =
                      task.assignedEmployee?.fullName ||
                      task.employeeSnapshot?.fullName ||
                      'Unassigned';
                    const isLocked = task.status === 'Completed' || task.status === 'Cancelled';

                    return (
                      <tr key={task._id} className="hover:bg-gray-50 transition-colors h-11">
                        <td className="px-4 py-2 font-normal text-gray-700 whitespace-nowrap">
                          {task.taskId}
                        </td>
                        <td className="px-4 py-2 font-normal text-gray-900">
                          <Link
                            to={`/tasks/${task.slug || task._id}`}
                            className="hover:text-blue-600 hover:underline"
                          >
                            {task.title}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                          {task.assignedEmployee ? (
                            <Link
                              to={`/employees/${task.assignedEmployee.slug || task.assignedEmployee._id}`}
                              className="hover:text-blue-600 hover:underline"
                            >
                              {employeeName}
                            </Link>
                          ) : (
                            <span>{employeeName}</span>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          <PriorityBadge priority={task.priority} />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          <div className="flex justify-center">
                            <StatusDropdown task={task} onStatusChange={handleStatusChange} />
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center text-sm">
                          {formatDateDisplay(task.dueDate, task.isOverdue)}
                        </td>
                        <td className="w-20 px-4 py-2 text-center whitespace-nowrap">
                          <div className="flex justify-center">
                            <ActionMenu
                              viewUrl={`/tasks/${task.slug || task._id}`}
                              editUrl={`/tasks/${task.slug || task._id}/edit`}
                              onEdit={() => handleOpenEditDrawer(task._id)}
                              canEdit={!isLocked}
                              onDelete={() => setDeleteTarget(task)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reusable Pagination with large data fetching capability */}
        <Pagination
          pagination={pagination}
          onPageChange={(p) => updateParams({ page: String(p) })}
          onLimitChange={(l) => updateParams({ limit: String(l), page: '1' })}
          itemName="tasks"
        />
      </div>

      {/* Reusable Delete confirmation modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete task ${deleteTarget?.taskId} ("${deleteTarget?.title}")?`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Task'}
        isDanger={true}
      />

      {/* Task Form Drawer */}
      <TaskFormDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSuccess={fetchTasks}
        taskId={drawerTaskId}
        showNotification={showNotification}
      />
    </div>
  );
};

export default TaskListView;
