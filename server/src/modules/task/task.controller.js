import TaskService from './task.service.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { generateCsvString } from '../../utils/csvHelper.js';
import { BadRequestError } from '../../utils/errors.js';

class TaskController {
  listTasks = asyncHandler(async (req, res) => {
    const {
      page,
      limit,
      all,
      search,
      department,
      priority,
      status,
      dueDateFrom,
      dueDateTo,
      sortBy,
      sortOrder,
    } = req.query;

    const result = await TaskService.listTasks({
      page,
      limit,
      all,
      search,
      department,
      priority,
      status,
      dueDateFrom,
      dueDateTo,
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      success: true,
      data: result.tasks,
      pagination: result.pagination,
    });
  });

  getTaskById = asyncHandler(async (req, res) => {
    const task = await TaskService.getTaskById(req.params.id);
    res.status(200).json({
      success: true,
      data: task,
    });
  });

  createTask = asyncHandler(async (req, res) => {
    const task = await TaskService.createTask(req.body);
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  });

  updateTask = asyncHandler(async (req, res) => {
    const task = await TaskService.updateTask(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  });

  updateTaskStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!status) {
      throw new BadRequestError('New status is required.');
    }
    const task = await TaskService.updateTaskStatus(req.params.id, status);
    res.status(200).json({
      success: true,
      message: `Task status updated to ${status}`,
      data: task,
    });
  });

  deleteTask = asyncHandler(async (req, res) => {
    const result = await TaskService.deleteTask(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  exportTasksCsv = asyncHandler(async (req, res) => {
    const { search, department, priority, status, dueDateFrom, dueDateTo } = req.query;

    const data = await TaskService.getTasksForExport({
      search,
      department,
      priority,
      status,
      dueDateFrom,
      dueDateTo,
    });

    const columns = [
      { key: 'taskId', label: 'Task ID' },
      { key: 'title', label: 'Title' },
      { key: 'employeeName', label: 'Assigned Employee' },
      { key: 'department', label: 'Department' },
      { key: 'priority', label: 'Priority' },
      { key: 'status', label: 'Status' },
      { key: 'isOverdue', label: 'Overdue' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'dueDate', label: 'Due Date' },
      { key: 'completedDate', label: 'Completed Date' },
      { key: 'createdDate', label: 'Created Date' },
    ];

    const csvData = generateCsvString(data, columns);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="tasks_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.status(200).send(csvData);
  });
}

export default new TaskController();
