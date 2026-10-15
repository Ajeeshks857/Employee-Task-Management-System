import express from 'express';
import EmployeeController from './employee.controller.js';

const router = express.Router();

router.get('/assignable', EmployeeController.getAssignableEmployees);
router.get('/', EmployeeController.listEmployees);
router.post('/', EmployeeController.createEmployee);
router.get('/:id', EmployeeController.getEmployeeById);
router.put('/:id', EmployeeController.updateEmployee);
router.delete('/:id', EmployeeController.deleteEmployee);

export default router;
