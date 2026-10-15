import express from 'express';
import DashboardController from './dashboard.controller.js';

const router = express.Router();

router.get('/', DashboardController.getDashboardData);

export default router;
