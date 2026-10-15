import mongoose from 'mongoose';
import Task, { TASK_PRIORITIES, TASK_STATUSES } from './task.model.js';
import Employee from '../employee/employee.model.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';

class TaskService {
  _buildTaskQuery(identifier) {
    if (!identifier) return { _id: null };
    const str = String(identifier).trim();
    const isObjectId = mongoose.Types.ObjectId.isValid(str);
    const conditions = [{ slug: str.toLowerCase() }, { taskId: str.toUpperCase() }];
    if (isObjectId) {
      conditions.unshift({ _id: str });
    }
    const taskIdMatch = str.match(/^((?:tsk|task)-[a-zA-Z0-9]+)/i);
    if (taskIdMatch) {
      conditions.push({ taskId: taskIdMatch[1].toUpperCase() });
      conditions.push({ taskId: taskIdMatch[1].toUpperCase().replace(/^TSK-/, 'TASK-') });
      conditions.push({ taskId: taskIdMatch[1].toUpperCase().replace(/^TASK-/, 'TSK-') });
    }
    return { $or: conditions };
  }

  /**
   * Validate employee eligibility for a task based on business rules
   * 1. Inactive -> always rejected
   * 2. On Leave -> rejected if task's Start Date falls inside leave period (both dates inclusive)
   * 3. Capacity -> maximum 3 active tasks (Todo + In Progress)
   */
  async validateEmployeeAssignment(employeeId, taskStartDate, currentTaskId = null) {
    const isObjectId = mongoose.Types.ObjectId.isValid(employeeId);
    const empConditions = [
      { slug: String(employeeId).toLowerCase() },
      { employeeId: String(employeeId).toUpperCase() },
    ];
    if (isObjectId) {
      empConditions.unshift({ _id: employeeId });
    }
    const employee = await Employee.findOne({ $or: empConditions });
    if (!employee) {
      throw new NotFoundError(`Assigned employee not found.`);
    }

    // Business Rule 1: Inactive employee always rejected
    if (employee.status === 'Inactive') {
      throw new BadRequestError(`Cannot assign task: Employee ${employee.fullName} is Inactive.`);
    }

    // Business Rule 2: On Leave employee rejected if task Start Date is within leave period
    if (employee.status === 'On Leave') {
      if (employee.leaveStartDate && employee.leaveEndDate) {
        const taskStart = new Date(taskStartDate).setHours(0, 0, 0, 0);
        const leaveStart = new Date(employee.leaveStartDate).setHours(0, 0, 0, 0);
        const leaveEnd = new Date(employee.leaveEndDate).setHours(23, 59, 59, 999);

        if (taskStart >= leaveStart && taskStart <= leaveEnd) {
          throw new BadRequestError(
            `Cannot assign task: Employee ${employee.fullName} is On Leave during the task start date (${new Date(taskStartDate).toLocaleDateString()}).`
          );
        }
      }
    }

    // Business Rule 3: Capacity limit (max 3 active tasks: Todo + In Progress)
    const activeTasksQuery = {
      assignedEmployee: employee._id,
      status: { $in: ['Todo', 'In Progress'] },
    };

    // If updating an existing task, exclude this task from capacity count
    if (currentTaskId) {
      activeTasksQuery._id = { $ne: currentTaskId };
    }

    const currentActiveCount = await Task.countDocuments(activeTasksQuery);
    if (currentActiveCount >= 3) {
      throw new BadRequestError(
        'Employee already has 3 active tasks. Please choose another employee.'
      );
    }

    return employee;
  }

  /**
   * Validate date constraints
   * Due Date cannot be earlier than Start Date
   */
  validateTaskDates(startDate, dueDate) {
    if (!startDate || !dueDate) {
      throw new BadRequestError('Both Start Date and Due Date are required.');
    }
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const due = new Date(dueDate).setHours(0, 0, 0, 0);
    if (due < start) {
      throw new BadRequestError('Due Date cannot be earlier than Start Date.');
    }
  }

  /**
   * Create task
   */
  async createTask(data) {
    // 1. Validate dates
    this.validateTaskDates(data.startDate, data.dueDate);

    // 2. Validate employee assignment & capacity
    const employee = await this.validateEmployeeAssignment(data.assignedEmployee, data.startDate);

    // 3. New tasks always start as Todo; completedDate is null
    const task = new Task({
      title: data.title,
      description: data.description || '',
      assignedEmployee: employee._id,
      employeeSnapshot: {
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        email: employee.email,
        department: employee.department,
      },
      department: data.department || employee.department,
      priority: data.priority || 'Medium',
      status: 'Todo',
      startDate: data.startDate,
      dueDate: data.dueDate,
      createdDate: new Date(),
      completedDate: null,
    });

    await task.save();
    return task;
  }

  /**
   * List tasks with server-side filters, search, sorting, and pagination
   */
  async listTasks({
    page = 1,
    limit = 10,
    all = false,
    search = '',
    department = '',
    priority = '',
    status = '',
    dueDateFrom = '',
    dueDateTo = '',
    sortBy = 'createdDate',
    sortOrder = 'desc',
  } = {}) {
    const query = {};

    // Filter by department
    if (department && ['Development', 'Design', 'QA', 'HR', 'Sales'].includes(department)) {
      query.department = department;
    }

    // Filter by priority
    if (priority && TASK_PRIORITIES.includes(priority)) {
      query.priority = priority;
    }

    // Filter by status
    if (status && TASK_STATUSES.includes(status)) {
      query.status = status;
    }

    // Filter by Due Date Range
    if (dueDateFrom || dueDateTo) {
      query.dueDate = {};
      if (dueDateFrom) {
        query.dueDate.$gte = new Date(new Date(dueDateFrom).setHours(0, 0, 0, 0));
      }
      if (dueDateTo) {
        query.dueDate.$lte = new Date(new Date(dueDateTo).setHours(23, 59, 59, 999));
      }
    }

    // Search task title or employee name
    if (search && search.trim()) {
      const term = search.trim();
      const matchingEmployees = await Employee.find({
        fullName: { $regex: term, $options: 'i' },
      }).select('_id');

      const empIds = matchingEmployees.map((e) => e._id);

      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { taskId: { $regex: term, $options: 'i' } },
        { assignedEmployee: { $in: empIds } },
        { 'employeeSnapshot.fullName': { $regex: term, $options: 'i' } },
      ];
    }

    const isAll = limit === 'all' || limit === '0' || limit === 0 || all === 'true' || all === true;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = isAll ? 50000 : Math.min(50000, Math.max(1, parseInt(limit, 10) || 10));
    const skip = isAll ? 0 : (pageNum - 1) * limitNum;

    // Sorting by priority custom order or fields
    const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    let sortConfig = {};

    if (sortBy === 'priority') {
      sortConfig = { priority: sortOrder === 'asc' ? 1 : -1 };
    } else if (
      ['createdDate', 'dueDate', 'title', 'taskId', 'status', 'department'].includes(sortBy)
    ) {
      sortConfig = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    } else {
      sortConfig = { createdDate: -1 };
    }

    const [total, tasks] = await Promise.all([
      Task.countDocuments(query),
      Task.find(query)
        .populate('assignedEmployee', 'fullName email employeeId slug department status')
        .sort(sortConfig)
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    // Attach computed overdue flag consistently
    const now = new Date();
    const formattedTasks = tasks.map((task) => {
      const isOverdue =
        task.status !== 'Completed' && task.status !== 'Cancelled' && new Date(task.dueDate) < now;

      return {
        ...task,
        isOverdue,
      };
    });

    return {
      tasks: formattedTasks,
      pagination: {
        total,
        page: isAll ? 1 : pageNum,
        limit: isAll ? total : limitNum,
        totalPages: isAll ? 1 : Math.ceil(total / limitNum) || 1,
      },
    };
  }

  /**
   * Get single task by ID
   */
  async getTaskById(id) {
    const task = await Task.findOne(this._buildTaskQuery(id))
      .populate(
        'assignedEmployee',
        'fullName email employeeId slug department status leaveStartDate leaveEndDate'
      )
      .lean();

    if (!task) {
      throw new NotFoundError(`Task with ID or slug '${id}' not found.`);
    }

    const now = new Date();
    const isOverdue =
      task.status !== 'Completed' && task.status !== 'Cancelled' && new Date(task.dueDate) < now;

    return {
      ...task,
      isOverdue,
    };
  }

  /**
   * Update task details (status cannot be updated here!)
   * Completed and Cancelled tasks CANNOT be edited!
   */
  async updateTask(id, data) {
    const task = await Task.findOne(this._buildTaskQuery(id));
    if (!task) {
      throw new NotFoundError(`Task with ID or slug '${id}' not found.`);
    }

    // Business Rule: Completed and Cancelled tasks cannot be edited
    if (task.status === 'Completed' || task.status === 'Cancelled') {
      throw new BadRequestError(
        `Cannot edit task: Tasks with status '${task.status}' are locked and cannot be edited.`
      );
    }

    // Status cannot be changed via general edit API
    if (data.status && data.status !== task.status) {
      throw new BadRequestError(
        'Task status cannot be changed via general edit API. Use PUT /api/tasks/:id/status.'
      );
    }

    const startDate = data.startDate || task.startDate;
    const dueDate = data.dueDate || task.dueDate;
    this.validateTaskDates(startDate, dueDate);

    let assignedEmployeeId = task.assignedEmployee;
    let employeeSnapshot = task.employeeSnapshot;

    if (
      data.assignedEmployee &&
      data.assignedEmployee.toString() !== task.assignedEmployee?.toString()
    ) {
      const emp = await this.validateEmployeeAssignment(data.assignedEmployee, startDate, task._id);
      assignedEmployeeId = emp._id;
      employeeSnapshot = {
        employeeId: emp.employeeId,
        fullName: emp.fullName,
        email: emp.email,
        department: emp.department,
      };
    } else if (
      data.startDate &&
      new Date(data.startDate).getTime() !== new Date(task.startDate).getTime()
    ) {
      // Start date changed, verify leave constraints for existing employee
      if (task.assignedEmployee) {
        await this.validateEmployeeAssignment(task.assignedEmployee, startDate, task._id);
      }
    }

    task.title = data.title !== undefined ? data.title : task.title;
    task.description = data.description !== undefined ? data.description : task.description;
    task.department = data.department !== undefined ? data.department : task.department;
    task.priority = data.priority !== undefined ? data.priority : task.priority;
    task.startDate = startDate;
    task.dueDate = dueDate;
    task.assignedEmployee = assignedEmployeeId;
    task.employeeSnapshot = employeeSnapshot;

    await task.save();
    return task;
  }

  /**
   * Status Transition API
   * Business Rules:
   * Todo -> In Progress -> Completed
   * Todo -> Cancelled
   * In Progress -> Cancelled
   * Completed Date is set by backend when task becomes Completed, never taken from frontend.
   */
  async updateTaskStatus(id, newStatus) {
    const task = await Task.findOne(this._buildTaskQuery(id));
    if (!task) {
      throw new NotFoundError(`Task with ID or slug '${id}' not found.`);
    }

    const currentStatus = task.status;

    // Allowed status transitions:
    // Todo -> In Progress -> Completed, and Todo / In Progress -> Cancelled.
    // Any other change is rejected. Completed and Cancelled are terminal states.
    const allowedTransitions = {
      Todo: ['In Progress', 'Cancelled'],
      'In Progress': ['Completed', 'Cancelled'],
      Completed: [],
      Cancelled: [],
    };

    const validNextStatuses = allowedTransitions[currentStatus] || [];

    if (!validNextStatuses.includes(newStatus)) {
      throw new BadRequestError(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: ${
          validNextStatuses.length ? validNextStatuses.join(', ') : 'None'
        }.`
      );
    }

    // Capacity guard if transitioning back to active status (Todo / In Progress)
    if (
      ['Todo', 'In Progress'].includes(newStatus) &&
      !['Todo', 'In Progress'].includes(currentStatus)
    ) {
      if (task.assignedEmployee) {
        const activeCount = await Task.countDocuments({
          assignedEmployee: task.assignedEmployee,
          status: { $in: ['Todo', 'In Progress'] },
          _id: { $ne: task._id },
        });
        if (activeCount >= 3) {
          throw new BadRequestError(
            'Cannot reopen task: Assigned employee already has 3 active tasks.'
          );
        }
      }
    }

    task.status = newStatus;

    // Business Rule: Completed Date is set by backend when task becomes Completed
    if (newStatus === 'Completed') {
      task.completedDate = new Date();
    } else {
      task.completedDate = null;
    }

    await task.save();
    return task;
  }

  /**
   * Delete Task
   */
  async deleteTask(id) {
    const task = await Task.findOne(this._buildTaskQuery(id));
    if (!task) {
      throw new NotFoundError(`Task with ID or slug '${id}' not found.`);
    }
    await task.deleteOne();
    return { message: `Task ${task.taskId} deleted successfully.` };
  }

  /**
   * Get all tasks for CSV export matching current filters
   */
  async getTasksForExport(filters = {}) {
    const query = {};

    if (
      filters.department &&
      ['Development', 'Design', 'QA', 'HR', 'Sales'].includes(filters.department)
    ) {
      query.department = filters.department;
    }

    if (filters.priority && TASK_PRIORITIES.includes(filters.priority)) {
      query.priority = filters.priority;
    }

    if (filters.status && TASK_STATUSES.includes(filters.status)) {
      query.status = filters.status;
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
      query.dueDate = {};
      if (filters.dueDateFrom) {
        query.dueDate.$gte = new Date(new Date(filters.dueDateFrom).setHours(0, 0, 0, 0));
      }
      if (filters.dueDateTo) {
        query.dueDate.$lte = new Date(new Date(filters.dueDateTo).setHours(23, 59, 59, 999));
      }
    }

    if (filters.search && filters.search.trim()) {
      const term = filters.search.trim();
      const matchingEmployees = await Employee.find({
        fullName: { $regex: term, $options: 'i' },
      }).select('_id');

      const empIds = matchingEmployees.map((e) => e._id);

      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { taskId: { $regex: term, $options: 'i' } },
        { assignedEmployee: { $in: empIds } },
        { 'employeeSnapshot.fullName': { $regex: term, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedEmployee', 'fullName email employeeId')
      .sort({ createdDate: -1 })
      .lean();

    const now = new Date();
    return tasks.map((task) => {
      const isOverdue =
        task.status !== 'Completed' && task.status !== 'Cancelled' && new Date(task.dueDate) < now;

      const employeeName =
        task.assignedEmployee?.fullName || task.employeeSnapshot?.fullName || 'Unassigned';

      return {
        taskId: task.taskId,
        title: task.title,
        employeeName,
        department: task.department,
        priority: task.priority,
        status: task.status,
        isOverdue: isOverdue ? 'Yes' : 'No',
        startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        completedDate: task.completedDate
          ? new Date(task.completedDate).toISOString().split('T')[0]
          : 'N/A',
        createdDate: task.createdDate ? new Date(task.createdDate).toISOString().split('T')[0] : '',
      };
    });
  }
}

export default new TaskService();
