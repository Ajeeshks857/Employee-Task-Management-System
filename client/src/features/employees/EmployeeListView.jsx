import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import TableSkeleton from '../../components/common/TableSkeleton';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';
import FilterSelect from '../../components/common/FilterSelect';
import ActionMenu from '../../components/common/ActionMenu';
import SortableHeader from '../../components/common/SortableHeader';
import EmployeeFormDrawer from './EmployeeFormDrawer';
import EmployeeStatusDropdown from './EmployeeStatusDropdown';
import { Plus, X } from 'lucide-react';

const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];
const STATUSES = ['Active', 'Inactive', 'On Leave'];

const EmployeeListView = ({ showNotification }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Employee Form Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerEmployeeId, setDrawerEmployeeId] = useState(null);

  const handleOpenAddDrawer = () => {
    setDrawerEmployeeId(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (id) => {
    setDrawerEmployeeId(id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setDrawerEmployeeId(null);
  }, []);

  // URL parameters state
  const search = searchParams.get('search') || '';
  const department = searchParams.get('department') || '';
  const status = searchParams.get('status') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = searchParams.get('limit') || '10';

  // Local search input state
  const [searchInput, setSearchInput] = useState(search);

  // Fetch employees from server with URL params
  const fetchEmployees = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await api.getEmployees({
        page,
        limit,
        search,
        department,
        status,
        sortBy,
        sortOrder,
      });
      setEmployees(res.data);
      setPagination(res.pagination);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsFetching(false);
      setInitialLoading(false);
    }
  }, [page, limit, search, department, status, sortBy, sortOrder, showNotification]);

  useEffect(() => {
    document.title = 'Employees | Roots Media Marketing';
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

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

  // Update URL params helper
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

  const handleStatusChange = async (employeeId, newStatus) => {
    const previousEmployees = [...employees];
    // Optimistic update
    setEmployees((prev) =>
      prev.map((e) => (e._id === employeeId ? { ...e, status: newStatus } : e))
    );
    try {
      await api.updateEmployee(employeeId, { status: newStatus });
      showNotification(`Employee status updated to ${newStatus}`, 'success');
      fetchEmployees();
    } catch (err) {
      setEmployees(previousEmployees);
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteEmployee(deleteTarget._id);
      showNotification(res.message, 'success');
      setDeleteTarget(null);
      fetchEmployees();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage company employees, departments, and active task capacities.
          </p>
        </div>
        <button type="button" onClick={handleOpenAddDrawer} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1 min-w-[260px]">
            <SearchBar
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onSubmit={handleSearchSubmit}
              onClear={handleClearSearch}
              placeholder="Search name, email, or employee ID..."
            />
          </div>

          <div className="w-full md:w-52 shrink-0">
            <FilterSelect
              value={department}
              onChange={(val) => updateParams({ department: val })}
              placeholder="All Departments"
              options={DEPARTMENTS}
            />
          </div>

          <div className="w-full md:w-48 shrink-0">
            <FilterSelect
              value={status}
              onChange={(val) => updateParams({ status: val })}
              placeholder="All Statuses"
              options={STATUSES}
            />
          </div>

          {(search || department || status) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors shrink-0"
              title="Reset all filters and search"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Employee Table */}
      <div className="table-container-card">
        {/* Top loading indicator line */}
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
                    field="employeeId"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                    className="w-28 text-left"
                  />
                  <SortableHeader
                    label="Full Name"
                    field="fullName"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                    className="min-w-[180px] text-left"
                  />
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300 min-w-[200px]">
                    Email
                  </th>
                  <SortableHeader
                    label="Department"
                    field="department"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                    className="w-36 text-left"
                  />
                  <SortableHeader
                    label="Role"
                    field="role"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                    className="w-40 text-left"
                  />
                  <SortableHeader
                    label="Status"
                    field="status"
                    align="center"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                    className="w-32 text-center"
                  />
                  <th className="w-32 px-4 py-2.5 text-center text-xs font-medium text-gray-300 whitespace-nowrap">
                    Active Tasks
                  </th>
                  <th className="w-20 px-4 py-2.5 text-center text-xs font-medium text-gray-300 whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {initialLoading ? (
                  Array.from({ length: 10 }).map((_, idx) => (
                    <tr key={idx} className="h-11">
                      <td className="px-4 py-2.5 w-28 text-left">
                        <div className="h-3.5 bg-gray-200 rounded shimmer-loader w-16"></div>
                      </td>
                      <td className="px-4 py-2.5 min-w-[180px] text-left">
                        <div className="h-3.5 bg-gray-200 rounded shimmer-loader w-36"></div>
                      </td>
                      <td className="px-4 py-2.5 min-w-[200px] text-left">
                        <div className="h-3.5 bg-gray-200 rounded shimmer-loader w-44"></div>
                      </td>
                      <td className="px-4 py-2.5 w-36 text-left">
                        <div className="h-3.5 bg-gray-200 rounded shimmer-loader w-24"></div>
                      </td>
                      <td className="px-4 py-2.5 w-40 text-left">
                        <div className="h-3.5 bg-gray-200 rounded shimmer-loader w-28"></div>
                      </td>
                      <td className="px-4 py-2.5 w-32 text-center">
                        <div className="h-5 bg-gray-200 rounded shimmer-loader w-16 mx-auto"></div>
                      </td>
                      <td className="px-4 py-2.5 w-32 text-center">
                        <div className="h-5 bg-gray-200 rounded-full shimmer-loader w-12 mx-auto"></div>
                      </td>
                      <td className="px-4 py-2.5 w-20 text-center">
                        <div className="h-4 bg-gray-200 rounded shimmer-loader w-5 mx-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-24 text-center text-gray-500">
                      <p className="text-base font-medium">No employees found.</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Try adjusting your search or filter parameters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-gray-50 transition-colors h-11">
                      <td className="px-4 py-2 font-normal text-gray-700 whitespace-nowrap text-left">
                        {emp.employeeId}
                      </td>
                      <td className="px-4 py-2 font-normal text-gray-900 whitespace-nowrap text-left">
                        <Link
                          to={`/employees/${emp.slug || emp._id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {emp.fullName}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-gray-600 text-xs whitespace-nowrap text-left">
                        {emp.email}
                      </td>
                      <td className="px-4 py-2 text-gray-700 whitespace-nowrap text-left">
                        {emp.department}
                      </td>
                      <td className="px-4 py-2 text-gray-600 whitespace-nowrap text-left">
                        {emp.role}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        <div className="flex justify-center">
                          <EmployeeStatusDropdown
                            employee={emp}
                            onStatusChange={handleStatusChange}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            emp.activeTasksCount >= 3
                              ? 'bg-rose-100 text-rose-700'
                              : emp.activeTasksCount > 0
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {emp.activeTasksCount} / 3
                        </span>
                      </td>
                      <td className="w-20 px-4 py-2 text-center whitespace-nowrap">
                        <div className="flex justify-center">
                          <ActionMenu
                            viewUrl={`/employees/${emp.slug || emp._id}`}
                            editUrl={`/employees/${emp.slug || emp._id}/edit`}
                            onEdit={() => handleOpenEditDrawer(emp._id)}
                            canEdit={true}
                            onDelete={() => setDeleteTarget(emp)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination with dynamic page size options */}
        <Pagination
          pagination={pagination}
          onPageChange={(p) => updateParams({ page: String(p) })}
          onLimitChange={(l) => updateParams({ limit: String(l), page: '1' })}
          itemName="employees"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteTarget?.fullName}? Business Rule: deletion is prohibited if this employee has active tasks (Todo / In Progress).`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Employee'}
        isDanger={true}
      />

      {/* Employee Form Drawer */}
      <EmployeeFormDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSuccess={fetchEmployees}
        employeeId={drawerEmployeeId}
        showNotification={showNotification}
      />
    </div>
  );
};

export default EmployeeListView;
