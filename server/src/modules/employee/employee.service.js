import mongoose from 'mongoose';
import Employee, { DEPARTMENTS, EMPLOYEE_STATUSES } from './employee.model.js';
import Task from '../task/task.model.js';
import { BadRequestError, NotFoundError, ConflictError } from '../../utils/errors.js';

class EmployeeService {
  /**
   * List employees with search, filter, sort, and server-side pagination
   */
  async listEmployees({
    page = 1,
    limit = 10,
    all = false,
    search = '',
    department = '',
    status = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = {}) {
    const query = {};

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { fullName: { $regex: term, $options: 'i' } },
        { employeeId: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
      ];
    }

    if (department && DEPARTMENTS.includes(department)) {
      query.department = department;
    }

    if (status && EMPLOYEE_STATUSES.includes(status)) {
      query.status = status;
    }

    const isAll = limit === 'all' || limit === '0' || limit === 0 || all === 'true' || all === true;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = isAll ? 50000 : Math.min(50000, Math.max(1, parseInt(limit, 10) || 10));
    const skip = isAll ? 0 : (pageNum - 1) * limitNum;

    const allowedSortFields = [
      'fullName',
      'employeeId',
      'department',
      'role',
      'status',
      'joiningDate',
      'createdAt',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [total, employees] = await Promise.all([
      Employee.countDocuments(query),
      Employee.find(query)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    // Attach active task count for each employee in the list
    const employeeIds = employees.map((e) => e._id);
    const activeTaskCounts = await Task.aggregate([
      {
        $match: {
          assignedEmployee: { $in: employeeIds },
          status: { $in: ['Todo', 'In Progress'] },
        },
      },
      {
        $group: {
          _id: '$assignedEmployee',
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    activeTaskCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const enrichedEmployees = employees.map((emp) => ({
      ...emp,
      activeTasksCount: countMap[emp._id.toString()] || 0,
    }));

    return {
      employees: enrichedEmployees,
      pagination: {
        total,
        page: isAll ? 1 : pageNum,
        limit: isAll ? total : limitNum,
        totalPages: isAll ? 1 : Math.ceil(total / limitNum) || 1,
      },
    };
  }

  _buildEmployeeQuery(identifier) {
    if (!identifier) return { _id: null };
    const str = String(identifier).trim();
    const isObjectId = mongoose.Types.ObjectId.isValid(str);
    const conditions = [{ slug: str.toLowerCase() }, { employeeId: str.toUpperCase() }];
    if (isObjectId) {
      conditions.unshift({ _id: str });
    }
    const empIdMatch = str.match(/^(emp-[a-zA-Z0-9]+)/i);
    if (empIdMatch) {
      conditions.push({ employeeId: empIdMatch[1].toUpperCase() });
    }
    return { $or: conditions };
  }

  /**
   * Get employee by ID with their task history
   */
  async getEmployeeById(id) {
    const employee = await Employee.findOne(this._buildEmployeeQuery(id)).lean();
    if (!employee) {
      throw new NotFoundError(`Employee with ID or slug '${id}' not found.`);
    }

    // Fetch tasks assigned to this employee
    const tasks = await Task.find({ assignedEmployee: employee._id })
      .sort({ createdAt: -1 })
      .lean();

    const activeTasksCount = tasks.filter((t) => ['Todo', 'In Progress'].includes(t.status)).length;

    return {
      ...employee,
      tasks,
      activeTasksCount,
    };
  }

  /**
   * Create new employee with unique checks
   */
  async createEmployee(data) {
    const existing = await Employee.findOne({
      $or: [
        { employeeId: data.employeeId?.trim().toUpperCase() },
        { email: data.email?.trim().toLowerCase() },
      ],
    });

    if (existing) {
      if (existing.employeeId === data.employeeId?.trim().toUpperCase()) {
        throw new ConflictError(`Employee ID '${data.employeeId}' is already in use.`);
      }
      throw new ConflictError(`Email '${data.email}' is already registered.`);
    }

    const employee = new Employee(data);
    await employee.save();
    return employee;
  }

  /**
   * Update employee details
   */
  async updateEmployee(id, data) {
    const employee = await Employee.findOne(this._buildEmployeeQuery(id));
    if (!employee) {
      throw new NotFoundError(`Employee with ID or slug '${id}' not found.`);
    }

    // Check unique employeeId / email if updated
    if (data.employeeId && data.employeeId !== employee.employeeId) {
      const duplicateId = await Employee.findOne({
        employeeId: data.employeeId.trim().toUpperCase(),
        _id: { $ne: employee._id },
      });
      if (duplicateId) {
        throw new ConflictError(`Employee ID '${data.employeeId}' is already in use.`);
      }
    }

    if (data.email && data.email.toLowerCase() !== employee.email.toLowerCase()) {
      const duplicateEmail = await Employee.findOne({
        email: data.email.trim().toLowerCase(),
        _id: { $ne: employee._id },
      });
      if (duplicateEmail) {
        throw new ConflictError(`Email '${data.email}' is already registered.`);
      }
    }

    // Apply updates
    Object.assign(employee, data);
    await employee.save();

    // If employee name or department changed, update snapshot in tasks
    await Task.updateMany(
      { assignedEmployee: employee._id },
      {
        $set: {
          'employeeSnapshot.fullName': employee.fullName,
          'employeeSnapshot.email': employee.email,
          'employeeSnapshot.department': employee.department,
          'employeeSnapshot.employeeId': employee.employeeId,
        },
      }
    );

    return employee;
  }

  /**
   * Delete employee - strictly blocked if active tasks exist
   */
  async deleteEmployee(id) {
    const employee = await Employee.findOne(this._buildEmployeeQuery(id));
    if (!employee) {
      throw new NotFoundError(`Employee with ID or slug '${id}' not found.`);
    }

    // Business Rule: Delete employee not allowed while the employee has Todo / In Progress tasks
    const activeTasks = await Task.countDocuments({
      assignedEmployee: employee._id,
      status: { $in: ['Todo', 'In Progress'] },
    });

    if (activeTasks > 0) {
      throw new BadRequestError(
        `Cannot delete employee ${employee.fullName}: Employee currently has ${activeTasks} active task(s) (Todo / In Progress). Please complete, reassign, or cancel them before deleting.`
      );
    }

    // Detach reference on completed/cancelled tasks, preserving snapshot
    await Task.updateMany({ assignedEmployee: employee._id }, { $unset: { assignedEmployee: 1 } });

    await employee.deleteOne();
    return { message: `Employee ${employee.fullName} deleted successfully.` };
  }

  /**
   * Get all active and eligible employees for task assignment
   */
  async getAssignableEmployees() {
    const employees = await Employee.find({ status: { $ne: 'Inactive' } }).lean();

    // Get active tasks counts
    const activeTasks = await Task.aggregate([
      {
        $match: { status: { $in: ['Todo', 'In Progress'] } },
      },
      {
        $group: {
          _id: '$assignedEmployee',
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    activeTasks.forEach((t) => {
      if (t._id) countMap[t._id.toString()] = t.count;
    });

    return employees.map((emp) => ({
      _id: emp._id,
      employeeId: emp.employeeId,
      slug: emp.slug || '',
      fullName: emp.fullName,
      email: emp.email,
      department: emp.department,
      status: emp.status,
      leaveStartDate: emp.leaveStartDate,
      leaveEndDate: emp.leaveEndDate,
      activeTasksCount: countMap[emp._id.toString()] || 0,
      isCapacityFull: (countMap[emp._id.toString()] || 0) >= 3,
    }));
  }
}

export default new EmployeeService();
