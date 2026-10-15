import Employee from '../employee/employee.model.js';
import Task from '../task/task.model.js';

class DashboardService {
  /**
   * Calculate all dashboard statistics and employee workload on the server
   */
  async getDashboardMetrics() {
    const now = new Date();

    // 1. Employee metrics
    const [totalEmployees, activeEmployees, inactiveEmployees, onLeaveEmployees] =
      await Promise.all([
        Employee.countDocuments(),
        Employee.countDocuments({ status: 'Active' }),
        Employee.countDocuments({ status: 'Inactive' }),
        Employee.countDocuments({ status: 'On Leave' }),
      ]);

    // 2. Task metrics
    const [totalTasks, todoTasks, inProgressTasks, completedTasks, cancelledTasks, overdueTasks] =
      await Promise.all([
        Task.countDocuments(),
        Task.countDocuments({ status: 'Todo' }),
        Task.countDocuments({ status: 'In Progress' }),
        Task.countDocuments({ status: 'Completed' }),
        Task.countDocuments({ status: 'Cancelled' }),
        // Overdue: today is later than Due Date and status is not Completed or Cancelled
        Task.countDocuments({
          status: { $nin: ['Completed', 'Cancelled'] },
          dueDate: { $lt: now },
        }),
      ]);

    // 3. Employee Workload (Active tasks = Todo + In Progress) calculated on server
    const workloadAggregation = await Task.aggregate([
      {
        $match: {
          status: { $in: ['Todo', 'In Progress'] },
          assignedEmployee: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$assignedEmployee',
          activeTasks: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employeeDetails',
        },
      },
      {
        $unwind: '$employeeDetails',
      },
      {
        $project: {
          _id: 1,
          employeeId: '$employeeDetails.employeeId',
          fullName: '$employeeDetails.fullName',
          email: '$employeeDetails.email',
          department: '$employeeDetails.department',
          status: '$employeeDetails.status',
          slug: '$employeeDetails.slug',
          activeTasks: 1,
        },
      },
      {
        $sort: { activeTasks: -1, fullName: 1 },
      },
    ]);

    return {
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: inactiveEmployees,
        onLeave: onLeaveEmployees,
      },
      tasks: {
        total: totalTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        cancelled: cancelledTasks,
        overdue: overdueTasks,
      },
      employeeWorkload: workloadAggregation,
    };
  }
}

export default new DashboardService();
