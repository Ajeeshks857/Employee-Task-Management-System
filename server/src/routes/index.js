import express from 'express';
import employeeRoutes from '../modules/employee/employee.routes.js';
import taskRoutes from '../modules/task/task.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';

const router = express.Router();

router.use('/employees', employeeRoutes);
router.use('/tasks', taskRoutes);
router.use('/dashboard', dashboardRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
});

export default router;
