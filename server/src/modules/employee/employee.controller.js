import EmployeeService from './employee.service.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

class EmployeeController {
  listEmployees = asyncHandler(async (req, res) => {
    const { page, limit, all, search, department, status, sortBy, sortOrder } = req.query;
    const result = await EmployeeService.listEmployees({
      page,
      limit,
      all,
      search,
      department,
      status,
      sortBy,
      sortOrder,
    });
    res.status(200).json({
      success: true,
      data: result.employees,
      pagination: result.pagination,
    });
  });

  getEmployeeById = asyncHandler(async (req, res) => {
    const employee = await EmployeeService.getEmployeeById(req.params.id);
    res.status(200).json({
      success: true,
      data: employee,
    });
  });

  createEmployee = asyncHandler(async (req, res) => {
    const employee = await EmployeeService.createEmployee(req.body);
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  });

  updateEmployee = asyncHandler(async (req, res) => {
    const employee = await EmployeeService.updateEmployee(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  });

  deleteEmployee = asyncHandler(async (req, res) => {
    const result = await EmployeeService.deleteEmployee(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  getAssignableEmployees = asyncHandler(async (req, res) => {
    const employees = await EmployeeService.getAssignableEmployees();
    res.status(200).json({
      success: true,
      data: employees,
    });
  });
}

export default new EmployeeController();
